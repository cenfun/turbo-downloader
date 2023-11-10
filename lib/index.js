// import fs from 'fs';
import path from 'path';

import { chromium } from 'playwright';
import EC from 'eight-colors';

import { resolveDir } from './util.js';

import * as ChromeLauncher from 'chrome-launcher';


import { WebSocketServer } from 'ws';
import open from 'open';

import {
    setInsData, setInsList, getInsData
} from './ins.js';

// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);
// const packageJson = require('../package.json');

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

    page.on('response', (res) => {

        const url = res.url();
        //  console.log(url);

        if (url.startsWith('https://www.instagram.com/api/graphql')) {
            setInsData(res, 'graphql');
            return;
        }

        if (url.startsWith('https://www.instagram.com/api/v1/feed/user')) {
            setInsData(res, 'feed');

        }


        // const headers = await res.allHeaders();
        // const contentType = headers['content-type'];
        // if (contentType && contentType.startsWith('video/')) {
        //     const videoUrl = res.url();
        //     if (urlMap.has(videoUrl)) {
        //         return;
        //     }
        //     const contentLength = headers['content-length'];
        //     console.log(EC.cyan(contentType), EC.cyan(BF(contentLength)), videoUrl);
        //     urlMap.set(videoUrl, contentLength);
        // }
    });
};

const actions = {
    'open-folder': async () => {
        await open(downloadDir);
        return {
            downloadDir
        };
    },
    'get-ins-data': (data) => {
        return getInsData(data);
    },
    'set-ins-list': (data) => {
        return setInsList(data);
    }
};

const onMessage = async (ws, buf) => {
    const message = JSON.parse(buf.toString());

    const {
        id, action, data
    } = message;

    console.log('server onMessage', EC.cyan(action));

    const handler = actions[action];
    if (handler) {
        const res = await handler(data);
        ws.send(JSON.stringify({
            id,
            data: res
        }));
        return;
    }

    ws.send(JSON.stringify({
        id,
        data: {
            error: `ERROR: not found action: ${action}`
        }
    }));


};

const createServer = () => {

    const port = 8899;

    const wss = new WebSocketServer({
        port
    });

    wss.on('error', (e) => {
        console.log(`websocket server error: ${e.message}`);
    });
    wss.on('wsClientError', (e) => {
        console.log(`websocket client error: ${e.message}`);
    });

    wss.on('connection', (ws) => {

        ws.on('error', console.error);

        // data {Buffer|ArrayBuffer|Buffer[]}
        ws.on('message', (data, isBinary) => {
            // console.log(data, isBinary);
            onMessage(ws, data);
        });
    });

    wss.on('listening', () => {
        console.log(`websocket server listening on ws://localhost:${port}`);
    });

};

const main = async () => {

    await createServer();

    const flags = ChromeLauncher.Launcher.defaultFlags().filter((flag) => {
        return flag !== '--mute-audio' && flag !== '--disable-extensions';
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

    const port = chrome.port;

    console.log('chrome port', port);

    resolveDir(downloadDir);
    console.log('download dir', EC.cyan(downloadDir));

    const browser = await chromium.connectOverCDP(`http://localhost:${port}`);
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

    await page.reload();

};

main();
