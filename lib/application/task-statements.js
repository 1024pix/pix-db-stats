import { getPgQueryStats, resetPgQueryStats } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import { SCALINGO_APPS } from '../../config.js';

export async function task() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const queryStats = await getPgQueryStats(scalingoApp);

      queryStats.forEach((query) =>
        info({ event: 'db-query-stats', app: scalingoApp, database: 'postgresql', data: query }),
      );

      await resetPgQueryStats(scalingoApp);
    } catch (e) {
      error(e, {
        task: 'statements',
        app: scalingoApp,
      });
    }
  });
}
