import dotenv from 'dotenv';
dotenv.config();

const get = (key, defaultValue) => {
    const envValue = process.env[key];

    if (envValue === undefined && defaultValue === undefined) {
        throw new Error(`Environment variable ${key} is required.`);
    }

    return envValue ?? defaultValue;
};

export { get };
