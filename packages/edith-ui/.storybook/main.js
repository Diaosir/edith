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
    return config;
  }
};
