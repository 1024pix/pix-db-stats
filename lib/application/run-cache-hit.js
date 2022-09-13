const { logCacheHits } = require('./task-cache-hit');

(async ()=>{
  await logCacheHits();
})()

