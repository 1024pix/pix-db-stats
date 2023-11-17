const { Client } = require('pg');

const getBlockingQueries = async (connectionString) => {
  const client = new Client(connectionString);

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
        EXTRACT(
          epoch
          FROM
            now() - blocking_stm.query_start
        )  :: int AS blocking_duration,
        blocking.mode AS blocking_mode,
        blocking.pid AS blocking_pid,
        blocking.granted AS blocking_granted
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
        AND EXTRACT( epoch FROM now() - blocking_stm.query_start ) :: int >=  ${BLOCKING_QUERIES_MINUTES_THRESHOLD} * 60
        ORDER BY
        waiting_stm.query_start ASC;`);
    return result.rows;
  } finally {
    await client.end();
  }
};

  return false;
const logBlockingQueries = async () => {
};

module.exports = {
  logBlockingQueries,
  getBlockingQueries,
};
