import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import * as Env from './env.js';
import * as Logger from './logger.js';
import { createDateComparator, isValidDate } from './dates.js';

const firebaseConfig = {
    apiKey: Env.get('FIREBASE_API_KEY'),
    databaseURL: Env.get('FIREBASE_DATABASE_URL'),
};

let rules = [];
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rulesRef = ref(db, Env.get('FIREBASE_RULES_PATH'));

onValue(rulesRef, snapshot => {
    rules = snapshot.val() ?? [];

    Logger.debug(`New rules fetched (${rules.length}).`);
});

const isRuleEnabled = rule => {
    if (typeof rule.enabled === 'boolean') {
        return rule.enabled;
    }

    if (typeof rule.enabled === 'string' && isValidDate(rule.enabled)) {
        return createDateComparator(rule.enabled).isSameOrBefore(new Date(), 'day');
    }

    return false;
};

const getEnabledRules = () => {
    const enabledRules = rules.filter(isRuleEnabled);

    Logger.debug(`Total rules: ${rules.length}. Enabled rules: ${enabledRules.length}`);

    return enabledRules;
};

export { getEnabledRules };
