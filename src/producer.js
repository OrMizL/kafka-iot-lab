import { Kafka } from 'kafkajs';
import { faker } from '@faker-js/faker';

const kafka = new Kafka({ clientId: 'sensor-sim', brokers: ['localhost:29092'] });
const producer = kafka.producer();

(async () => {
  await producer.connect();
  console.log('🟢  Producer up');
  setInterval(async () => {
    const msg = {
      deviceId: `dev-${faker.number.int({ min: 1, max: 5 })}`,
      ts: Date.now(),
      temperature: faker.number.float({ min: 18, max: 30, precision: 0.1 }),
    };
    await producer.send({ topic: 'sensor_raw', messages: [{ value: JSON.stringify(msg) }]});
    console.log('→', msg);
  }, 1000);
})();