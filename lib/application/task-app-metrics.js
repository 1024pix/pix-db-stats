import { getAppMetrics } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import config from '../../config.js';

async function taskAppMetrics() {
  for (const scalingoApp of config.SCALINGO_APPS) {
    try {
      const appMetrics = await getAppMetrics(scalingoApi, scalingoApp);

      for (const { container, memory } of appMetrics) {
        info({
          event: 'app-metrics',
          app: scalingoApp,
          data: { container, memory },
        });
      }
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'app-metrics',
        app: scalingoApp,
      });
    }
  }
}

export default taskAppMetrics;
