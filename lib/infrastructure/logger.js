module.exports = {
  info({ event, app, data }) {
    console.log(JSON.stringify({ event, app, data }));
  },
  error(error, { task, app }) {
    const STACKTRACE_EXTRACT_LENGTH = 1000;
    const errorMessage = error.message.slice(0, STACKTRACE_EXTRACT_LENGTH);
    const errorDescription = error.response.data.error;
    console.log(JSON.stringify({ status: 'ERROR', errorMessage, errorDescription, task, app }));
  },
};
