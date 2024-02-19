import { getAvailableDatabases, getDBMetrics } from '../infrastructure/database-stats-repository.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import { error, info } from '../infrastructure/logger.js';
import { SCALINGO_APPS } from '../../config.js';

export async function taskMetrics() {
  SCALINGO_APPS.forEach(async (scalingoApp) => {
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
    } catch (e) {
      error(e, {
        task: 'metrics',
        app: scalingoApp,
      });
    }
  });
}
