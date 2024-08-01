const Env = require('./env');

const getLogTimestamp = () => {
    const date = new Date();
    const isoDate = date.toISOString();
    const offset = date.getTimezoneOffset() / 60;
    const offsetString = offset < 0 ? `-${Math.abs(offset)}` : `+${offset}`;

    return `${isoDate}${offsetString}`;
};

const debug =
    Env.get('LOG_LEVEL', 'ERROR') === 'DEBUG'
        ? text => console.debug(`[DEBUG] {${getLogTimestamp()}} - ${text}`)
        : () => {};

const error = text => console.error(`[ERROR] {${getLogTimestamp()}} - ${text}`);

module.exports = { debug, error };
