const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function task() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const queryStats = await databaseStatsRepository.getPgQueryStats(scalingoApp);

      queryStats.forEach((query) =>
        logger.info({ event: 'db-query-stats', app: scalingoApp, database: 'postgresql', data: query })
      );

      await databaseStatsRepository.resetPgQueryStats(scalingoApp);
    } catch (error) {
      logger.error(error, {
        task: 'statements',
        app: scalingoApp,
      });
    }
  });
}

module.exports = task;
