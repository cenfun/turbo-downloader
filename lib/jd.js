
import { execSync, spawn } from 'child_process';
import { chromium } from 'playwright';
import EC from 'eight-colors';

const main = async () => {
    // before start, kill all edge first
    try {
        execSync('taskkill /f /t /im msedge.exe', {
            stdio: 'inherit',
            shell: true
        });
    } catch (e) {
        // the process might have already stopped
    }

    const port = 9230;

    const cmd = `start msedge.exe --remote-debugging-port=${port}`;
    console.log(cmd);

    const edge = await new Promise((resolve) => {
        const cp = spawn(cmd, {
            stdio: 'inherit',
            shell: true
        });

        cp.on('error', (err) => {
            console.log('sub process error', err);
            resolve();
        });
        cp.on('spawn', () => {
            // wait for sub process ready
            setTimeout(() => {
                resolve(cp);
            }, 1000);
        });
    });

    if (!edge) {
        return;
    }

    console.log('browser port', port);

    const browser = await chromium.connectOverCDP(`http://localhost:${port}`, {

    });

    browser.on('disconnected', (e) => {
        console.log(EC.red('browser disconnected'));
        // await chrome.kill();
        process.exit(1);
    });

    console.log('connected');

    const context = browser.contexts()[0];
    await context.addInitScript({
        path: './node_modules/mouse-helper/dist/mouse-helper.js'
    });


    const page = context.pages()[0];
    page.on('load', (d) => {
        console.log('page load');
    });
    await page.goto('https://pro.jd.com/mall/active/26r5gyyivaBfNmv3m1gZ6m3w1C3M/index.html?babelChannel=ttt63');

    await page.evaluate(() => {
        window['mouse-helper']();
    });

    await page.evaluate(() => {
        window['mouse-helper']();
    });

    const $el = page.locator('a[data-cpid]').first();

    setInterval(async () => {

        await $el.click();

    }, 100);

};


main();
