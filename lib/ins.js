
const dataMap = new Map();


const hasOwn = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

const getValue = function(data, dotPathStr, defaultValue) {
    if (!dotPathStr) {
        return defaultValue;
    }
    let current = data;
    const list = dotPathStr.split('.');
    const lastKey = list.pop();
    while (current && list.length) {
        const item = list.shift();
        current = current[item];
    }
    if (current && hasOwn(current, lastKey)) {
        const value = current[lastKey];
        if (typeof value !== 'undefined') {
            return value;
        }
    }
    return defaultValue;
};

export const setInsList = (list) => {
    list.forEach((item) => {
        dataMap.set(item.code, item);
    });
};


export const setInsData = async (res, type) => {

    const json = await res.json();

    let list;

    if (type === 'graphql') {
        const edges = getValue(json, 'data.xdt_api__v1__feed__timeline__connection.edges');
        if (edges) {
            list = edges.map((it) => it.node.media).filter((it) => it);
        }
    } else if (type === 'feed') {
        list = getValue(json, 'items');
    }

    if (!list || !list.length) {
        return;
    }

    setInsList(list);

};


export const getInsData = (options) => {
    // console.log('options', options);
    return dataMap.get(options.code);
};
