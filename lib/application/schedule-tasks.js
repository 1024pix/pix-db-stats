const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const {
  FT_METRICS,
  FT_STATEMENTS,
  FT_RESPONSE_TIME,
  FT_PROGRESS,
  FT_CACHE_HIT_RATIO,
  METRICS_SCHEDULE,
  STATEMENTS_SCHEDULE,
  RESPONSE_TIME_SCHEDULE,
  PROGRESS_SCHEDULE,
  CACHE_HIT_RATIO_SCHEDULE,
  FT_RUNNING_QUERIES,
  RUNNING_QUERIES_SCHEDULE,
} = require('../../config');
const taskMetrics = require('./task-metrics');
const taskStatements = require('./task-statements');
const taskResponseTime = require('./task-response-time');
const taskProgress = require('./task-progress');
const taskRunningQueries = require('./task-running-queries');
const { logCacheHits: taskCacheHit } = require('./task-cache-hit');

const scalingoApi = require('../infrastructure/scalingo-api');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');

if (FT_METRICS) {
  new CronJob(METRICS_SCHEDULE, taskMetrics, null, true, parisTimezone);
}

if (FT_STATEMENTS) {
  new CronJob(STATEMENTS_SCHEDULE, taskStatements(databaseStatsRepository), null, true, parisTimezone);
}

if (FT_RESPONSE_TIME) {
  new CronJob(RESPONSE_TIME_SCHEDULE, taskResponseTime, null, true, parisTimezone);
}

if (FT_PROGRESS) {
  new CronJob(PROGRESS_SCHEDULE, taskProgress, null, true, parisTimezone);
}

if (FT_CACHE_HIT_RATIO) {
  new CronJob(CACHE_HIT_RATIO_SCHEDULE, taskCacheHit, null, true, parisTimezone);
}

if (FT_RUNNING_QUERIES) {
  new CronJob(
    RUNNING_QUERIES_SCHEDULE,
    taskRunningQueries(databaseStatsRepository, scalingoApi),
    null,
    true,
    parisTimezone
  );
}
