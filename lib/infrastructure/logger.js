module.exports = {
  info({ event, app, data }) {
    console.log(JSON.stringify({ event, app, data }));
  },
  error({ task, error, message, app }) {
    console.log(JSON.stringify({ status: 'ERROR', message, error, task, app }));
  },
};
