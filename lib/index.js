// import fs from 'fs';
import path from 'path';

import { chromium } from 'playwright';
// import EC from 'eight-colors';

import { resolveDir } from './util.js';

import * as ChromeLauncher from 'chrome-launcher';

const downloadDir = path.resolve('.temp');
const userDataDir = path.resolve('.temp/user-data');

const pageUrl = 'https://www.xiaohongshu.com/';
const clientPath = 'dist/client.js';

const main = async () => {

    resolveDir(userDataDir);

    const flags = ChromeLauncher.Launcher.defaultFlags().filter((flag) => {
        return flag !== '--mute-audio';
        // && flag !== '--disable-extensions';
    });

    console.log('flags', flags);

    const chrome = await ChromeLauncher.launch({
        startingUrl: 'about:blank',
        ignoreDefaultFlags: true,
        chromeFlags: flags,
        // prefs: {
        //     'download.default_directory': downloadDir
        // },
        // if set to `false` then the default profile will be used.
        userDataDir: false,
        logLevel: 'verbose'
    });

    console.log('port', chrome.port);

    const browser = await chromium.connectOverCDP(`http://localhost:${chrome.port}`);
    const context = browser.contexts()[0];
    const page = context.pages()[0];


    browser.addListener('disconnected', (e) => {
        console.log('browser disconnected');
        // await chrome.kill();
        process.exit(1);
    });

    await context.addInitScript({
        path: clientPath
    });

    const client = await context.newCDPSession(page);
    await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadDir
    });

    await page.goto(pageUrl);

};

main();
