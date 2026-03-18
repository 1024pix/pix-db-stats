import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export function get(url, config) {
  return axios.get(url, config);
}

export function post(url, config, data = {}) {
  return axios.post(url, data, config);
}
