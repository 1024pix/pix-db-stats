import { getAppMetrics } from '../infrastructure/database-stats-repository.js';
import { info, error } from '../infrastructure/logger.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import config from '../../config.js';

// Container metrics do not require a database, so they are also collected
// on applications monitored for their containers only
function _getMonitoredApps() {
  return [...new Set([...config.SCALINGO_APPS, ...config.SCALINGO_ADDITIONAL_APPS])];
}

async function taskAppMetrics() {
  for (const scalingoApp of _getMonitoredApps()) {
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
