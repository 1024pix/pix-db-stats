const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');

async function task() {
  const stats = await databaseStatsRepository.getCPULoad();
  logger.info({ event: 'leader-cpu' , data: stats });

  const metrics = await databaseStatsRepository.getDBMetrics();
  logger.info({ event: 'db-metrics', data: metrics });

  const queryStats = await databaseStatsRepository.getQueryStats();

  queryStats.forEach((query) => logger.info({ event: 'db-query-stats', data: query }))

  await databaseStatsRepository.resetQueryStats();
}

module.exports = task;
