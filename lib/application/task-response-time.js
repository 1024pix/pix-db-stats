import pg from 'pg';
import { info, error } from '../infrastructure/logger.js';
import { getPgConnectionString } from '../infrastructure/database-stats-repository.js';
import config from '../../config.js';

const taskResponseTime = async () => {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const dbURL = await getPgConnectionString(scalingoApp);

      const client = new pg.Client(dbURL);

      client.connect();
      await preventWrites(client);

      const startTime = Date.now();
      await client.query(config.RESPONSE_TIME_QUERY);
      const duration = Date.now() - startTime;

      info({ event: 'response-time-millis', app: scalingoApp, database: 'postgresql', data: { duration } });

      client.end();
    } catch (errorMessage) {
      error(errorMessage, {
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
