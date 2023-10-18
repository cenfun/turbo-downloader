// import fs from 'fs';
import path from 'path';

import { chromium } from 'playwright';
import EC from 'eight-colors';

import { resolveDir } from './util.js';

import * as ChromeLauncher from 'chrome-launcher';

const downloadDir = path.resolve('.temp');

const pageUrl = 'https://www.xiaohongshu.com/';
const clientPath = 'dist/client.js';

// const allowDownload = async (context, page) => {
//     const client = await context.newCDPSession(page);
//     await client.send('Browser.setDownloadBehavior', {
//         behavior: 'allow',
//         downloadPath: downloadDir
//     });
//     await client.send('Page.setDownloadBehavior', {
//         behavior: 'allow',
//         downloadPath: downloadDir
//     });
// };

const initPage = (context, page) => {

    console.log('page init');

    // await allowDownload(context, page);

    page.on('load', (d) => {
        console.log('page load');
        // allowDownload(context, page);
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

    await context.addInitScript({
        path: clientPath
    });

    context.on('page', (p) => {
        initPage(context, p);
    });

    await page.goto(pageUrl);

};

main();
