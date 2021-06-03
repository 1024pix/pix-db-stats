require('dotenv').config();

module.exports = {
    SCALINGO_REGION: process.env.SCALINGO_REGION,
    SCALINGO_APP: process.env.SCALINGO_APP,
    SCALINGO_TOKEN: process.env.SCALINGO_TOKEN,
    SCHEDULE: process.env.SCHEDULE,
};
