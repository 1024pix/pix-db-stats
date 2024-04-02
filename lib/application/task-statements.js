import { getPgQueryStats, resetPgQueryStats } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import config from '../../config.js';

async function task() {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const queryStats = await getPgQueryStats(scalingoApp);

      queryStats.forEach((query) =>
        info({ event: 'db-query-stats', app: scalingoApp, database: 'postgresql', data: query }),
      );

      await resetPgQueryStats(scalingoApp);
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'statements',
        app: scalingoApp,
      });
    }
  });
}

export default task;
