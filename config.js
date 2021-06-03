require('dotenv').config();

module.exports = {
    SCALINGO_REGION: process.env.SCALINGO_REGION,
    SCALINGO_APP: process.env.SCALINGO_APP,
    SCALINGO_TOKEN: process.env.SCALINGO_TOKEN,
    METRICS_SCHEDULE: process.env.METRICS_SCHEDULE,
    STATEMENTS_SCHEDULE: process.env.STATEMENTS_SCHEDULE,
};
