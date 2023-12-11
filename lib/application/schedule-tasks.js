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

  FT_BLOCKING_QUERIES,
  BLOCKING_QUERIES_SCHEDULE,
} = require('../../config');
const taskMetrics = require('./task-metrics');
const taskStatements = require('./task-statements');
const taskResponseTime = require('./task-response-time');
const taskProgress = require('./task-progress');
const taskQueriesMetric = require('./task-queries-metric');
const { logCacheHits: taskCacheHit } = require('./task-cache-hit');
const { logBlockingQueries: taskBlockingQueries } = require('./task-blocking-queries');
const scalingoApi = require('../infrastructure/scalingo-api');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');

const tasks = [
  {
    name: 'metrics',
    enabled: FT_METRICS,
    schedule: METRICS_SCHEDULE,
    task: taskMetrics,
  },
  {
    name: 'statements',
    enabled: FT_STATEMENTS,
    schedule: STATEMENTS_SCHEDULE,
    task: taskStatements,
  },
  {
    name: 'response-time',
    enabled: FT_RESPONSE_TIME,
    schedule: RESPONSE_TIME_SCHEDULE,
    task: taskResponseTime,
  },
  {
    name: 'progress',
    enabled: FT_PROGRESS,
    schedule: PROGRESS_SCHEDULE,
    task: taskProgress,
  },
  {
    name: 'cache-hit-ratio',
    enabled: FT_CACHE_HIT_RATIO,
    schedule: CACHE_HIT_RATIO_SCHEDULE,
    task: taskCacheHit,
  },
  {
    name: 'queries-metric',
    enabled: FT_QUERIES_METRIC,
    schedule: QUERIES_METRIC_SCHEDULE,
    task: async () => {
      await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
    },
  },
  {
    name: 'blocking-queries',
    enabled: FT_BLOCKING_QUERIES,
    schedule: BLOCKING_QUERIES_SCHEDULE,
    task: taskBlockingQueries,
  },
];

if (tasks.every(({ enabled }) => !enabled)) {
  throw new Error('At least one feature toggle must be active, exiting..');
}

tasks.forEach(({ name, schedule, enabled, task }) => {
  if (enabled) {
    console.log(`task ${name} scheduled ${schedule}`);
    scheduleTask({
      schedule,
      task,
    });
  } else {
    console.log(`task ${name} not scheduled`);
  }
});
