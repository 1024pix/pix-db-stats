import { CronJob } from 'cron';
import {
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
} from '../../config.js';

import taskMetrics from './task-metrics.js';
import taskStatements from './task-statements.js';
import taskResponseTime from './task-response-time.js';
import taskProgress from './task-progress.js';
import taskQueriesMetric from './task-queries-metric.js';
import { logCacheHits as taskCacheHit } from './task-cache-hit.js';
import { logBlockingQueries as taskBlockingQueries } from './task-blocking-queries.js';
import scalingoApi from '../infrastructure/scalingo-api.js';
import databaseStatsRepository from '../infrastructure/database-stats-repository.js';

const parisTimezone = 'Europe/Paris';

const scheduleTask = ({ schedule, task }) => {
  CronJob.from({
    cronTime: schedule,
    onTick: task,
    onComplete: null,
    start: true,
    timezone: parisTimezone,
  });
};

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
