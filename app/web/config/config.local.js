export default {
  publicPath: 'http://127.0.0.1:8000/',
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:7001/',
      changeOrigin: true,
      pathRewrite: {'^/api': ''}
    },
  }
};
