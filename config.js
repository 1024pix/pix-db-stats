import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const eachSecond = '* * * * * *';

const DEFAULT_RESPONSE_TIME_QUERY = 'SELECT pg_sleep(1)';
const DEFAULT_PROGRESS_SCHEDULE = '0 */10 * * * *';
const DEFAULT_CACHE_HIT_RATIO_SCHEDULE = '0 */10 * * * *';
const DEFAULT_QUERIES_METRIC_SCHEDULE = '* * * * * *';
const DEFAULT_BLOCKING_QUERIES_SCHEDULE = '0 */10 * * * *';
function _isFeatureEnabled(valueString) {
  return valueString === 'yes';
}

const config = {
  SCALINGO_REGION: process.env.SCALINGO_REGION,
  SCALINGO_APPS: JSON.parse(process.env.SCALINGO_APPS || '[]'),
  SCALINGO_TOKEN: process.env.SCALINGO_TOKEN,
  FT_METRICS: _isFeatureEnabled(process.env.FT_METRICS),
  FT_STATEMENTS: _isFeatureEnabled(process.env.FT_STATEMENTS),
  FT_RESPONSE_TIME: _isFeatureEnabled(process.env.FT_RESPONSE_TIME),
  FT_PROGRESS: _isFeatureEnabled(process.env.FT_PROGRESS),
  FT_CACHE_HIT_RATIO: _isFeatureEnabled(process.env.FT_CACHE_HIT_RATIO),
  FT_QUERIES_METRIC: _isFeatureEnabled(process.env.FT_QUERIES_METRIC),
  FT_BLOCKING_QUERIES: _isFeatureEnabled(process.env.FT_BLOCKING_QUERIES),
  METRICS_SCHEDULE: process.env.METRICS_SCHEDULE,
  STATEMENTS_SCHEDULE: process.env.STATEMENTS_SCHEDULE,
  RESPONSE_TIME_SCHEDULE: process.env.RESPONSE_TIME_SCHEDULE,
  RESPONSE_TIME_QUERY: process.env.RESPONSE_TIME_QUERY || DEFAULT_RESPONSE_TIME_QUERY,
  PROGRESS_SCHEDULE: process.env.PROGRESS_SCHEDULE || DEFAULT_PROGRESS_SCHEDULE,
  CACHE_HIT_RATIO_SCHEDULE: process.env.CACHE_HIT_RATIO_SCHEDULE || DEFAULT_CACHE_HIT_RATIO_SCHEDULE,
  QUERIES_METRIC_SCHEDULE: process.env.QUERIES_METRIC_SCHEDULE || DEFAULT_QUERIES_METRIC_SCHEDULE,
  BLOCKING_QUERIES_SCHEDULE: process.env.BLOCKING_QUERIES_SCHEDULE || DEFAULT_BLOCKING_QUERIES_SCHEDULE,
  SLOW_QUERY_DURATION_NANO_THRESHOLD: (process.env.SLOW_QUERY_DURATION_SECONDS_THRESHOLD || 5 * 60) * 10 ** 9,
  BLOCKING_QUERIES_MINUTES_THRESHOLD: process.env.BLOCKING_QUERIES_MINUTES_THRESHOLD || 15,
};

if (process.env.NODE_ENV === 'test') {
  config.SCALINGO_REGION = 'REGION';
  config.SCALINGO_APPS = ['application-1', 'application-2'];
  config.FT_QUERIES_METRIC = true;
  config.QUERIES_METRIC_SCHEDULE = eachSecond;
  config.BLOCKING_QUERIES_SCHEDULE = eachSecond;
  config.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user@localhost:5432/db-stats';
  config.BLOCKING_QUERIES_MINUTES_THRESHOLD = process.env.BLOCKING_QUERIES_MINUTES_THRESHOLD = 0;
}

export default config;
