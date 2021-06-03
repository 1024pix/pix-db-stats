const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const { SCHEDULE } = require('../../config');
const task = require('./task');

new CronJob(SCHEDULE, task, null, true, parisTimezone);

