const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
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
          event: 'db-queries-metric',
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

module.exports = { run: task };
