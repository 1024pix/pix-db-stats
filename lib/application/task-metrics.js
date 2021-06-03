const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');

async function taskMetrics() {
  const stats = await databaseStatsRepository.getCPULoad();
  logger.info({ event: 'leader-cpu' , data: stats });

  const metrics = await databaseStatsRepository.getDBMetrics();
  logger.info({ event: 'db-metrics', data: metrics });
}

module.exports = taskMetrics;
