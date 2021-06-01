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
        const scalingoApplicationToken = await _getScalingoApplicationToken()
        const addonId = await _getPgAddonId(scalingoApplicationToken);
        const dbMetrics = await _getDbMetrics(scalingoApplicationToken, addonId);

        // keep only "Node" instances (drop "gateway", see Scalingo dashboard)
        // Use only dbMetrics.cpu_usage ?
        return Object.entries(dbMetrics.instances_metrics).map(([instanceId, metrics]) => {
            return { [instanceId]: metrics.cpu.usage_in_percents }
        });
    }
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

async function _getDbMetrics(scalingoApplicationToken, addonId) {
    const addonToken = await _getPgAddonToken(scalingoApplicationToken, addonId);
    const config = requestConfig(addonToken)
    const { data: metrics } = await httpService.get(`${DB_API_URL}/api/databases/${addonId}/metrics`, config);
    return metrics;
}

async function _getPgAddonToken(token, addonId) {
    const config = requestConfig(token)
    const url = `${SCALINGO_API_URL}/apps/${SCALINGO_APP}/addons/${addonId}/token`;
    const { data } = await httpService.post(url, config);
    return data.addon.token;
}
