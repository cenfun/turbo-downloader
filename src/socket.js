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

const pendingList = [];

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
export const request = (action, data, timeout = 30 * 1000) => {
    return new Promise((resolve) => {

        if (!mySocket) {
            pendingList.push({
                action,
                data,
                timeout,
                resolve
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

export const initSocket = () => {
    const socket = new WebSocket('ws://localhost:8899');

    // Connection opened
    socket.addEventListener('open', (event) => {
        // must be connected
        mySocket = socket;
        request('init', 'Connection opened');

        pendingList.forEach((item) => {
            request(item.action, item.data, item.timeout).then((res) => {
                item.resolve(res);
            });
        });
        pendingList.length = 0;

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
