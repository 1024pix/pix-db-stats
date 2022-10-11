const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (applicationName) => {
    const data = await databaseStatsRepository.getQueriesMetric(scalingoApi, applicationName);

    logger.info({
      event: 'db-queries-metric',
      app: applicationName,
      data,
    });
  });
}

module.exports = { run: task };
