import { info, error } from '../infrastructure/logger.js';
import config from '../../config.js';

export const run = async (databaseStatsRepository, scalingoApi) => {
  for (const scalingoApp of config.SCALINGO_APPS) {
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
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'db-queries-metric',
        app: scalingoApp,
      });
    }
  }
};
