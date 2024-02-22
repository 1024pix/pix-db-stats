import httpService from './http-service.js';
import config from '../../config.js';

const SCALINGO_API_URL = `https://api.${config.SCALINGO_REGION}.scalingo.com/v1`;
const SCALINGO_TOKEN_URL = 'https://auth.scalingo.com/v1/tokens/exchange';
const DB_API_URL = `https://db-api.${config.SCALINGO_REGION}.scalingo.com`;
const addonProvider = 'postgresql';

const _getScalingoDatabaseAPICredentials = async function (scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  const addonId = await _getPgAddonId(scalingoApp, scalingoApplicationToken);
  const addonToken = await _getAddonToken(scalingoApp, scalingoApplicationToken, addonId);

  return { addonId, token: addonToken };
};

const _getAddonTokenFromApplication = async function (scalingoApp, addonId) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  return _getAddonToken(scalingoApp, scalingoApplicationToken, addonId);
};

export const getAddons = async (scalingoApp) => {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  return _getAddons(scalingoApp, scalingoApplicationToken);
};

export const getDbMetrics = async (scalingoApp, addonId) => {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);
  return _getDbMetrics(addonToken, addonId);
};

export const getDbDisk = async (scalingoApp, addonId, leaderNodeId) => {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getDbDisk(addonToken, addonId, leaderNodeId);
};

export const getDbDiskIO = async (scalingoApp, addonId, leaderNodeId) => {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getDbDiskIO(addonToken, addonId, leaderNodeId);
};

export const getInstancesStatus = async (scalingoApp, addonId) => {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getInstancesStatus(addonToken, addonId);
};

export const getPgConnectionString = async (scalingoApp) => {
  return _getScalingoPgUrl(scalingoApp);
};

export const getPgQueryStats = async (scalingoApp) => {
  const { addonId, token } = await _getScalingoDatabaseAPICredentials(scalingoApp);

  const config = requestConfig(token);
  const { data: stats } = await httpService.post(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-stat-statements-list',
  });
  return stats;
};

export const getPgRunningQueries = async (scalingoApp, injectedCredentials = _getScalingoDatabaseAPICredentials) => {
  const { addonId, token } = await injectedCredentials(scalingoApp);
  const config = requestConfig(token);
  const { data: stats } = await httpService.post(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-list-queries',
  });
  return stats;
};

export const resetPgStats = async (scalingoApp) => {
  const { addonId, token } = await _getScalingoDatabaseAPICredentials(scalingoApp);

  const config = requestConfig(token);
  const { data: stats } = await httpService.post(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-stat-statements-reset',
  });
  return stats;
};

const _getScalingoPgUrl = async (scalingoApp) => {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  const environmentVariables = await _getScalingoEnvVariables(scalingoApp, scalingoApplicationToken);

  return environmentVariables.variables.find((variable) => {
    return variable.name === 'SCALINGO_POSTGRESQL_URL';
  }).value;
};

const _getScalingoApplicationToken = async () => {
  const config = { auth: { username: '', password: config.SCALINGO_TOKEN } };
  let { data } = await httpService.post(SCALINGO_TOKEN_URL, config);

  return data.token;
};

const _getScalingoEnvVariables = async (scalingoApp, token) => {
  const config = requestConfig(token);
  const { data } = await httpService.get(`${SCALINGO_API_URL}/apps/${scalingoApp}/variables`, config);
  return data;
};

const _getAddons = async (scalingoApp, token) => {
  const config = requestConfig(token);
  const { data } = await httpService.get(`${SCALINGO_API_URL}/apps/${scalingoApp}/addons`, config);
  return data.addons;
};

const _getPgAddonId = async (scalingoApp, token) => {
  const addons = await _getAddons(scalingoApp, token);
  const pgAddon = addons.find((addon) => addon['addon_provider'].id === addonProvider);
  return pgAddon.id;
};

const requestConfig = (token) => {
  return { headers: { Authorization: `Bearer ${token}` } };
};

const _getDbMetrics = async (addonToken, addonId) => {
  const config = requestConfig(addonToken);
  const { data: metrics } = await httpService.get(`${DB_API_URL}/api/databases/${addonId}/metrics`, config);
  return metrics;
};

const _getDbDisk = async (addonToken, addonId, instanceId) => {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/disk?since=3&last=true`,
    config,
  );
  return metrics.disk_metrics[0];
};

const _getDbDiskIO = async (addonToken, addonId, instanceId) => {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpService.get(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/diskio?since=3&last=true`,
    config,
  );
  return metrics.diskio_metrics[0];
};

const _getInstancesStatus = async (addonToken, addonId) => {
  const config = requestConfig(addonToken);
  const { data } = await httpService.get(`${DB_API_URL}/api/databases/${addonId}/instances_status`, config);
  return data;
};

const _getAddonToken = async (scalingoApp, token, addonId) => {
  const config = requestConfig(token);
  const url = `${SCALINGO_API_URL}/apps/${scalingoApp}/addons/${addonId}/token`;
  const { data } = await httpService.post(url, config);
  return data.addon.token;
};
