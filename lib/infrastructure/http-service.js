const axios = require('axios');

module.exports = {
    get (url, config) {
        return axios.get(url, config);
    },

    post (url, config) {
        return axios.post(url, {}, config);
    },
}