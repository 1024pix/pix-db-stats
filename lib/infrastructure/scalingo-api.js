import { post as httpServicePost, get as httpServiceGet } from './http-service.js';

import config from '../../config.js';
const { SCALINGO_REGION, SCALINGO_TOKEN } = config;

const SCALINGO_API_URL = `https://api.${SCALINGO_REGION}.scalingo.com/v1`;
const SCALINGO_TOKEN_URL = 'https://auth.scalingo.com/v1/tokens/exchange';
const DB_API_URL = `https://db-api.${SCALINGO_REGION}.scalingo.com`;
const addonProvider = 'postgresql';

// The Scalingo REST API allows 60 requests per minute, and every call needs an
// application token, so that token is reused until its expiry instead of being
// exchanged again for each call
const TOKEN_EXPIRY_MARGIN_IN_SECONDS = 60;
let cachedApplicationToken = null;

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

async function getAddons(scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  return _getAddons(scalingoApp, scalingoApplicationToken);
}

async function getApps() {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  return _getApps(scalingoApplicationToken);
}

async function getAppStats(scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  return _getAppStats(scalingoApp, scalingoApplicationToken);
}

async function getDbMetrics(scalingoApp, addonId) {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);
  return _getDbMetrics(addonToken, addonId);
}

async function getDbDisk(scalingoApp, addonId, leaderNodeId) {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getDbDisk(addonToken, addonId, leaderNodeId);
}

async function getDbDiskIO(scalingoApp, addonId, leaderNodeId) {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getDbDiskIO(addonToken, addonId, leaderNodeId);
}

async function getInstancesStatus(scalingoApp, addonId) {
  const addonToken = await _getAddonTokenFromApplication(scalingoApp, addonId);

  return _getInstancesStatus(addonToken, addonId);
}

function getPgConnectionString(scalingoApp) {
  return _getScalingoPgUrl(scalingoApp);
}

async function getPgQueryStats(scalingoApp) {
  const { addonId, token } = await _getScalingoDatabaseAPICredentials(scalingoApp);

  const config = requestConfig(token);
  const { data: stats } = await httpServicePost(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-stat-statements-list',
  });
  return stats;
}

async function getPgRunningQueries(scalingoApp, injectedCredentials = _getScalingoDatabaseAPICredentials) {
  const { addonId, token } = await injectedCredentials(scalingoApp);
  const config = requestConfig(token);
  const { data: stats } = await httpServicePost(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-list-queries',
  });
  return stats;
}

async function resetPgStats(scalingoApp) {
  const { addonId, token } = await _getScalingoDatabaseAPICredentials(scalingoApp);

  const config = requestConfig(token);
  const { data: stats } = await httpServicePost(`${DB_API_URL}/api/databases/${addonId}/action`, config, {
    action_name: 'pg-stat-statements-reset',
  });
  return stats;
}

async function _getScalingoPgUrl(scalingoApp) {
  const scalingoApplicationToken = await _getScalingoApplicationToken();
  const environmentVariables = await _getScalingoEnvVariables(scalingoApp, scalingoApplicationToken);

  return environmentVariables.variables.find((variable) => {
    return variable.name === 'SCALINGO_POSTGRESQL_URL';
  }).value;
}

async function _getScalingoApplicationToken() {
  if (cachedApplicationToken && cachedApplicationToken.expiresAt > Date.now()) {
    return cachedApplicationToken.token;
  }

  const config = { auth: { username: '', password: SCALINGO_TOKEN } };
  const { data } = await httpServicePost(SCALINGO_TOKEN_URL, config);

  cachedApplicationToken = _asCacheableToken(data.token);
  return data.token;
}

// Tokens are JWT whose payload carries their expiry. A token whose expiry
// cannot be read is not cached, so that it is never reused past its lifetime.
function _asCacheableToken(token) {
  const expiryInSeconds = _getTokenExpiryInSeconds(token);
  if (!expiryInSeconds) {
    return null;
  }

  return { token, expiresAt: (expiryInSeconds - TOKEN_EXPIRY_MARGIN_IN_SECONDS) * 1000 };
}

function _getTokenExpiryInSeconds(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp;
  } catch {
    return null;
  }
}

function forgetApplicationToken() {
  cachedApplicationToken = null;
}

async function _getScalingoEnvVariables(scalingoApp, token) {
  const config = requestConfig(token);
  const { data } = await httpServiceGet(`${SCALINGO_API_URL}/apps/${scalingoApp}/variables`, config);
  return data;
}

async function _getAddons(scalingoApp, token) {
  const config = requestConfig(token);
  const { data } = await httpServiceGet(`${SCALINGO_API_URL}/apps/${scalingoApp}/addons`, config);
  return data.addons;
}

async function _getApps(token) {
  const config = requestConfig(token);
  const { data } = await httpServiceGet(`${SCALINGO_API_URL}/apps`, config);
  return data.apps;
}

async function _getAppStats(scalingoApp, token) {
  const config = requestConfig(token);
  const { data } = await httpServiceGet(`${SCALINGO_API_URL}/apps/${scalingoApp}/stats`, config);
  return data.stats;
}

async function _getPgAddonId(scalingoApp, token) {
  const addons = await _getAddons(scalingoApp, token);
  const pgAddon = addons.find((addon) => addon['addon_provider'].id === addonProvider);
  return pgAddon.id;
}

function requestConfig(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function _getDbMetrics(addonToken, addonId) {
  const config = requestConfig(addonToken);
  const { data: metrics } = await httpServiceGet(`${DB_API_URL}/api/databases/${addonId}/metrics`, config);
  return metrics;
}

async function _getDbDisk(addonToken, addonId, instanceId) {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpServiceGet(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/disk?since=3&last=true`,
    config,
  );
  return metrics.disk_metrics[0];
}

async function _getDbDiskIO(addonToken, addonId, instanceId) {
  const config = requestConfig(addonToken);

  const { data: metrics } = await httpServiceGet(
    `${DB_API_URL}/api/databases/${addonId}/instances/${instanceId}/metrics/diskio?since=3&last=true`,
    config,
  );
  return metrics.diskio_metrics[0];
}

async function _getInstancesStatus(addonToken, addonId) {
  const config = requestConfig(addonToken);
  const { data } = await httpServiceGet(`${DB_API_URL}/api/databases/${addonId}/instances_status`, config);
  return data;
}

async function _getAddonToken(scalingoApp, token, addonId) {
  const config = requestConfig(token);
  const url = `${SCALINGO_API_URL}/apps/${scalingoApp}/addons/${addonId}/token`;
  const { data } = await httpServicePost(url, config);
  return data.addon.token;
}

export {
  forgetApplicationToken,
  getAddons,
  getApps,
  getAppStats,
  getDbMetrics,
  getDbDisk,
  getDbDiskIO,
  getInstancesStatus,
  getPgConnectionString,
  getPgQueryStats,
  getPgRunningQueries,
  resetPgStats,
};
