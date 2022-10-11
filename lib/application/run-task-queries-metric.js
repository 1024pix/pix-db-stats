const taskQueriesMetric = require('./task-queries-metric');
const scalingoApi = require('../infrastructure/scalingo-api');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');

(async () => {
  await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
})();
