const { initializeApp, deleteApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const { Env, Logger } = require('../utils');

const firebaseConfig = {
    apiKey: Env.get('FIREBASE_API_KEY'),
    databaseURL: Env.get('FIREBASE_DATABASE_URL'),
};

const getRules = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const rulesRef = ref(db, Env.get('FIREBASE_RULES_PATH'));
    const snapshot = await get(rulesRef);
    await deleteApp(app);

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return [];
};

const getEnabledRules = async () => {
    const rules = await getRules();
    const enabledRules = rules.filter(rule => rule.enabled);

    Logger.debug(`Total rules: ${rules.length}. Enabled rules: ${enabledRules.length}`);

    return enabledRules;
};

module.exports = { getEnabledRules };
