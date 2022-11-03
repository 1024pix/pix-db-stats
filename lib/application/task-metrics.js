const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const scalingoApi = require('../infrastructure/scalingo-api');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function taskMetrics() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const databases = await databaseStatsRepository.getAvailableDatabases(scalingoApi, scalingoApp);
      databases.forEach(async ({ name, id: addonId }) => {
        const leaderNodeId = await databaseStatsRepository.getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId);
        const metrics = await databaseStatsRepository.getDBMetrics(scalingoApi, scalingoApp, addonId);

        const leaderMetrics = databaseStatsRepository.getInstanceMetrics(metrics, leaderNodeId);

        logger.info({
          event: 'db-metrics',
          app: scalingoApp,
          database: name,
          data: {
            leader_metrics: { ...leaderMetrics, cpu: leaderMetrics.cpu.usage_in_percents },
            database_stats: metrics.database_stats,
          },
        });

        const disk = await databaseStatsRepository.getDBDisk(scalingoApi, scalingoApp, addonId, leaderNodeId);
        logger.info({ event: 'db-disk', app: scalingoApp, database: name, data: disk });

        const diskio = await databaseStatsRepository.getDBDiskIO(scalingoApi, scalingoApp, addonId, leaderNodeId);
        logger.info({ event: 'db-diskio', app: scalingoApp, database: name, data: diskio });
      });
    } catch (error) {
      logger.error(error, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  });
}

module.exports = taskMetrics;
