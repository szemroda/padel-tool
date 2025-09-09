import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import { createDateComparator, isValidDate } from './dates.ts';
import { env } from './env.ts';
import * as Logger from './logger.ts';
import { ruleSchema, type Rule } from './schemas.ts';

const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    databaseURL: env.FIREBASE_DATABASE_URL,
};

let rules: Rule[] = [];
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rulesRef = ref(db, env.FIREBASE_RULES_PATH);

onValue(rulesRef, snapshot => {
    const newRulesRaw = snapshot.val() ?? [];
    const newValidRules: Rule[] = [];
    const rulesValidationErrors: string[] = [];

    for (const rule of newRulesRaw) {
        const { error, data: validatedRule } = ruleSchema.safeParse(rule);

        if (error) {
            rulesValidationErrors.push(error.message);
            continue;
        }

        newValidRules.push(validatedRule);
    }

    if (rulesValidationErrors.length > 0) {
        Logger.error(
            `Failed to parse some rules. Only valid rules will be used.\n\t${rulesValidationErrors.join('\n\t')}`,
        );
    }

    rules = newValidRules;
    Logger.debug(`New rules fetched (${rules.length}).`);
});

const isRuleEnabled = (rule: Rule) => {
    if (typeof rule.enabled === 'boolean') {
        return rule.enabled;
    }

    if (typeof rule.enabled === 'string' && isValidDate(rule.enabled)) {
        return createDateComparator(rule.enabled).isSameOrBefore(new Date(), 'day');
    }

    return false;
};

export const getEnabledRules = () => {
    const enabledRules = rules.filter(isRuleEnabled);

    Logger.debug(`Total rules: ${rules.length}. Enabled rules: ${enabledRules.length}`);

    return enabledRules;
};
