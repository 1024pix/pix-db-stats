const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const queryStats = await databaseStatsRepository.getQueryStats(scalingoApp);

      queryStats.forEach((query) => logger.info({ event: 'db-query-stats', app: scalingoApp, data: query }));

      await databaseStatsRepository.resetQueryStats(scalingoApp);
    } catch (error) {
      logger.error({ task: 'statements', message: error.message.slice(0, 1000), error: error.response.data.error });
    }
  });
}

module.exports = task;
