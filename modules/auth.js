const Env = require('./env');
const { runInErrorContextAsync } = require('./errors');

const authenticate = async page => {
    await runInErrorContextAsync(async () => {
        await page.goto('https://kluby.org/logowanie?page=/padel');
        await page.locator('#konto').fill(Env.get('KLUBY_EMAIL'));
        await page.locator('#haslo').fill(Env.get('KLUBY_PASSWORD'));
        await page.locator('#remember').click();
        await page
            .locator(
                'body > div:nth-child(1) > div > div > div.panel.panel-default > div > div.row > div > form > button',
            )
            .click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    });
};

module.exports = { authenticate };
