const scalingoApi = require('./scalingo-api');

module.exports = {
   async getCPULoad() {
      const dbMetrics = await scalingoApi.getDbMetrics();
      const nodes = await _getDatabaseNodeId();

      return _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes);
   },

   getDBMetrics() {
      return scalingoApi.getDbMetrics();
   },

   async getQueryStats() {
      const {result} = await scalingoApi.getQueryStats();
      return result
   },
}

async function _getDatabaseNodeId() {
   const instancesStatus = await scalingoApi.getInstancesStatus();
   return instancesStatus
      .filter(({type, role}) => type === 'db-node' && role === "leader")
      .map(({id}) => id);
}


function _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes) {
   const {
      instance_id,
      cpu
   } = Object.values(dbMetrics.instances_metrics).find(({instance_id}) => nodes.includes(instance_id));
   return {"instance_id": instance_id, "cpu": cpu.usage_in_percents};
}
