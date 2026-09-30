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
            waiting.locktype                         AS waiting_locktype,
            waiting.relation::regclass               AS waiting_table,
            waiting_stm.query                        AS waiting_query,
            waiting.mode                             AS waiting_mode,
            waiting.pid                              AS waiting_pid,
            blocking.locktype                        AS blocking_locktype,
            blocking.relation::regclass              AS blocking_table,
            blocking_stm.query                       AS blocking_query,
            waiting.waitstart                        AS waiting_for_lock_start,
            EXTRACT(epoch FROM now() - waiting.waitstart)::int       AS waiting_for_lock_duration,
            EXTRACT(epoch FROM now() - blocking_stm.query_start)::int AS blocking_duration,
            EXTRACT(epoch FROM now() - waiting_stm.query_start)::int  AS waiting_duration,
            blocking.mode                            AS blocking_mode,
            blocking.pid                             AS blocking_pid,
            blocking.granted                         AS blocking_granted,
            waiting_stm.usename                      AS waiting_usr,
            blocking_stm.usename                     AS blocking_usr
        FROM pg_locks waiting
                 JOIN pg_stat_activity waiting_stm
                      ON waiting_stm.pid = waiting.pid
-- pour chaque verrou en attente, on récupère les PIDs bloquants
                 CROSS JOIN LATERAL unnest(pg_blocking_pids(waiting.pid)) AS b(blocking_pid)
JOIN pg_stat_activity blocking_stm
        ON blocking_stm.pid = b.blocking_pid
-- on rattache le verrou détenu par le bloqueur qui entre en conflit
            JOIN pg_locks blocking
            ON blocking.pid = b.blocking_pid
            AND blocking.locktype = waiting.locktype
            AND blocking.database      IS NOT DISTINCT FROM waiting.database
            AND blocking.relation      IS NOT DISTINCT FROM waiting.relation
            AND blocking.page          IS NOT DISTINCT FROM waiting.page
            AND blocking.tuple         IS NOT DISTINCT FROM waiting.tuple
            AND blocking.virtualxid    IS NOT DISTINCT FROM waiting.virtualxid
            AND blocking.transactionid IS NOT DISTINCT FROM waiting.transactionid
            AND blocking.classid       IS NOT DISTINCT FROM waiting.classid
            AND blocking.objid         IS NOT DISTINCT FROM waiting.objid
            AND blocking.objsubid      IS NOT DISTINCT FROM waiting.objsubid
        WHERE NOT waiting.granted
          AND waiting.pid <> pg_backend_pid()
        ORDER BY blocking_stm.query_start ASC;`);
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
