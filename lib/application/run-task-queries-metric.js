import taskQueriesMetric from './task-queries-metric.js';
import scalingoApi from '../infrastructure/scalingo-api.js';
import databaseStatsRepository from '../infrastructure/database-stats-repository/js';

(async () => {
  await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
})();
