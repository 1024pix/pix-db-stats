const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository, scalingoApi) {
  SCALINGO_APPS.forEach(async (applicationName) => {
    const data =
      await databaseStatsRepository.getRunningQueries(scalingoApi, applicationName);


      logger.info({
        event: 'db-running-queries',
        app: applicationName,
        data,
      })
  });
}

module.exports = task;
