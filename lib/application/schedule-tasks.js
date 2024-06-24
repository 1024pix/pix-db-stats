import { CronJob } from 'cron';
import config from '../../config.js';

import taskMetrics from './task-metrics.js';
import taskStatements from './task-statements.js';
import taskResponseTime from './task-response-time.js';
import taskProgress from './task-progress.js';
import { run } from './task-queries-metric.js';
import { logCacheHits as taskCacheHit } from './task-cache-hit.js';
import { logBlockingQueries as taskBlockingQueries } from './task-blocking-queries.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import * as databaseStatsRepository from '../infrastructure/database-stats-repository.js';

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

const generateTasks = ({ runCommand = run } = {}) => {
  return [
    {
      name: 'metrics',
      enabled: config.FT_METRICS,
      schedule: config.METRICS_SCHEDULE,
      task: taskMetrics,
    },
    {
      name: 'statements',
      enabled: config.FT_STATEMENTS,
      schedule: config.STATEMENTS_SCHEDULE,
      task: taskStatements,
    },
    {
      name: 'response-time',
      enabled: config.FT_RESPONSE_TIME,
      schedule: config.RESPONSE_TIME_SCHEDULE,
      task: taskResponseTime,
    },
    {
      name: 'progress',
      enabled: config.FT_PROGRESS,
      schedule: config.PROGRESS_SCHEDULE,
      task: taskProgress,
    },
    {
      name: 'cache-hit-ratio',
      enabled: config.FT_CACHE_HIT_RATIO,
      schedule: config.CACHE_HIT_RATIO_SCHEDULE,
      task: taskCacheHit,
    },
    {
      name: 'queries-metric',
      enabled: config.FT_QUERIES_METRIC,
      schedule: config.QUERIES_METRIC_SCHEDULE,
      task: async () => {
        await runCommand(databaseStatsRepository, scalingoApi);
      },
    },
    {
      name: 'blocking-queries',
      enabled: config.FT_BLOCKING_QUERIES,
      schedule: config.BLOCKING_QUERIES_SCHEDULE,
      task: taskBlockingQueries,
    },
  ];
};

export const schedule = ({ runCommand = run } = {}) => {
  const tasks = generateTasks({ runCommand });

  if (tasks.every(({ enabled }) => !enabled)) {
    throw new Error('At least one feature toggle must be active, exiting..');
  }

  tasks.forEach(({ name, schedule, enabled, task }) => {
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`task ${name} scheduled ${schedule}`);
      scheduleTask({
        schedule,
        task,
      });
    } else {
      // eslint-disable-next-line no-console
      console.log(`task ${name} not scheduled`);
    }
  });
};

schedule();
