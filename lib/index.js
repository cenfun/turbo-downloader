// import fs from 'fs';
import path from 'path';

import { chromium } from 'playwright';
import EC from 'eight-colors';

import { resolveDir } from './util.js';

import * as ChromeLauncher from 'chrome-launcher';

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const downloadDir = path.resolve('.temp');

const initPage = (context, page) => {

    console.log('page init');

    page.on('load', (d) => {
        console.log('page load');
    });

    page.on('download', async (download) => {
        const filename = download.suggestedFilename();
        console.log(EC.cyan('download'), filename);
        const filepath = path.resolve(downloadDir, filename);
        await download.saveAs(filepath);
    });
};

const main = async () => {

    const flags = ChromeLauncher.Launcher.defaultFlags().filter((flag) => {
        return flag !== '--mute-audio';
        // && flag !== '--disable-extensions';
    });

    console.log('flags', flags);

    // edge://version/

    const chrome = await ChromeLauncher.launch({
        startingUrl: 'about:blank',
        ignoreDefaultFlags: true,
        chromeFlags: flags,
        // if set to `false` then the default profile will be used.
        userDataDir: false,
        logLevel: 'verbose'
    });

    console.log('chrome port', chrome.port);

    resolveDir(downloadDir);
    console.log('download dir', EC.cyan(downloadDir));

    const browser = await chromium.connectOverCDP(`http://localhost:${chrome.port}`);
    const context = browser.contexts()[0];
    const page = context.pages()[0];
    await initPage(context, page);

    browser.on('disconnected', (e) => {
        console.log(EC.red('browser disconnected'));
        // await chrome.kill();
        process.exit(1);
    });

    const clientPath = 'dist/client.js';
    await context.addInitScript({
        path: clientPath
    });

    context.on('page', (p) => {
        initPage(context, p);
    });

    const dataUrl = `data:text/html,${packageJson.name}`;

    await page.goto(dataUrl);

};

main();
