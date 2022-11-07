const scalingoApi = require('./scalingo-api');

module.exports = {
  async getAvailableDatabases(scalingoApi, scalingoApp) {
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
  },

  getInstanceMetrics(dbMetrics, instanceId) {
    return dbMetrics.instances_metrics[instanceId];
  },

  getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId) {
    return _getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId);
  },

  getDBMetrics(scalingoApi, scalingoApp, addonId) {
    return scalingoApi.getDbMetrics(scalingoApp, addonId);
  },

  async getDBDisk(scalingoApi, scalingoApp, addonId, leaderNodeId) {
    const { disk_used, disk_total } = await scalingoApi.getDbDisk(scalingoApp, addonId, leaderNodeId);
    return { disk_total, disk_used };
  },

  async getDBDiskIO(scalingoApi, scalingoApp, addonId, leaderNodeId) {
    const { diskio_reads, diskio_writes } = await scalingoApi.getDbDiskIO(scalingoApp, addonId, leaderNodeId);
    return { diskio_reads, diskio_writes };
  },

  getPgConnectionString(scalingoApp) {
    return scalingoApi.getPgConnectionString(scalingoApp);
  },

  async getPgQueryStats(scalingoApp) {
    const { result } = await scalingoApi.getPgQueryStats(scalingoApp);
    return result || [];
  },

  async getPgQueriesMetric(injectedScalingoApi = scalingoApi, scalingoApp) {
    const { result: queries } = await injectedScalingoApi.getPgRunningQueries(scalingoApp);
    const activeQueries = queries.filter((query) => query.state === 'active');

    return {
      activeQueriesCount: activeQueries.length,
    };
  },

  async resetPgQueryStats(scalingoApp) {
    await scalingoApi.resetPgStats(scalingoApp);
  },
};

async function _getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp, addonId);
  return instancesStatus.filter(({ type, role }) => type === 'db-node' && role === 'leader').map(({ id }) => id)[0];
}
