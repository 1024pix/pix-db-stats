import { run } from './task-queries-metric.js';
import * as scalingoApi from '../infrastructure/scalingo-api.js';
import * as databaseStatsRepository from '../infrastructure/database-stats-repository.js';

(async () => {
  await run(databaseStatsRepository, scalingoApi);
})();
