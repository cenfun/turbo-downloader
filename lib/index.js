// import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

import { chromium } from 'playwright';
import EC from 'eight-colors';

import { resolveDir } from './util.js';

import { WebSocketServer } from 'ws';
import open from 'open';

import Koa from 'koa';
// import KSR from 'koa-static-resolver';

import {
    setInsData, setInsList, getInsData
} from './ins.js';

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
        console.log('open download dir', downloadDir);
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

    const webPort = port + 1;
    const app = new Koa();

    const server = http.createServer(app.callback());

    const url = `http://localhost:${webPort}`;
    server.listen(webPort, function() {
        console.log(`web listen on: ${url}`);
    });

};

const main = async () => {

    await createServer();

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

    resolveDir(downloadDir);
    console.log('download dir', EC.cyan(downloadDir));

    const browser = await chromium.connectOverCDP(`http://localhost:${port}`, {

    });

    console.log('connected');

    const context = browser.contexts()[0];
    const page = context.pages()[0];
    await initPage(context, page);

    await page.goto('http://localhost:8900/');

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
