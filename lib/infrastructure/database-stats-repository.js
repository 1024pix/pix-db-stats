const scalingoApi = require('./scalingo-api');

module.exports = {
  async getCPULoad(scalingoApp) {
    const dbMetrics = await scalingoApi.getDbMetrics(scalingoApp);
    const nodes = await _getDatabaseNodeId(scalingoApp);

    return _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes);
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

async function _getDatabaseNodeId(scalingoApp) {
  const instancesStatus = await scalingoApi.getInstancesStatus(scalingoApp);
  return instancesStatus
    .filter(({ type, role }) => type === 'db-node' && role === "leader")
    .map(({ id }) => id);
}


function _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes) {
  const {
    instance_id,
    cpu
  } = Object.values(dbMetrics.instances_metrics).find(({ instance_id }) => nodes.includes(instance_id));
  return { "instance_id": instance_id, "cpu": cpu.usage_in_percents };
}
