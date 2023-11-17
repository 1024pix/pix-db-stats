const { logBlockingQueries } = require('./task-blocking-queries');

(async () => {
  await logBlockingQueries();
})();
