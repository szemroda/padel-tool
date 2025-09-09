import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {},
    clientPrefix: '',
    client: {
        INTERVAL_MINUTES: z.preprocess(val => +val, z.number().positive()),
        LOG_LEVEL: z.preprocess(
            val => (val ?? 'ERROR').toString().toUpperCase(),
            z.enum(['DEBUG', 'WARNING', 'ERROR']),
        ),
        BOOKED_EVENTS_STORAGE_PATH: z.string(),
        PUPPETEER_BROWSER_ARGS: z.string().default(''),
        USE_DISCOUNT_CARD: z
            .preprocess(val => val.toString().toLocaleLowerCase(), z.enum(['true', 'false']))
            .transform(val => val === 'true'),
        EVENTS_FROM_X_DAYS_ON: z.preprocess(val => +val, z.number().positive()).default(1),
        KLUBY_EMAIL: z.email(),
        KLUBY_PASSWORD: z.string(),
        KLUBY_USER_NAME: z.string(),
        FIREBASE_API_KEY: z.string(),
        FIREBASE_DATABASE_URL: z.url(),
        FIREBASE_RULES_PATH: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
