import pg from 'pg';
import config from '../../config.js';
import { getPgConnectionStringFromApp } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';

export const getCacheHit = async (connectionString) => {
  const client = new pg.Client(connectionString);

  try {
    await client.connect();
    const result = await client.query(
      `SELECT SUM(blks_hit) * 100 / SUM(blks_hit + blks_read) :: FLOAT AS "cacheHitRatio" FROM pg_stat_database`,
    );
    return result.rows[0].cacheHitRatio;
  } finally {
    await client.end();
  }
};

export const logCacheHits = async () => {
  const event = 'cache-hit-ratio';
  for (const scalingoApp of config.SCALINGO_APPS) {
    try {
      const connectionString = await getPgConnectionStringFromApp(scalingoApp);
      const cacheHit = await getCacheHit(connectionString);
      info({ event, app: scalingoApp, database: 'postgresql', data: { cacheHit } });
    } catch (e) {
      error(e, {
        task: 'cache-hit-ratio',
        app: scalingoApp,
      });
    }
  }
};
