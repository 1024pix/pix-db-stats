const httpService = require('./http-service');
const {
    SCALINGO_APP,
    SCALINGO_TOKEN,
} = require('../../config');

const SCALINGO_API_URL = 'https://api.osc-secnum-fr1.scalingo.com/v1';
const SCALINGO_TOKEN_URL = 'https://auth.scalingo.com/v1/tokens/exchange';
const DB_API_URL = 'https://db-api.osc-secnum-fr1.scalingo.com';
const addonProvider = 'postgresql';

module.exports = {
    async getCPULoad() {
        const { addonId, token } = await _getScalingoDatabaseAPICredentials();

        const dbMetrics = await _getDbMetrics(token, addonId);
        const nodes = await _getDatabaseNodeId(token, addonId);

        return _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes);
    }
}

async function _getScalingoDatabaseAPICredentials() {
    const scalingoApplicationToken = await _getScalingoApplicationToken()
    const addonId = await _getPgAddonId(scalingoApplicationToken);
    const addonToken = await _getPgAddonToken(scalingoApplicationToken, addonId);

    return { addonId, token: addonToken }
}

async function _getScalingoApplicationToken() {
    const config = { auth : { username: '', password: SCALINGO_TOKEN }};
    let { data }= await httpService.post(SCALINGO_TOKEN_URL, config);

    return data.token;
}


async function _getPgAddonId(token) {
    const config = requestConfig(token)
    const { data } = await httpService.get(`${SCALINGO_API_URL}/apps/${SCALINGO_APP}/addons`, config);
    const pgAddon = data.addons.find(addon => addon['addon_provider'].id === addonProvider);
    return pgAddon.id;
}

function requestConfig(token) {
    return { headers: { Authorization: `Bearer ${token}` } };
}

async function _getDbMetrics(addonToken, addonId) {
    const config = requestConfig(addonToken)
    const { data: metrics } = await httpService.get(`${DB_API_URL}/api/databases/${addonId}/metrics`, config);
    return metrics;
}

async function _getDatabaseNodeId(addonToken, addonId) {
    const config = requestConfig(addonToken)
    const { data } = await httpService.get(`${DB_API_URL}/api/databases/${addonId}/instances_status`, config);
    return data
        .filter(({ type, role }) => type === 'db-node' && role === "leader")
        .map(({ id }) => id);
}

async function _getPgAddonToken(token, addonId) {
    const config = requestConfig(token)
    const url = `${SCALINGO_API_URL}/apps/${SCALINGO_APP}/addons/${addonId}/token`;
    const { data } = await httpService.post(url, config);
    return data.addon.token;
}

function _extractCPUUsageForDatabaseLeaderNode(dbMetrics, nodes) {
    const { instance_id, cpu } = Object.values(dbMetrics.instances_metrics).find(({instance_id}) => nodes.includes(instance_id));
    return { 'instance_id': instance_id, cpu: cpu.usage_in_percents };
}
