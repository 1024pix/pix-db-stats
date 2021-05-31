const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const { SCHEDULE } = require('../../config');
const job = require('./job');

new CronJob(SCHEDULE, job, null, true, parisTimezone);

