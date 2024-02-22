import { getPgQueryStats, resetPgQueryStats } from '../infrastructure/database-stats-repository.js';
import logger from '../infrastructure/logger.js';
import config from '../../config.js';

async function task() {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const queryStats = await getPgQueryStats(scalingoApp);

      queryStats.forEach((query) =>
        logger.info({ event: 'db-query-stats', app: scalingoApp, database: 'postgresql', data: query }),
      );

      await resetPgQueryStats(scalingoApp);
    } catch (error) {
      logger.error(error, {
        task: 'statements',
        app: scalingoApp,
      });
    }
  });
}

export default task;
