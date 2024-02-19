import pg from 'pg';
import { info, error } from '../infrastructure/logger.js';
import { getPgConnectionString } from '../infrastructure/database-stats-repository.js';
import { SCALINGO_APPS, RESPONSE_TIME_QUERY } from '../../config.js';

const { Client } = pg;

export async function taskResponseTime() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const dbURL = await getPgConnectionString(scalingoApp);

      const client = new Client(dbURL);

      client.connect();
      await preventWrites(client);

      const startTime = Date.now();
      await client.query(RESPONSE_TIME_QUERY);
      const duration = Date.now() - startTime;

      info({ event: 'response-time-millis', app: scalingoApp, database: 'postgresql', data: { duration } });

      client.end();
    } catch (e) {
      error(e, {
        task: 'response-time',
        app: scalingoApp,
      });
    }
  });
}

const preventWrites = async (client) => {
  await client.query('SET default_transaction_read_only = ON');
};
