const { Client } = require('pg');
const logger = require('../infrastructure/logger');
const {
  MONITORED_DATABASE_URL
} = require('../../config');

async function taskResponseTime() {

  const client = new Client(MONITORED_DATABASE_URL);

  client.connect();

  const startTime = Date.now()
  await client.query('SELECT id FROM users ORDER BY RANDOM() LIMIT 1');
  const duration = Date.now() - startTime;

  logger.info({ event: 'response-time-millis' , data: duration });

  client.end();
}

module.exports = taskResponseTime;
