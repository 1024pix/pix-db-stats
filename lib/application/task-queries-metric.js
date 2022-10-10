const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (applicationName) => {
    try {
      const data = await databaseStatsRepository.getQueriesMetric(scalingoApi, applicationName);

      logger.info({
        event: 'db-queries-metric',
        app: applicationName,
        data,
      });
    } catch (error) {
      logger.error({
        task: 'db-queries-metric',
        message: error.message.slice(0, 1000),
        error: error.response.data.error,
      });
    }
  });
}

module.exports = { run: task };
