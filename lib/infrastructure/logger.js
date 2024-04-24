/* eslint-disable no-console */

export const info = ({ event, app, database, data }) => {
  console.log(JSON.stringify({ event, app, database, data }));
};

export const error = (error, { task, app }) => {
  console.error(error);
  console.log(JSON.stringify({ status: 'ERROR', message: error.message, task, app }));
};
