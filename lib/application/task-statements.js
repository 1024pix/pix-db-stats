const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APP } = require('../../config');

async function task() {
  const queryStats = await databaseStatsRepository.getQueryStats();

  queryStats.forEach((query) => logger.info({ event: 'db-query-stats', app: SCALINGO_APP, data: query }))

  await databaseStatsRepository.resetQueryStats();
}

module.exports = task;
