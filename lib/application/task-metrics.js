import { getAvailableDatabases, getDBMetrics } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import config from '../../config.js';

async function taskMetrics() {
  for (const scalingoApp of config.SCALINGO_APPS) {
    try {
      const databases = await getAvailableDatabases(scalingoApi, scalingoApp);
      await Promise.all(
        databases.map(async ({ name, id: addonId }) => {
          const metrics = await getDBMetrics(scalingoApi, scalingoApp, addonId);

          info({
            event: 'db-metrics',
            app: scalingoApp,
            database: name,
            data: metrics,
          });
        }),
      );
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  }
}

export default taskMetrics;
