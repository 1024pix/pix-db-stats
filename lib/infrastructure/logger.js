module.exports = {
  info({ event, app, data }) {
    console.log(JSON.stringify({ event, app, data }));
  },
};
