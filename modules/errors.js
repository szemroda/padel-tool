const runInErrorContextAsync = async (fn, ctxData) => {
    try {
        const res = await fn();
        return res;
    } catch (error) {
        throw new Error(`${error.message}. ${getCtxDataString(ctxData)}`, {
            cause: error,
        });
    }
};

const runInErrorContext = (fn, ctxData) => {
    try {
        return fn();
    } catch (error) {
        throw new Error(`${error.message} ${getCtxDataString(ctxData)}`, {
            cause: error,
        });
    }
};

const getCtxDataString = ctxData => {
    return ctxData ? `Context data: ${JSON.stringify(ctxData)}.` : '';
};

module.exports = { runInErrorContext, runInErrorContextAsync };
