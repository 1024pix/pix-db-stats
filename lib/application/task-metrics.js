const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const scalingoApi = require('../infrastructure/scalingo-api');
const logger = require('../infrastructure/logger');
const { SCALINGO_APPS } = require('../../config');

async function taskMetrics() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const databases = await databaseStatsRepository.getAvailableDatabases(scalingoApi, scalingoApp);
      await Promise.all(
        databases.map(async ({ name, id: addonId }) => {
          const metrics = await databaseStatsRepository.getDBMetrics(scalingoApi, scalingoApp, addonId);

          logger.info({
            event: 'db-metrics',
            app: scalingoApp,
            database: name,
            data: metrics,
          });
        })
      );
    } catch (error) {
      logger.error(error, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  });
}

module.exports = taskMetrics;
