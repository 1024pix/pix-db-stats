import pg from 'pg';
import logger from '../infrastructure/logger.js';
import { getPgConnectionStringFromApp } from '../infrastructure/database-stats-repository.js';
import config from '../../config.js';

const taskResponseTime = async () => {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const dbURL = await getPgConnectionStringFromApp(scalingoApp);

      const client = new pg.Client(dbURL);

      client.connect();
      await preventWrites(client);

      const startTime = Date.now();
      await client.query(config.RESPONSE_TIME_QUERY);
      const duration = Date.now() - startTime;

      logger.info({ event: 'response-time-millis', app: scalingoApp, database: 'postgresql', data: { duration } });

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

export default taskResponseTime;
