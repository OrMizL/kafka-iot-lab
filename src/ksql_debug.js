// src/debug-ksql.js
import axios from 'axios';

const sql = `SELECT deviceId, minute, avg_temp
             FROM   temp_by_min
             EMIT CHANGES;`;

const body = {
  ksql: sql,                                  // <- key "sql"
  streamsProperties: { 'auto.offset.reset': 'earliest' }  // <- key "properties"
};

(async () => {
  try {
    const res = await axios.post(
      'http://localhost:8088/query',
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',            // force readable body
        timeout: 5000
      }
    );
    console.log('✅ Server accepted (status', res.status, ')');
  } catch (err) {
    const data = err.response?.data;
    if (Buffer.isBuffer(data)) {
      console.error('\n🔥  ksqlDB error (buffer):\n', data.toString());
    } else if (typeof data === 'object') {
      console.error('\n🔥  ksqlDB error (json):\n', JSON.stringify(data, null, 2));
    } else {
      console.error('\n🔥  ksqlDB error (string):\n', data);
    }
  }
})();