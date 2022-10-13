const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const data = await databaseStatsRepository.getQueriesMetric(scalingoApi, scalingoApp);

      logger.info({
        event: 'db-queries-metric',
        app: scalingoApp,
        data,
      });
    } catch (error) {
      logger.error(error, {
        task: 'db-queries-metric',
        app: scalingoApp,
      });
    }
  });
}

module.exports = { run: task };
