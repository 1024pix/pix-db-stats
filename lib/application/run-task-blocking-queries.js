import { logBlockingQueries } from './task-blocking-queries.js';

(async () => {
  await logBlockingQueries();
})();
