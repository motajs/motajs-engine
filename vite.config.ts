import { defineConfig } from 'vite';
import * as glob from 'glob';
import path from 'path';

const aliases = glob.sync('packages/*/src').map(srcPath => {
    const packageName = path.basename(path.dirname(srcPath));
    return {
        find: `@motajs/${packageName}`,
        replacement: path.resolve(__dirname, srcPath)
    };
});

export default defineConfig({
    resolve: {
        alias: [...aliases]
    }
});
