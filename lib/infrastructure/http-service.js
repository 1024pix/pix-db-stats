const axios = require('axios');

module.exports = {
  get(url, config) {
    return axios.get(url, config);
  },

  post(url, config, data = {}) {
    return axios.post(url, data, config);
  },
};
