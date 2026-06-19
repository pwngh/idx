import { createRequire } from 'node:module';

// This config is ESM (package.json sets "type": "module"), so `require` is not
// defined by default. Recreate it for the require.resolve() calls below.
const require = createRequire(import.meta.url);

/**
 * @type {import('@storybook/react-webpack5').StorybookConfig}
 */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    {
      // Single essentials entry (it was registered twice before, which can
      // double-register its addons). Bundles docs, controls, actions,
      // backgrounds, viewport, toolbars, measure, and outline.
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: true,
        viewport: true,
        toolbars: true
      }
    },
    {
      // TODO: addon-styling is deprecated (Storybook 7-era). It wires PostCSS so
      // Tailwind is processed; migrate to @storybook/addon-styling-webpack before
      // upgrading to Storybook 9.
      name: '@storybook/addon-styling',
      options: {
        postCss: {
          implementation: require.resolve('postcss')
        }
      }
    }
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  babel: async (options) => ({
    ...options,
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic'
        }
      ]
    ]
  }),
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic'
                }
              ]
            ]
          }
        }
      ]
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      os: require.resolve('os-browserify/browser')
    };

    return config;
  },
  docs: {
    autodocs: 'tag'
  }
};

export default config;
