import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import terser from '@rollup/plugin-terser'

const isDev = (process.env.ROLLUP_ENV === 'development');

const config = {
    input: 'src/build.js',
    output: [
        {
            name: 'AlpinePortal',
            file: `dist/alpine-portal${!isDev ? '.min' : ''}.js`,
            format: 'umd',
            sourcemap: isDev
        }
    ],
    plugins: [
        resolve(),
        filesize(),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        }
                    }
                ]
            ]
        }),
    ]
};

if (!isDev) {
    config.plugins.push(terser());
}

export default config