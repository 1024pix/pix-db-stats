const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');

async function task() {
  const queryStats = await databaseStatsRepository.getQueryStats();

  queryStats.forEach((query) => logger.info({ event: 'db-query-stats', data: query }))

  await databaseStatsRepository.resetQueryStats();
}

module.exports = task;
