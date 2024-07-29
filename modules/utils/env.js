require('dotenv').config();

const get = (key, defaultValue) => process.env[key] ?? defaultValue;

module.exports = { get };
