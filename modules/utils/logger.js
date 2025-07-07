import * as Env from './env.js';

const getLogTimestamp = () => {
    const date = new Date();
    const isoDate = date.toISOString();
    const offset = date.getTimezoneOffset() / 60;
    const offsetString = offset < 0 ? `-${Math.abs(offset)}` : `+${offset}`;

    return `${isoDate}${offsetString}`;
};

const LOG_LEVELS = {
    DEBUG: 1,
    WARNING: 2,
    ERROR: 3,
};
const NATIVE_LOGGERS = {
    [LOG_LEVELS.DEBUG]: console.debug,
    [LOG_LEVELS.WARNING]: console.warn,
    [LOG_LEVELS.ERROR]: console.error,
};

const logLevel = Env.get('LOG_LEVEL', 'ERROR');
const logLevelNumber = LOG_LEVELS[logLevel];
const isLogLevelEnabled = level => level >= logLevelNumber;
const getLogLevelName = level => Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
const getLogPrefix = level => `[${getLogLevelName(level)}] {${getLogTimestamp()}}`;
const createLogger = level => text => {
    if (isLogLevelEnabled(level)) {
        NATIVE_LOGGERS[level](`${getLogPrefix(level)} - ${text}`);
    }
};

const debug = createLogger(LOG_LEVELS.DEBUG);
const warning = createLogger(LOG_LEVELS.WARNING);
const error = createLogger(LOG_LEVELS.ERROR);

export { debug, error, warning };
