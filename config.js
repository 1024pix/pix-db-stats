require('dotenv').config();

const DEFAULT_RESPONSE_TIME_QUERY = 'SELECT pg_sleep(1)';
const DEFAULT_PROGRESS_SCHEDULE = '0 */10 * * * *';

module.exports = {
  SCALINGO_REGION: process.env.SCALINGO_REGION,
  SCALINGO_APP: process.env.SCALINGO_APP,
  SCALINGO_TOKEN: process.env.SCALINGO_TOKEN,
  FT_METRICS: process.env.FT_METRICS === 'yes',
  FT_STATEMENTS: process.env.FT_STATEMENTS === 'yes',
  FT_RESPONSE_TIME: process.env.FT_RESPONSE_TIME === 'yes',
  FT_PROGRESS: process.env.FT_PROGRESS === 'yes',
  METRICS_SCHEDULE: process.env.METRICS_SCHEDULE,
  STATEMENTS_SCHEDULE: process.env.STATEMENTS_SCHEDULE,
  RESPONSE_TIME_SCHEDULE: process.env.RESPONSE_TIME_SCHEDULE,
  RESPONSE_TIME_QUERY: process.env.RESPONSE_TIME_QUERY || DEFAULT_RESPONSE_TIME_QUERY ,
  MONITORED_DATABASE_URL: process.env.MONITORED_DATABASE_URL,
  PROGRESS_SCHEDULE: process.env.PROGRESS_SCHEDULE || DEFAULT_PROGRESS_SCHEDULE,
};
