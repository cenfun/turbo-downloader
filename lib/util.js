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
