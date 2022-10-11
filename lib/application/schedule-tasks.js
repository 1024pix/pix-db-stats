const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const scheduleTask = ({ schedule, task }) => {
  new CronJob({
    cronTime: schedule,
    onTick: task,
    onComplete: null,
    start: true,
    timezone: parisTimezone,
  });
};

const {
  FT_METRICS,
  METRICS_SCHEDULE,

  FT_STATEMENTS,
  STATEMENTS_SCHEDULE,

  FT_RESPONSE_TIME,
  RESPONSE_TIME_SCHEDULE,

  FT_PROGRESS,
  PROGRESS_SCHEDULE,

  FT_CACHE_HIT_RATIO,
  CACHE_HIT_RATIO_SCHEDULE,

  FT_QUERIES_METRIC,
  QUERIES_METRIC_SCHEDULE,
} = require('../../config');
const taskMetrics = require('./task-metrics');
const taskStatements = require('./task-statements');
const taskResponseTime = require('./task-response-time');
const taskProgress = require('./task-progress');
const taskQueriesMetric = require('./task-queries-metric');
const { logCacheHits: taskCacheHit } = require('./task-cache-hit');

const scalingoApi = require('../infrastructure/scalingo-api');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');

if (!FT_METRICS && !FT_STATEMENTS && !FT_RESPONSE_TIME && !FT_PROGRESS && !FT_CACHE_HIT_RATIO && !FT_QUERIES_METRIC) {
  throw new Error('At least one feature toggle must be active, exiting..');
}

if (FT_METRICS) {
  new CronJob(METRICS_SCHEDULE, taskMetrics, null, true, parisTimezone);
}

if (FT_STATEMENTS) {
  new CronJob(STATEMENTS_SCHEDULE, taskStatements, null, true, parisTimezone);
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

if (FT_QUERIES_METRIC) {
  const queriesMetricTask = async () => {
    await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
  };
  scheduleTask({
    schedule: QUERIES_METRIC_SCHEDULE,
    task: queriesMetricTask,
  });
}
