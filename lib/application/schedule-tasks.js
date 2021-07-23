const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const {
  METRICS_SCHEDULE,
  STATEMENTS_SCHEDULE,
  RESPONSE_TIME_SCHEDULE
} = require('../../config');
const taskMetrics = require('./task-metrics');
const taskStatements = require('./task-statements');
const taskResponseTime = require('./task-response-time');

new CronJob(METRICS_SCHEDULE, taskMetrics, null, true, parisTimezone);
new CronJob(STATEMENTS_SCHEDULE, taskStatements, null, true, parisTimezone);
new CronJob(RESPONSE_TIME_SCHEDULE, taskResponseTime, null, true, parisTimezone);
