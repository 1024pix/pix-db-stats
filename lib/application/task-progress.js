const { Client } = require('pg');
const logger = require('../infrastructure/logger');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');
const { SCALINGO_APP } = require('../../config');

const PROGRESS_VIEW_PREFIX = 'pg_stat_progress_';

const taskProgress = async ()=>{
  const dbURL = await databaseStatsRepository.getDbConnectionString();

  const client = new Client(dbURL);

  try {
    await client.connect();

    const { rows: views } = await client.query(`SELECT relname FROM pg_class WHERE relname LIKE '${PROGRESS_VIEW_PREFIX}%'`);

    for(const { relname: view } of views) {
      const operation = view.replace(PROGRESS_VIEW_PREFIX, '');
      const { rows: entries } = await client.query(`SELECT * from ${view}`);
      entries.forEach((entry) => logger.info({ event: 'progress', app: SCALINGO_APP, data: { operation, ...entry } }))
    }

  } finally {
    await client.end();
  }
}

module.exports = taskProgress;