const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    const queryStats = await databaseStatsRepository.getQueryStats(scalingoApp);

    queryStats.forEach((query) => logger.info({ event: 'db-query-stats', app: scalingoApp, data: query }))

    await databaseStatsRepository.resetQueryStats(scalingoApp);
  });
}

module.exports = task;
