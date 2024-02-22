import logger from '../infrastructure/logger.js';
import config from '../../config.js';

async function task(databaseStatsRepository, scalingoApi) {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const { activeQueriesCount, slowQueriesCount, slowQueries } = await databaseStatsRepository.getPgQueriesMetric(
        scalingoApi,
        scalingoApp,
      );

      logger.info({
        event: 'db-queries-metric',
        app: scalingoApp,
        database: 'postgresql',
        data: { activeQueriesCount, slowQueriesCount },
      });

      for (const data of slowQueries) {
        logger.info({
          event: 'postgres-slow-queries',
          app: scalingoApp,
          database: 'postgresql',
          data,
        });
      }
    } catch (error) {
      logger.error(error, {
        task: 'db-queries-metric',
        app: scalingoApp,
      });
    }
  });
}

export default { run: task };
