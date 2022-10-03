const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task(databaseStatsRepository) {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    const queryStats = await databaseStatsRepository.getQueryStats(scalingoApp);
    exportQueryStats(queryStats, scalingoApp, logger);
    await databaseStatsRepository.resetQueryStats(scalingoApp);
  });
}

function exportQueryStats(queryStats, scalingoApp, logger=logger) {
    queryStats.forEach(
      (query) => logger.info(
        { event: 'db-query-stats', app: scalingoApp, data: query }
      ));
}

module.exports = task;
