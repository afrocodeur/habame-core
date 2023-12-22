import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';
import terser from '@rollup/plugin-terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRootDir = path.resolve(__dirname);

export default {
    input: 'src/main.js',
    output: [
        {
            file: 'bin/habame.js',
            format: 'iife',
            name: "Habame",
        },
        {
            file: 'bin/habame.min.js',
            format: 'iife',
            name: "Habame",
            plugins: [terser()]
        }
    ],
    watch: {
        exclude: ['node_modules/**', 'demo']
    },
    plugins: [
        alias({
            entries: [
                { find: 'src', replacement: path.resolve(projectRootDir, 'src') },
            ]
        })
    ]
};