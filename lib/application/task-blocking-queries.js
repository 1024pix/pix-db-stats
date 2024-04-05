import pg from 'pg';
import config from '../../config.js';
import { getPgConnectionString } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';

export const getBlockingQueries = async (connectionString) => {
  const client = new pg.Client(connectionString);

  try {
    await client.connect();
    const result = await client.query(`
      SELECT
        waiting.locktype AS waiting_locktype,
        waiting.relation :: regclass AS waiting_table,
        waiting_stm.query AS waiting_query,
        waiting.mode AS waiting_mode,
        waiting.pid AS waiting_pid,
        blocking.locktype AS blocking_locktype,
        blocking.relation :: regclass AS blocking_table,
        blocking_stm.query AS blocking_query,
        waiting.waitstart as waiting_for_lock_start,
        EXTRACT(
          epoch
          FROM
            now() - waiting.waitstart
        )  :: int AS waiting_for_lock_duration,
        EXTRACT(
          epoch
          FROM
            now() - blocking_stm.query_start
        )  :: int AS blocking_duration,
        EXTRACT(
          epoch
          FROM
            now() - waiting_stm.query_start
        )  :: int AS waiting_duration,
        blocking.mode AS blocking_mode,
        blocking.pid AS blocking_pid,
        blocking.granted AS blocking_granted,
        waiting_stm.usename as waiting_usr,
        blocking_stm.usename as blocking_usr
      FROM
        pg_catalog.pg_locks AS waiting
        JOIN pg_catalog.pg_stat_activity AS waiting_stm ON (
          waiting_stm.pid = waiting.pid
        )
        JOIN pg_catalog.pg_locks AS blocking ON (
          (
            waiting.database = blocking.database
            AND waiting.relation = blocking.relation
          )
          OR waiting.transactionid = blocking.transactionid
        )
        JOIN pg_catalog.pg_stat_activity AS blocking_stm ON (blocking_stm.pid = blocking.pid)
      WHERE
        waiting.pid <> blocking.pid
        AND blocking.granted
        AND EXTRACT( epoch FROM now() - blocking_stm.query_start ) :: int >=  ${config.BLOCKING_QUERIES_MINUTES_THRESHOLD} * 60
        ORDER BY
        waiting_stm.query_start ASC;`);
    return result.rows;
  } finally {
    await client.end();
  }
};

export const logBlockingQueries = async () => {
  const event = 'blocking-queries';
  for (const scalingoApp of config.SCALINGO_APPS) {
    try {
      const connectionString = await getPgConnectionString(scalingoApp);
      const blockingQueries = await getBlockingQueries(connectionString);
      for (const blockingQuery of blockingQueries) {
        info({ event, app: scalingoApp, database: 'postgresql', data: blockingQuery });
      }
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'blocking-queries',
        app: scalingoApp,
      });
    }
  }
};
