import { saveAs } from 'file-saver';

import css from './style.scss';

import svgDownload from './images/download.svg';

import INS from './ins.js';
import { showMessage } from './message.js';
import { initSocket, request } from './socket.js';

const list = [
    INS
];

// global element
let downloadHelper;

const showHelper = (target) => {
    target.appendChild(downloadHelper);
};

const hideHelper = () => {
    if (downloadHelper.parentNode) {
        downloadHelper.parentNode.removeChild(downloadHelper);
    }
};

const copyText = (text) => {
    return new Promise((resolve) => {
        let err;
        try {
            navigator.clipboard.writeText(text);
        } catch (e) {
            err = e;
        }
        if (err) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
};

const bindEvents = (item) => {
    // init events

    item.bindEvents(showHelper, hideHelper);

    downloadHelper.addEventListener('click', async (e) => {

        e.stopPropagation();

        const info = await item.getDownloadInfo();
        if (info) {

            if (e.target.className === 'td-helper-open') {
                copyText(item.filename);
                window.open(info.url, '_blank');
                return;
            }

            showMessage(`Saving ... ${info.url}`);
            saveAs(info.url, info.filename);
            showMessage('Saved');
        }

    });

};


const showList = () => {
    // show list

    const title = 'Turbo Downloader';

    document.title = title;

    const html = [];

    html.push(`<h3><a href="https://github.com/cenfun/turbo-downloader" target="_blank">${title}</a></h3>`);

    html.push('<p><button class="td-open-folder">Open download folder</button></p>');

    html.push('<ul class="td-downloader-list">');
    list.forEach((item) => {

        html.push(`<li><a href="${item.url}" target="_blank">${item.name} - ${item.url}</a></li>`);

    });

    html.push('</ul>');


    document.body.innerHTML = html.join('');
};

const initialize = () => {

    const host = window.location.host;
    console.log(host);
    const isLocalhost = host === 'localhost:8900';
    const item = list.find((it) => host.indexOf(it.id) !== -1);

    console.log(isLocalhost, item);

    if (!isLocalhost && !item) {
        return;
    }

    //  console.log(host);

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

    const label1 = document.createElement('span');
    label1.className = 'td-helper-open';
    label1.innerHTML = 'Open';
    downloadHelper.appendChild(label1);

    const label2 = document.createElement('span');
    label2.className = 'td-helper-save';
    label2.innerHTML = 'Save';
    downloadHelper.appendChild(label2);

    initSocket();

    if (isLocalhost) {
        showList();
        return;
    }

    bindEvents(item);

};


window.addEventListener('load', () => {

    initialize();

});
