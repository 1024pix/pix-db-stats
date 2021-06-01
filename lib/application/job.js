const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');

async function job() {
  const stats = await databaseStatsRepository.getCPULoad();
  logger.info(stats);
}

module.exports = job;