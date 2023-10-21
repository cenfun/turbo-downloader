import { saveAs } from 'file-saver';

import css from './style.scss';

import svgDownload from './images/download.svg';

import XHS from './xhs.js';
import INS from './ins.js';

const list = [
    XHS,
    INS
];

// global element
let downloadHelper;
let downloadTarget;
let downloadType;

let mySocket;

const sendMessage = (action, data) => {
    if (mySocket) {
        mySocket.send(JSON.stringify({
            action,
            data
        }));
    }
};

const initSocket = () => {
    const socket = new WebSocket('ws://localhost:8899');

    // Connection opened
    socket.addEventListener('open', (event) => {

        mySocket = socket;
        sendMessage('init', 'Connection opened');

    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
    });
};

const mouseleaveHandler = (e) => {

    downloadTarget.removeEventListener('mouseleave', mouseleaveHandler);
    downloadTarget = null;

    if (downloadHelper.parentNode) {
        downloadHelper.parentNode.removeChild(downloadHelper);
    }

};

const showHelper = (target, type) => {
    downloadTarget = target;
    downloadType = type;
    downloadTarget.appendChild(downloadHelper);
    downloadTarget.addEventListener('mouseleave', mouseleaveHandler);
};

const bindEvents = (item) => {
    // init events

    item.bindEvents(showHelper);

    downloadHelper.addEventListener('click', (e) => {

        if (!downloadTarget) {
            return;
        }

        e.stopPropagation();

        const info = item.getDownloadInfo(downloadTarget, downloadType);
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

    html.push(`<h3>${title}</h3>`);

    html.push('<ul class="downloader-list">');
    list.forEach((item) => {

        html.push(`<li><a href="${item.url}" target="_blank">${item.name} - ${item.url}</a></li>`);

    });

    html.push('</ul>');

    document.body.innerHTML = html.join('');
};

const initialize = () => {

    // console.log(css);
    document.head.appendChild(document.createElement('style')).appendChild(document.createTextNode(css));


    // init helper
    downloadHelper = document.createElement('div');
    downloadHelper.className = 'downloader-helper-container';

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
