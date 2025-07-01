import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import axios from 'axios';
import { createParser } from 'eventsource-parser';
import readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const fastify = Fastify();
await fastify.register(websocket);

// --- WebSocket endpoint ------------------------------------
fastify.get('/ws/data', { websocket: true }, (conn) => {});

// Helper: push JSON to every live client
function broadcast(obj) {
    const raw = JSON.stringify(obj);
    fastify.websocketServer.clients.forEach(ws => {
        if (ws.readyState === ws.OPEN) ws.send(raw);
    });
}

// --- ksqlDB push query -------------------------------------
const sql = `
  SELECT deviceId, minute, avg_temp
  FROM   temp_by_min
  EMIT CHANGES;
`;

const res = await axios.post(
  `${process.env.KSQL_HOST}/query-stream`,
  {
    sql: sql,
    properties: { 'auto.offset.reset':'latest' }
  },
  {
    responseType: 'stream',
    headers: { 'Content-Type':'application/vnd.ksqlapi.delimited.v1' }
  }
);

res.data.setEncoding('utf8');

let buf = '';
let sawHeader = false;

// feed every chunk
res.data.on('data', chunk => {
    buf += chunk;

    if (!sawHeader) {
        const cut = buf.indexOf('],[');
        if (cut === -1) return;

        buf = buf.slice(cut + 1);
        sawHeader = true;
    }

    let idx;
    while ((idx = buf.indexOf(',[')) !== -1) {
        const json = buf.slice(0, idx);
        buf = buf.slice(idx + 1); // keep "[" for the next item

        processRow(json);
    }
});

res.data.on('end', () => {
  processRow(buf);
  console.error('🔴 ksql stream ended');
});

const processRow = (str) => {
  str = str.trim();
  if (!str) return;
  if (str.startsWith(',[')) str = str.slice(1);   // strip leading comma

  try {
    const arr = JSON.parse(str);

    if (Array.isArray(arr)) {
      const [deviceId, minute, avgTemp] = arr;

      // debug – prove it fires
      console.log('→', deviceId, minute, avgTemp);

      // broadcast to every connected WebSocket client
      fastify.websocketServer.clients.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({ deviceId, minute, avg_temp: avgTemp })
          );
        }
      });
    }
  } catch (e) {
    console.error('JSON parse error', e, 'on', str);
  }
}
// --- Start server ------------------------------------------
await fastify.listen({ port: process.env.PORT });
console.log('🌐  Gateway listening on', process.env.PORT);