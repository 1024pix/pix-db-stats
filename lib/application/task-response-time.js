const { Client } = require('pg');
const logger = require('../infrastructure/logger');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const { SCALINGO_APPS, RESPONSE_TIME_QUERY } = require('../../config');

const taskResponseTime = async () => {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const dbURL = await databaseStatsRepository.getDbConnectionString(scalingoApp);

      const client = new Client(dbURL);

      client.connect();
      await preventWrites(client);

      const startTime = Date.now();
      await client.query(RESPONSE_TIME_QUERY);
      const duration = Date.now() - startTime;

      logger.info({ event: 'response-time-millis', app: scalingoApp, data: { duration } });

      client.end();
    } catch (error) {
      logger.error(error, {
        task: 'response-time',
        app: scalingoApp,
      });
    }
  });
};

const preventWrites = async (client) => {
  await client.query('SET default_transaction_read_only = ON');
};

module.exports = taskResponseTime;
