import { getAvailableDatabases, getDBMetrics } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import config from '../../config.js';

async function taskMetrics() {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const databases = await getAvailableDatabases(scalingoApp);
      await Promise.all(
        databases.map(async ({ name, id: addonId }) => {
          const metrics = await getDBMetrics(scalingoApp, addonId);

          info({
            event: 'db-metrics',
            app: scalingoApp,
            database: name,
            data: metrics,
          });
        }),
      );
    } catch (e) {
      error(e, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  });
}

export default taskMetrics;
