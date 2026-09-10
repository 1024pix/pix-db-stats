import { CronTime } from 'cron';

import { getAppMetrics, getApplicationNames } from '../infrastructure/database-stats-repository.js';
import { info, warn, error } from '../infrastructure/logger.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import config, { ALL_APPS } from '../../config.js';

// The Scalingo REST API returns HTTP 429 above this threshold
const API_RATE_LIMIT_PER_MINUTE = 60;

// The task runs every few seconds, so the warning is emitted once per process
// instead of on every run
let hasWarnedAboutApiRateLimit = false;

// Container metrics do not require a database, so they are also collected
// on applications monitored for their containers only
async function _getAdditionalApps() {
  if (config.SCALINGO_ADDITIONAL_APPS !== ALL_APPS) {
    return config.SCALINGO_ADDITIONAL_APPS;
  }

  // The wildcard asks for every application of the Scalingo account, whatever
  // its name, so the list has to be fetched at each run
  try {
    return await getApplicationNames(scalingoApi);
  } catch (errorMessage) {
    error(errorMessage, { task: 'app-metrics' });
    return [];
  }
}

async function _getMonitoredApps() {
  const additionalApps = await _getAdditionalApps();
  return [...new Set([...config.SCALINGO_APPS, ...additionalApps])];
}

// Each monitored application costs one request per run, plus one for their
// listing, so monitoring many applications too often exhausts the API quota
function _warnWhenApiRateLimitMayBeExceeded(monitoredApps) {
  const requestsPerRun = monitoredApps.length + 1;
  const requestsPerMinute = requestsPerRun * _getRunsPerMinute(config.APP_METRICS_SCHEDULE);

  if (requestsPerMinute <= API_RATE_LIMIT_PER_MINUTE || hasWarnedAboutApiRateLimit) {
    return;
  }

  hasWarnedAboutApiRateLimit = true;
  warn(
    `Monitoring ${monitoredApps.length} applications on the ${config.APP_METRICS_SCHEDULE} schedule needs about ${Math.round(requestsPerMinute)} Scalingo API requests per minute, above the ${API_RATE_LIMIT_PER_MINUTE} allowed: use a slower APP_METRICS_SCHEDULE or monitor fewer applications`,
    { task: 'app-metrics' },
  );
}

function _getRunsPerMinute(schedule) {
  const [firstRun, nextRun] = new CronTime(schedule).sendAt(2);
  return 60 / (nextRun.toSeconds() - firstRun.toSeconds());
}

async function taskAppMetrics() {
  const monitoredApps = await _getMonitoredApps();
  _warnWhenApiRateLimitMayBeExceeded(monitoredApps);

  for (const scalingoApp of monitoredApps) {
    try {
      const appMetrics = await getAppMetrics(scalingoApi, scalingoApp);

      for (const { container, memory, cpu } of appMetrics) {
        info({
          event: 'app-metrics',
          app: scalingoApp,
          data: { container, memory, cpu },
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

function forgetApiRateLimitWarning() {
  hasWarnedAboutApiRateLimit = false;
}

export { forgetApiRateLimitWarning };
export default taskAppMetrics;
