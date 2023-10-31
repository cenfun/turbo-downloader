import fs from 'fs';

export const delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

export const resolveDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
    return dir;
};


export const toNum = function(num, toInt) {
    if (typeof num !== 'number') {
        num = parseFloat(num);
    }
    if (isNaN(num)) {
        num = 0;
    }
    if (toInt && !Number.isInteger(num)) {
        num = Math.round(num);
    }
    return num;
};


// byte
export const BF = function(v, places = 1, base = 1024) {
    v = toNum(v, true);
    if (v === 0) {
        return '0B';
    }
    let prefix = '';
    if (v < 0) {
        v = Math.abs(v);
        prefix = '-';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    for (let i = 0, l = units.length; i < l; i++) {
        const min = Math.pow(base, i);
        const max = Math.pow(base, i + 1);
        if (v > min && v < max) {
            const unit = units[i];
            v = prefix + (v / min).toFixed(places) + unit;
            break;
        }
    }
    return v;
};
