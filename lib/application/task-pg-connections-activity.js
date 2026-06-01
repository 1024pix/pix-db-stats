import pg from 'pg';
import { getPgConnectionString } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';

const _getPgConnectionsActivity = async (connectionString) => {
  const client = new pg.Client(connectionString);

  try {
    await client.connect();
    const result = await client.query(`
      SELECT application_name, state, count(*)
        FROM pg_stat_activity
        GROUP BY application_name, state;`);
    return result.rows;
  } finally {
    await client.end();
  }
};

export const pgConnectionsActivity = async () => {
  const event = 'pg-connections-activity';

  try {
    const connectionString = await getPgConnectionString('pix-api-production');
    const connectionsActivity = await _getPgConnectionsActivity(connectionString);
    for (const connectionActivity of connectionsActivity) {
      info({
        event,
        app: 'pix-api-production',
        database: 'postgres',
        data: connectionActivity,
      });
    }
  } catch (err) {
    error(err, {
      task: 'pg-connections-activity',
      app: 'pix-api-production',
    });
  }
};
