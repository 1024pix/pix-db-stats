const { Client } = require('pg');
const logger = require('../infrastructure/logger');
const {
  MONITORED_DATABASE_URL,
} = require('../../config');

const PROGRESS_VIEW_PREFIX = 'pg_stat_progress_';

const taskProgress = async ()=>{

  const client = new Client(MONITORED_DATABASE_URL);

  try {
    await client.connect();

    const { rows: views } = await client.query(`SELECT relname FROM pg_class WHERE relname LIKE '${PROGRESS_VIEW_PREFIX}%'`);

    for(const { relname: view } of views) {
      const operation = view.replace(PROGRESS_VIEW_PREFIX, '');
      const { rows: entries } = await client.query(`SELECT * from ${view}`);
      entries.forEach((entry) => logger.info({ event: 'progress', data: { operation, ...entry } }))
    }

  } finally {
    await client.end();
  }
}

module.exports = taskProgress;
