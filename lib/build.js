import fs from 'fs';
import path from 'path';

import EC from 'eight-colors';

import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

const buildClient = async () => {

    const entry = path.resolve('src/index.js');
    if (!fs.existsSync(entry)) {
        EC.logRed(`Not found build entry: ${entry}`);
        return 1;
    }

    const outfile = path.resolve('dist/client.js');

    await esbuild.build({
        entryPoints: [entry],
        outfile: outfile,
        // minify: true,
        bundle: true,
        legalComments: 'none',
        target: ['es2020'],
        platform: 'browser',
        loader: {
            '.svg': 'text'
            // '.css': 'text'
        },
        plugins: [
            sassPlugin({
                type: 'css-text'
            })
        ]
    }).catch((err) => {
        EC.logRed(err);
        process.exit(1);
    });

    if (!fs.existsSync(outfile)) {
        EC.logRed(`Not found build out file: ${outfile}`);
        return 1;
    }

    const stat = fs.statSync(outfile);

    console.log(`finish build: ${EC.green(outfile)} (${stat.size})`);

    return 0;
};


buildClient();
