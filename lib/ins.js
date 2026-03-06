import EC from 'eight-colors';
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
        if (item.code) {
            dataMap.set(item.code, item);
            console.log('setInsList', EC.magenta(item.code));
        }
    });
};


export const setInsData = async (res, type) => {

    const json = await res.json();


    if (type === 'graphql') {
        let edges = getValue(json, 'data.xdt_api__v1__feed__user_timeline_graphql_connection.edges');
        if (!edges) {
            edges = getValue(json, 'data.xdt_api__v1__feed__timeline__connection.edges');
        }

        if (!edges) {
            return;
        }
        const list = [];
        const nodes = edges.map((it) => it.node).filter((it) => it);
        nodes.forEach((node) => {
            if (node.code) {
                list.push(node);
                return;
            }

            const ads = getValue(node, 'ad.items');
            if (ads) {
                ads.forEach((it) => {
                    if (it.code) {
                        list.push(it);
                    }
                });
            }

            const media = getValue(node, 'explore_story.media');
            if (media && media.code) {
                list.push(media);
            }

        });
        setInsList(list);
        return;
    }

    if (type === 'feed') {
        const list = getValue(json, 'items');
        setInsList(list);
    }

};


export const getInsData = (options) => {
    console.log('getInsData', EC.cyan(options.code));
    return dataMap.get(options.code);
};
