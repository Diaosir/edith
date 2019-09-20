export default {
  publicPath: 'http://127.0.0.1:8000/',
  proxy: {
    '/restapi': {
      target: 'http://127.0.0.1:7001/',
      changeOrigin: true,
    },
  },
};
