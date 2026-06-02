import { pgConnectionsActivity } from './task-pg-connections-activity.js';

(async () => {
  await pgConnectionsActivity();
})();
