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
            file: 'dist/habame.js',
            format: 'umd',
            name: "Habame",
        },
        {
            file: 'dist/habame.min.js',
            format: 'iife',
            name: "umd",
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
                { find: 'StdCore', replacement: path.resolve(projectRootDir, 'src/StdCore') },
            ]
        })
    ]
};