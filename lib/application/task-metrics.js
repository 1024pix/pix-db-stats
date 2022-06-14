const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function taskMetrics() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    const stats = await databaseStatsRepository.getCPULoad(scalingoApp);
    logger.info({ event: 'leader-cpu', app: scalingoApp, data: stats });

    const metrics = await databaseStatsRepository.getDBMetrics(scalingoApp);
    logger.info({ event: 'db-metrics', app: scalingoApp, data: metrics });
  })
}

module.exports = taskMetrics;
