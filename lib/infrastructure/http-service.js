import axios from 'axios';

export function get(url, config) {
  return axios.get(url, config);
}

export function post(url, config, data = {}) {
  return axios.post(url, data, config);
}
