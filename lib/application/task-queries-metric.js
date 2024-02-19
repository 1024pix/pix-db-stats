import { info, error } from '../infrastructure/logger.js';
import { SCALINGO_APPS } from '../../config.js';

export async function run(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const { activeQueriesCount, slowQueriesCount, slowQueries } = await databaseStatsRepository.getPgQueriesMetric(
        scalingoApi,
        scalingoApp,
      );

      info({
        event: 'db-queries-metric',
        app: scalingoApp,
        database: 'postgresql',
        data: { activeQueriesCount, slowQueriesCount },
      });

      for (const data of slowQueries) {
        info({
          event: 'postgres-slow-queries',
          app: scalingoApp,
          database: 'postgresql',
          data,
        });
      }
    } catch (e) {
      error(e, {
        task: 'db-queries-metric',
        app: scalingoApp,
      });
    }
  });
}
