import * as scalingoApi from './scalingo-api.js';
import config from '../../config.js';

const QUERY_MAX_LENGTH = 250;

const TRUNCATE_STRING_SUFFIX = '...';
const { SLOW_QUERY_DURATION_NANO_THRESHOLD } = config;

function truncate(queryString) {
  if (queryString.length > QUERY_MAX_LENGTH) {
    return queryString.slice(0, QUERY_MAX_LENGTH) + TRUNCATE_STRING_SUFFIX;
  }
  return queryString;
}

export async function getAvailableDatabases(scalingoApi, scalingoApp) {
  const addons = await scalingoApi.getAddons(scalingoApp);

  return addons
    .filter((addon) => {
      return ['postgresql', 'redis'].includes(addon.addon_provider.id);
    })
    .map((addon) => {
      return {
        id: addon.id,
        name: addon.addon_provider.id,
      };
    });
}

export async function getDBMetrics(scalingoApi, scalingoApp, addonId) {
  const leaderNodeId = await _getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId);
  const metrics = await scalingoApi.getDbMetrics(scalingoApp, addonId);
  const leaderMetrics = metrics.instances_metrics[leaderNodeId];
  const { disk_used, disk_total } = await scalingoApi.getDbDisk(scalingoApp, addonId, leaderNodeId);
  const { diskio_reads, diskio_writes } = await scalingoApi.getDbDiskIO(scalingoApp, addonId, leaderNodeId);
  return {
    leader_metrics: {
      ...leaderMetrics,
      cpu: leaderMetrics.cpu.usage_in_percents,
      disk: { used: disk_used, total: disk_total },
      diskio: { reads: diskio_reads, writes: diskio_writes },
    },
    database_stats: metrics.database_stats,
  };
}

export async function getPgConnectionString(scalingoApp) {
  return scalingoApi.getPgConnectionString(scalingoApp);
}

export async function getPgQueryStats(scalingoApp) {
  const { result } = await scalingoApi.getPgQueryStats(scalingoApp);
  return result || [];
}

export async function getPgQueriesMetric(injectedScalingoApi = scalingoApi, scalingoApp) {
  const { result: queries } = await injectedScalingoApi.getPgRunningQueries(scalingoApp);

  const activeQueries = queries.filter((query) => query.state === 'active');

  const slowQueries = activeQueries
    .filter((query) => query.query_duration >= SLOW_QUERY_DURATION_NANO_THRESHOLD)
    .map((runningQuery) => {
      return {
        query: truncate(runningQuery.query),
        duration: runningQuery.query_duration,
        usr: runningQuery.username,
        pid: runningQuery.pid,
      };
    });

  return {
    activeQueriesCount: activeQueries.length,
    slowQueriesCount: slowQueries.length,
    slowQueries,
  };
}

export async function resetPgQueryStats(scalingoApp) {
  await scalingoApi.resetPgStats(scalingoApp);
}

async function _getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp, addonId);
  return instancesStatus.filter(({ type, role }) => type === 'db-node' && role === 'leader').map(({ id }) => id)[0];
}
