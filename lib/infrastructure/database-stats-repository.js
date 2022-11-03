const scalingoApi = require('./scalingo-api');

module.exports = {
  async getAvailableDatabases(scalingoApi, scalingoApp) {
    const addons = await scalingoApi.getAddons(scalingoApp);

    return addons
      .filter((addon) => {
        return addon.addon_provider.id === 'postgresql';
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

  async getDBDisk(scalingoApp, leaderNodeId) {
    const { disk_used, disk_total } = await scalingoApi.getDbDisk(scalingoApp, leaderNodeId);
    return { disk_total, disk_used };
  },

  async getDBDiskIO(scalingoApp, leaderNodeId) {
    const { diskio_reads, diskio_writes } = await scalingoApi.getDbDiskIO(scalingoApp, leaderNodeId);
    return { diskio_reads, diskio_writes };
  },

  getDbConnectionString(scalingoApp) {
    return scalingoApi.getDbConnectionString(scalingoApp);
  },

  async getQueryStats(scalingoApp) {
    const { result } = await scalingoApi.getQueryStats(scalingoApp);
    return result || [];
  },

  async getQueriesMetric(injectedScalingoApi = scalingoApi, scalingoApp) {
    const { result: queries } = await injectedScalingoApi.getRunningQueries(scalingoApp);
    const activeQueries = queries.filter((query) => query.state === 'active');

    return {
      activeQueriesCount: activeQueries.length,
    };
  },

  async resetQueryStats(scalingoApp) {
    await scalingoApi.resetStats(scalingoApp);
  },
};

async function _getDatabaseLeaderNodeId(scalingoApi, scalingoApp, addonId) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp, addonId);
  return instancesStatus.filter(({ type, role }) => type === 'db-node' && role === 'leader').map(({ id }) => id)[0];
}
