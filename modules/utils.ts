type TryCatchFn<T> = () => Promise<T> | T;
type TryCatchResult<T> = [null, T] | [Error, null];

export const tryCatch = async <T>(fn: TryCatchFn<T>): Promise<TryCatchResult<T>> => {
    try {
        const result = await fn();
        return [null, result];
    } catch (error) {
        return [error, null];
    }
};
