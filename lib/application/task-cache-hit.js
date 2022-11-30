const { Client } = require('pg');
const { SCALINGO_APPS } = require('../../config');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');

const getCacheHit = async (connectionString) => {
  const client = new Client(connectionString);

  try {
    await client.connect();
    const result = await client.query(
      `SELECT SUM(blks_hit) * 100 / SUM(blks_hit + blks_read) :: FLOAT AS "cacheHitRatio" FROM pg_stat_database`
    );
    return result.rows[0].cacheHitRatio;
  } finally {
    await client.end();
  }
};

const logCacheHits = async () => {
  const event = 'cache-hit-ratio';
  for (const scalingoApp of SCALINGO_APPS) {
    try {
      const connectionString = await databaseStatsRepository.getPgConnectionString(scalingoApp);
      const cacheHit = await getCacheHit(connectionString);
      logger.info({ event, app: scalingoApp, database: 'postgresql', data: { cacheHit } });
    } catch (error) {
      logger.error(error, {
        task: 'cache-hit-ratio',
        app: scalingoApp,
      });
    }
  }
};

module.exports = { getCacheHit, logCacheHits };
