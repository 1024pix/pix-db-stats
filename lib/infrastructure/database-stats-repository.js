import {
  getAddons,
  getDbMetrics,
  getDbDisk,
  getDbDiskIO,
  getPgConnectionString,
  getInstancesStatus,
  resetPgStats,
  getPgRunningQueries,
} from './scalingo-api.js';
import config from '../../config.js';

const QUERY_MAX_LENGTH = 250;

const TRUNCATE_STRING_SUFFIX = '...';

function truncate(queryString) {
  if (queryString.length > QUERY_MAX_LENGTH) {
    return queryString.slice(0, QUERY_MAX_LENGTH) + TRUNCATE_STRING_SUFFIX;
  }
  return queryString;
}

export const getAvailableDatabases = async (scalingoApp) => {
  const addons = await getAddons(scalingoApp);

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
};

export const getDBMetrics = async (scalingoApp, addonId) => {
  const leaderNodeId = await _getDatabaseLeaderNodeId(scalingoApp, addonId);
  const metrics = await getDbMetrics(scalingoApp, addonId);
  const leaderMetrics = metrics.instances_metrics[leaderNodeId];
  const { disk_used, disk_total } = await getDbDisk(scalingoApp, addonId, leaderNodeId);
  const { diskio_reads, diskio_writes } = await getDbDiskIO(scalingoApp, addonId, leaderNodeId);
  return {
    leader_metrics: {
      ...leaderMetrics,
      cpu: leaderMetrics.cpu.usage_in_percents,
      disk: { used: disk_used, total: disk_total },
      diskio: { reads: diskio_reads, writes: diskio_writes },
    },
    database_stats: metrics.database_stats,
  };
};

export const getPgConnectionStringFromApp = (scalingoApp) => {
  return getPgConnectionString(scalingoApp);
};

export const getPgQueryStats = async (scalingoApp) => {
  const { result } = await getPgQueryStats(scalingoApp);
  return result || [];
};

export const getPgQueriesMetric = async (scalingoApp) => {
  const { result: queries } = await getPgRunningQueries(scalingoApp);

  const activeQueries = queries.filter((query) => query.state === 'active');

  const slowQueries = activeQueries
    .filter((query) => query.query_duration >= config.SLOW_QUERY_DURATION_NANO_THRESHOLD)
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
};

export const resetPgQueryStats = async (scalingoApp) => {
  await resetPgStats(scalingoApp);
};

export const _getDatabaseLeaderNodeId = async (scalingoApp, addonId) => {
  const instancesStatus = await getInstancesStatus(scalingoApp, addonId);
  return instancesStatus.filter(({ type, role }) => type === 'db-node' && role === 'leader').map(({ id }) => id)[0];
};
