import { saveAs } from 'file-saver';

import css from './style.scss';

import svgDownload from './images/download.svg';

import XHS from './xhs.js';
import INS from './ins.js';
import { showMessage } from './message';

const list = [
    XHS,
    INS
];

// global element
let downloadHelper;

let mySocket;

const requestMap = new Map();

const uid = function(len = 20, prefix = '') {
    const dict = '0123456789abcdefghijklmnopqrstuvwxyz';
    const dictLen = dict.length;
    let str = prefix;
    while (len--) {
        str += dict[Math.random() * dictLen | 0];
    }
    return str;
};

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
const request = (action, data, timeout = 30 * 1000) => {
    return new Promise((resolve) => {

        if (!mySocket) {
            resolve({
                error: 'ERROR: invalid websocket'
            });
            return;
        }

        const id = uid();
        const timeout_id = setTimeout(() => {
            requestMap.delete(id);
            resolve({
                error: `ERROR: timeout ${timeout}ms`
            });
        }, timeout);

        requestMap.set(id, {
            timeout_id,
            resolve
        });

        mySocket.send(JSON.stringify({
            id,
            action,
            data
        }));

    });

};

const onMessage = (message) => {
    // console.log('client onMessage', message);
    const { id, data } = message;
    if (!id) {
        console.log('ERROR: not found request id');
        return;
    }
    const item = requestMap.get(id);
    if (!item) {
        console.log(`request not found: ${id} (could be timeout)`);
        return;
    }
    requestMap.delete(id);
    clearTimeout(item.timeout_id);
    item.resolve(data);

};

const initSocket = () => {
    const socket = new WebSocket('ws://localhost:8899');
    mySocket = socket;

    // Connection opened
    socket.addEventListener('open', (event) => {
        request('init', 'Connection opened');
    });

    socket.addEventListener('close', (event) => {
        console.log('WebSocket closed');
    });

    socket.addEventListener('error', (event) => {
        console.log('WebSocket error: ', event);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        onMessage(JSON.parse(event.data));
    });
};

const showHelper = (target) => {
    target.appendChild(downloadHelper);
};

const hideHelper = () => {
    if (downloadHelper.parentNode) {
        downloadHelper.parentNode.removeChild(downloadHelper);
    }
};

const bindEvents = (item) => {
    // init events

    item.bindEvents(showHelper, hideHelper);

    downloadHelper.addEventListener('click', (e) => {

        e.stopPropagation();

        const info = item.getDownloadInfo();
        if (info) {
            saveAs(info.url, info.filename);
        }

    });

};


const showList = () => {
    // show list

    const title = 'Turbo Downloader';

    document.title = title;

    const html = [];

    html.push(`<h3>${title} <button class="td-open-folder">Open download folder</button></h3>`);

    html.push('<ul class="td-downloader-list">');
    list.forEach((item) => {

        html.push(`<li><a href="${item.url}" target="_blank">${item.name} - ${item.url}</a></li>`);

    });

    html.push('</ul>');


    document.body.innerHTML = html.join('');
};

const initialize = () => {

    // console.log(css);
    document.head.appendChild(document.createElement('style')).appendChild(document.createTextNode(css));

    document.addEventListener('click', async (e) => {
        if (e.target.className === 'td-open-folder') {
            const res = await request('open-folder');
            showMessage(`open folder: ${res.downloadDir}`);
        }
    });

    // init helper
    downloadHelper = document.createElement('div');
    downloadHelper.className = 'td-downloader-helper';

    const iconDownload = document.createElement('div');
    iconDownload.innerHTML = svgDownload;
    downloadHelper.appendChild(iconDownload);

    const label = document.createElement('span');
    label.innerHTML = 'save';
    downloadHelper.appendChild(label);

    initSocket();

    const host = window.location.host;

    const item = list.find((it) => host.indexOf(it.id) !== -1);

    if (item) {
        bindEvents(item);
        return;
    }

    showList();

};


window.addEventListener('load', () => {

    initialize();

});
