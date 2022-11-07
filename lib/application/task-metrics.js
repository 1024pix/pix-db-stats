const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function taskMetrics() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const leaderNodeId = await databaseStatsRepository.getDatabaseLeaderNodeId(scalingoApp);
      const metrics = await databaseStatsRepository.getDBMetrics(scalingoApp);

      const leaderMetrics = databaseStatsRepository.getInstanceMetrics(metrics, leaderNodeId);

      logger.info({
        event: 'db-metrics',
        app: scalingoApp,
        data: {
          leader_metrics: { ...leaderMetrics, cpu: leaderMetrics.cpu.usage_in_percents },
          database_stats: metrics.database_stats,
        },
      });

      const disk = await databaseStatsRepository.getDBDisk(scalingoApp, leaderNodeId);
      logger.info({ event: 'db-disk', app: scalingoApp, data: disk });

      const diskio = await databaseStatsRepository.getDBDiskIO(scalingoApp, leaderNodeId);
      logger.info({ event: 'db-diskio', app: scalingoApp, data: diskio });
    } catch (error) {
      logger.error(error, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  });
}

module.exports = taskMetrics;
