const httpService = require('./http-service');

const { SCALINGO_REGION, SCALINGO_TOKEN, LONG_RUNNING_QUERY_DURATION_SECONDS } = require('../../config');

const SCALINGO_API_URL = `https://api.${SCALINGO_REGION}.scalingo.com/v1`;
const SCALINGO_TOKEN_URL = 'https://auth.scalingo.com/v1/tokens/exchange';
const DB_API_URL = `https://db-api.${SCALINGO_REGION}.scalingo.com`;
const addonProvider = 'postgresql';

const  _getScalingoDatabaseAPICredentials = async function(scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  const addonId = await _getPgAddonId(scalingoApp, scalingoApplicationToken);
  const addonToken = await _getPgAddonToken(
    scalingoApp,
    scalingoApplicationToken,
    addonId
  );

  return { addonId, token: addonToken };
}

module.exports = {
  async getDbMetrics(scalingoApp) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    return _getDbMetrics(token, addonId);
  },

  async getDbDisk(scalingoApp, leaderNodeId) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    return _getDbDisk(token, addonId, leaderNodeId);
  },

  async getDbDiskIO(scalingoApp, leaderNodeId) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    return _getDbDiskIO(token, addonId, leaderNodeId);
  },

  async getInstancesStatus(scalingoApp) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    return _getInstancesStatus(token, addonId);
  },

  async getDbConnectionString(scalingoApp) {
    return _getScalingoPgUrl(scalingoApp);
  },

  async getQueryStats(scalingoApp) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    const config = requestConfig(token);
    const { data: stats } = await httpService.post(
      `${DB_API_URL}/api/databases/${addonId}/action`,
      config,
      { action_name: 'pg-stat-statements-list' }
    );
    return stats;
  },

  async getRunningQueries(
    scalingoApp,
    injectedCredentials = _getScalingoDatabaseAPICredentials
  ) {
    const MICROSECONDS_IN_SECONDS = 1 * 10 ** 6;
    const { addonId, token } = await injectedCredentials(scalingoApp);
    const config = requestConfig(token);
    const { data: stats } = await httpService.post(
      `${DB_API_URL}/api/databases/${addonId}/action`,
      config,
      { action_name: 'pg-list-queries' }
    );
    const runningQueries = stats.result.filter(
      (query) => query.state === 'active'
    );

    const longRunningQueries = stats.result.filter(
      (query) => query.query_duration >= LONG_RUNNING_QUERY_DURATION_SECONDS * MICROSECONDS_IN_SECONDS
    );

    return {
      queriesCount: runningQueries.length,
      longQueries: longRunningQueries
    };
  },

  async resetStats(scalingoApp) {
    const { addonId, token } = await _getScalingoDatabaseAPICredentials(
      scalingoApp
    );

    const config = requestConfig(token);
    const { data: stats } = await httpService.post(
      `${DB_API_URL}/api/databases/${addonId}/action`,
      config,
      { action_name: 'pg-stat-statements-reset' }
    );
    return stats;
  },

};

async function _getScalingoPgUrl(scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  const environmentVariables = await _getScalingoEnvVariables(
    scalingoApp,
    scalingoApplicationToken
  );

  return environmentVariables.variables.find((variable) => {
    return variable.name === 'SCALINGO_POSTGRESQL_URL';
  }).value;
}

async function _getScalingoApplicationToken() {
  const config = { auth: { username: '', password: SCALINGO_TOKEN } };
  let { data } = await httpService.post(SCALINGO_TOKEN_URL, config);

  return data.token;
}

async function _getScalingoEnvVariables(scalingoApp, token) {
  const config = requestConfig(token);
  const { data } = await httpService.get(
    `${SCALINGO_API_URL}/apps/${scalingoApp}/variables`,
    config
  );
  return data;
}

async function _getPgAddonId(scalingoApp, token) {
  const config = requestConfig(token);
  const { data } = await httpService.get(
    `${SCALINGO_API_URL}/apps/${scalingoApp}/addons`,
    config
  );
  const pgAddon = data.addons.find(
    (addon) => addon['addon_provider'].id === addonProvider
  );
  return pgAddon.id;
}

function requestConfig(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function _getDbMetrics(addonToken, addonId) {
  const config = requestConfig(addonToken);
  const { data: metrics } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/metrics`,
    config
  );
  return metrics;
}

async function _getDbDisk(addonToken, addonId, instanceId) {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/disk?since=3&last=true`,
    config
  );
  return metrics.disk_metrics[0];
}

async function _getDbDiskIO(addonToken, addonId, instanceId) {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/diskio?since=3&last=true`,
    config
  );
  return metrics.diskio_metrics[0];
}

async function _getInstancesStatus(addonToken, addonId) {
  const config = requestConfig(addonToken);
  const { data } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/instances_status`,
    config
  );
  return data;
}

async function _getPgAddonToken(scalingoApp, token, addonId) {
  const config = requestConfig(token);
  const url = `${SCALINGO_API_URL}/apps/${scalingoApp}/addons/${addonId}/token`;
  const { data } = await httpService.post(url, config);
  return data.addon.token;
}
