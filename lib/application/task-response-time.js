const { Client } = require('pg');
const logger = require('../infrastructure/logger');
const {
  MONITORED_DATABASE_URL,
  RESPONSE_TIME_QUERY,
} = require('../../config');

const taskResponseTime = async ()=>{

  const client = new Client(MONITORED_DATABASE_URL);

  client.connect();
  await preventWrites(client);

  const startTime = Date.now();
  await client.query(RESPONSE_TIME_QUERY);
  const duration = Date.now() - startTime;

  logger.info({ event: 'response-time-millis' , data: { duration } });

  client.end();
}

const preventWrites = async (client)=>{
  await client.query('SET default_transaction_read_only = ON');
}

module.exports = taskResponseTime;
