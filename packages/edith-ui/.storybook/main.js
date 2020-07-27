const  { resolve } = require('path');
module.exports = {
  stories: ['../stories/**/*.stories.(js|ts|tsx|jsx)', '../components/**/*.stories.(js|ts|tsx|jsx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
        },
        // Optional
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    });
    config.resolve.extensions.push('.ts', '.tsx');
    config.devtool = "source-map"
    config.resolve.alias = {
      ...config.resolve.alias,
      'edith-runtime': resolve(__dirname, '../../edith-runtime'),
      'edith-jest': resolve(__dirname, '../../edith-jest'),
      'edith-vscode': resolve(__dirname, '../../edith-vscode'),
      'edith-types': resolve(__dirname, '../../edith-types'),
      'edith-devtools': resolve(__dirname, '../../edith-devtools'),
      'edith-utils': resolve(__dirname, '../../edith-utils'),
    }
    return config;
  }
};
