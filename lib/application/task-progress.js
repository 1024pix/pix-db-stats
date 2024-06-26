import pg from 'pg';
import { info, error } from '../infrastructure/logger.js';
import { getPgConnectionString } from '../infrastructure/database-stats-repository.js';
import config from '../../config.js';

const PROGRESS_VIEW_PREFIX = 'pg_stat_progress_';

const taskProgress = async () => {
  config.SCALINGO_APPS.forEach(async (scalingoApp) => {
    try {
      const dbURL = await getPgConnectionString(scalingoApp);

      const client = new pg.Client(dbURL);

      try {
        await client.connect();

        const { rows: views } = await client.query(
          `SELECT relname FROM pg_class WHERE relname LIKE '${PROGRESS_VIEW_PREFIX}%'`,
        );

        for (const { relname: view } of views) {
          const operation = view.replace(PROGRESS_VIEW_PREFIX, '');
          const { rows: entries } = await client.query(`SELECT * from ${view}`);
          entries.forEach((entry) =>
            info({ event: 'progress', app: scalingoApp, database: 'postgresql', data: { operation, ...entry } }),
          );
        }
      } finally {
        await client.end();
      }
    } catch (errorMessage) {
      error(errorMessage, {
        task: 'progress',
        app: scalingoApp,
      });
    }
  });
};

export default taskProgress;
