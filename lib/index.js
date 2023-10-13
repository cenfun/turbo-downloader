// import fs from 'fs';
import path from 'path';

import { chromium } from 'playwright';
// import EC from 'eight-colors';

import { delay, resolveDir } from './util.js';

import * as ChromeLauncher from 'chrome-launcher';

const downloadDir = path.resolve('.temp');

const pageUrl = 'https://www.xiaohongshu.com/';
const clientPath = 'dist/client.js';

const allowDownload = async (context, page) => {
    const client = await context.newCDPSession(page);
    await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadDir
    });
};

const main = async () => {

    resolveDir(downloadDir);

    const flags = ChromeLauncher.Launcher.defaultFlags().filter((flag) => {
        return flag !== '--mute-audio';
        // && flag !== '--disable-extensions';
    });

    console.log('flags', flags);

    const chrome = await ChromeLauncher.launch({
        startingUrl: 'about:blank',
        ignoreDefaultFlags: true,
        chromeFlags: flags,
        prefs: {
            'download.default_directory': downloadDir
        },
        // if set to `false` then the default profile will be used.
        userDataDir: false,
        logLevel: 'verbose'
    });

    console.log('port', chrome.port);

    const browser = await chromium.connectOverCDP(`http://localhost:${chrome.port}`);
    const context = browser.contexts()[0];
    const page = context.pages()[0];
    await allowDownload(context, page);

    browser.on('disconnected', (e) => {
        console.log('browser disconnected');
        // await chrome.kill();
        process.exit(1);
    });

    await context.addInitScript({
        path: clientPath
    });

    context.on('page', (p) => {

        p.on('load', (data) => {
            allowDownload(context, p);
        });

    });

    await page.goto(pageUrl);

};

main();
