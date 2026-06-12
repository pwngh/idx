import { createRequire } from 'node:module';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const banner = `/**
 * ${pkg.name} v${pkg.version}
 *
 * Copyright (c) Preston Neal.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @license MIT
 */
 `;

const sharedConfig = {
  external: [
    'google-maps',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'prop-types',
    '@googlemaps/js-api-loader',
    '@remix-run/node',
    '@remix-run/react',
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx']
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx']
    })
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  },
};

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
   // CommonJS build
  {
    ...sharedConfig,
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
    input: {
      'node/index': 'src/node/index.js',
      'react/index': 'src/react/index.js'
    },
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      interop: 'auto',
      banner,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].cjs'
    }
  },
  // ESM build
  {
    ...sharedConfig,
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
    input: {
      'node/index': 'src/node/index.js',
      'react/index': 'src/react/index.js'
    },
    output: {
      dir: 'dist/es',
      format: 'es',
      banner,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js'
    }
  }
];
