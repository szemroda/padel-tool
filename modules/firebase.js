const { initializeApp, deleteApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const Env = require('./env');

const firebaseConfig = {
    apiKey: Env.get('FIREBASE_API_KEY'),
    authDomain: Env.get('FIREBASE_AUTH_DOMAIN'),
    databaseURL: Env.get('FIREBASE_DATABASE_URL'),
    projectId: Env.get('FIREBASE_PROJECT_ID'),
    storageBucket: Env.get('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: Env.get('FIREBASE_MESSAGING_SENDER_ID'),
    appId: Env.get('FIREBASE_APP_ID'),
};

const getRules = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const rulesRef = ref(db, '/rules');
    const snapshot = await get(rulesRef);
    await deleteApp(app);

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return [];
};

const getEnabledRules = async () => {
    const rules = await getRules();

    return rules.filter(rule => rule.enabled);
};

module.exports = { getRules, getEnabledRules };
