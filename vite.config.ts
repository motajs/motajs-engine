import { defineConfig } from 'vite';
import * as glob from 'glob';
import path from 'path';
import jsx from '@vitejs/plugin-vue-jsx';

const aliases = glob.sync('packages/*/src').map(srcPath => {
    const packageName = path.basename(path.dirname(srcPath));
    return {
        find: `@motajs/${packageName}`,
        replacement: path.resolve(__dirname, srcPath)
    };
});

const custom = [
    'container',
    'image',
    'sprite',
    'shader',
    'text',
    'comment',
    'custom',
    'container-custom'
];

export default defineConfig({
    plugins: [
        jsx({
            isCustomElement: tag => {
                return custom.includes(tag) || tag.startsWith('g-');
            }
        })
    ],
    resolve: {
        alias: [...aliases]
    }
});
