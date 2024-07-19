require('dotenv').config();

const get = (key, defaultValue) => process.env[key] ?? defaultValue;
const getBoolean = key => {
    const value = get(key, 'false').toLowerCase();
    return value === 'true' || value === '1' || value === 'yes' || value === 'on';
};

module.exports = { get, getBoolean };
