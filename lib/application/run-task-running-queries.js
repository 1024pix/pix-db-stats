const taskRunningQueries = require('./task-running-queries');
const scalingoApi = require('../infrastructure/scalingo-api');
const databaseStatsRepository = require('../infrastructure/database-stats-repository');

(async () => {
  await taskRunningQueries.run(databaseStatsRepository, scalingoApi);
})();
