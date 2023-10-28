
let container;
let time_id;

const hideMessage = () => {
    clearTimeout(time_id);
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
};


export const showMessage = (msg, timeout = 3000) => {
    if (!container) {
        container = document.createElement('div');
        container.className = 'td-downloader-message';
    }

    if (!msg) {
        hideMessage();
        return;
    }

    console.log(msg);

    container.innerHTML = msg;
    document.body.appendChild(container);

    clearTimeout(time_id);
    time_id = setTimeout(() => {
        hideMessage();
    }, timeout);

};

