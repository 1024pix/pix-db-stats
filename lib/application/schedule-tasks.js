const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const {
  METRICS_SCHEDULE,
  STATEMENTS_SCHEDULE,
} = require('../../config');
const taskMetrics = require('./task-metrics');
const taskStatements = require('./task-statements');

new CronJob(METRICS_SCHEDULE, taskMetrics, null, true, parisTimezone);
new CronJob(STATEMENTS_SCHEDULE, taskStatements, null, true, parisTimezone);

