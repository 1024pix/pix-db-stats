import { CronJob } from 'cron';
import config from '../../config.js';

import taskMetrics from './task-metrics.js';
import taskAppMetrics from './task-app-metrics.js';
import taskStatements from './task-statements.js';
import taskResponseTime from './task-response-time.js';
import taskProgress from './task-progress.js';
import { run } from './task-queries-metric.js';
import { logCacheHits as taskCacheHit } from './task-cache-hit.js';
import { logBlockingQueries as taskBlockingQueries } from './task-blocking-queries.js';
import { pgConnectionsActivity } from './task-pg-connections-activity.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import * as databaseStatsRepository from '../infrastructure/database-stats-repository.js';

const parisTimezone = 'Europe/Paris';

const scheduleTask = ({ schedule, task }) => {
  return CronJob.from({
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
      name: 'app-metrics',
      enabled: config.FT_APP_METRICS,
      schedule: config.APP_METRICS_SCHEDULE,
      task: taskAppMetrics,
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
    {
      name: 'pg-connections-activity',
      enabled: config.FT_PG_CONNECTIONS_ACTIVITY,
      schedule: config.PG_CONNECTIONS_ACTIVITY_SCHEDULE,
      task: pgConnectionsActivity,
    },
  ];
};

// Returns the scheduled jobs, so that a caller can stop them
export const schedule = ({ runCommand = run } = {}) => {
  const tasks = generateTasks({ runCommand });

  if (tasks.every(({ enabled }) => !enabled)) {
    throw new Error('At least one feature toggle must be active, exiting..');
  }

  return tasks
    .map(({ name, schedule, enabled, task }) => {
      if (!enabled) {
        // eslint-disable-next-line no-console
        console.log(`task ${name} not scheduled`);
        return null;
      }

      // eslint-disable-next-line no-console
      console.log(`task ${name} scheduled ${schedule}`);
      return scheduleTask({
        schedule,
        task,
      });
    })
    .filter((job) => job !== null);
};

// Scheduling is a side effect of running this file, not of importing it
if (import.meta.main) {
  schedule();
}
