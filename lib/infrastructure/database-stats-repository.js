const scalingoApi = require('./scalingo-api');

module.exports = {
  async getCPULoad(scalingoApp) {
    const dbMetrics = await scalingoApi.getDbMetrics(scalingoApp);
    const node = await _getDatabaseLeaderNodeId(scalingoApp);

    return _extractCPUUsageForDatabaseLeaderNode(dbMetrics, node);
  },

  getDBMetrics(scalingoApp) {
    return scalingoApi.getDbMetrics(scalingoApp);
  },

  getDbConnectionString(scalingoApp) {
    return scalingoApi.getDbConnectionString(scalingoApp);
  },

  async getQueryStats(scalingoApp) {
    const { result } = await scalingoApi.getQueryStats(scalingoApp);
    return result || [];
  },

  async resetQueryStats(scalingoApp) {
    await scalingoApi.resetStats(scalingoApp);
  },
}

async function _getDatabaseLeaderNodeId(scalingoApp) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp);
  return instancesStatus
    .filter(({ type, role }) => type === 'db-node' && role === "leader")
    .map(({ id }) => id)[0];
}


function _extractCPUUsageForDatabaseLeaderNode(dbMetrics, node) {
  const {
    instance_id,
    cpu
  } = dbMetrics.instances_metrics[node];
  return { "instance_id": instance_id, "cpu": cpu.usage_in_percents };
}
