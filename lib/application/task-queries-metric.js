import { info, error } from '../infrastructure/logger.js';
import config from '../../config.js';

export const run = async (databaseStatsRepository, scalingoApi) => {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
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
};
