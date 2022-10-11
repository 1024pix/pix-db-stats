const scalingoApi = require('./scalingo-api');

module.exports = {
  async getCPULoad(dbMetrics, leaderNodeId) {
    return _extractCPUUsageForDatabaseLeaderNode(dbMetrics, leaderNodeId);
  },

  getDatabaseLeaderNodeId(scalingoApp) {
    return _getDatabaseLeaderNodeId(scalingoApp);
  },

  getDBMetrics(scalingoApp) {
    return scalingoApi.getDbMetrics(scalingoApp);
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

async function _getDatabaseLeaderNodeId(scalingoApp) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp);
  return instancesStatus.filter(({ type, role }) => type === 'db-node' && role === 'leader').map(({ id }) => id)[0];
}

function _extractCPUUsageForDatabaseLeaderNode(dbMetrics, node) {
  const { instance_id, cpu } = dbMetrics.instances_metrics[node];
  return { instance_id: instance_id, cpu: cpu.usage_in_percents };
}
