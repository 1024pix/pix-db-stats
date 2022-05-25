const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APP } = require('../../config');

async function taskMetrics() {
  const stats = await databaseStatsRepository.getCPULoad();
  logger.info({ event: 'leader-cpu', app: SCALINGO_APP, data: stats });

  const metrics = await databaseStatsRepository.getDBMetrics();
  logger.info({ event: 'db-metrics', app: SCALINGO_APP, data: metrics });
}

module.exports = taskMetrics;
