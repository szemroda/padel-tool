const runInErrorContextAsync = async (fn, ctxData) => {
    try {
        const res = await fn();
        return res;
    } catch (error) {
        forwardError(error, ctxData);
    }
};

const runInErrorContext = (fn, ctxData) => {
    try {
        return fn();
    } catch (error) {
        forwardError(error, ctxData);
    }
};

const forwardError = (error, ctxData) => {
    throw new Error(`${error.message} ${getCtxDataString(ctxData)}`, {
        cause: error,
    });
};

const getCtxDataString = ctxData => {
    return ctxData ? `Context data: ${JSON.stringify(ctxData)}.` : '';
};

export { runInErrorContext, runInErrorContextAsync };
