import { env } from './env.ts';

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
} as const;
const NATIVE_LOGGERS = {
    [LOG_LEVELS.DEBUG]: console.debug,
    [LOG_LEVELS.WARNING]: console.warn,
    [LOG_LEVELS.ERROR]: console.error,
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

const logLevel = env.LOG_LEVEL;
const logLevelNumber = LOG_LEVELS[logLevel];
const isLogLevelEnabled = (level: LogLevel) => level >= logLevelNumber;
const getLogLevelName = (level: LogLevel) =>
    Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
const getLogPrefix = (level: LogLevel) => `[${getLogLevelName(level)}] {${getLogTimestamp()}}`;
const createLogger = (level: LogLevel) => (text: string) => {
    if (isLogLevelEnabled(level)) {
        NATIVE_LOGGERS[level](`${getLogPrefix(level)} - ${text}`);
    }
};

export const debug = createLogger(LOG_LEVELS.DEBUG);
export const warning = createLogger(LOG_LEVELS.WARNING);
export const error = createLogger(LOG_LEVELS.ERROR);
