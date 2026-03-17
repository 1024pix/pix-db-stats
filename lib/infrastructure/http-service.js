import axios from 'axios';
import axiosRetry from 'axios-retry';

export function get(url, config) {
  axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
  return axios.get(url, config);
}

export function post(url, config, data = {}) {
  axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
  return axios.post(url, data, config);
}
