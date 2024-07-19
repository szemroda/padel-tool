const Env = require('./env');

const debug = text =>
    Env.get('LOG_LEVEL', 'ERROR') === 'DEBUG' && console.debug(`[DEBUG] {${Date.now()}} - ${text}`);

const error = text => console.error(`[ERROR] {${Date.now()}} - ${text}`);

module.exports = { debug, error };
