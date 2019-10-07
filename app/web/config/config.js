import { resolve } from 'path';
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
export default {
  disableCSSSourceMap: true,
  hash: true,
  history: 'hash',
  targets: {ios: 8, ie: 9},
  define: {
  },
  theme: {
    '@font-size-base': '24px'
  },
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: { immer: true },
        antd: true,
        routes: {
          exclude: [/models\//]
        },
        library: 'react',
        dynamicImport: {
          loadingComponent: './components/Loading'
        },
        hardSource: false,
        hd: false,
        fastClick: true,
        title: {
          defaultTitle: '333',
          separator: ' - '
        }
      }
    ]
  ],
  sass: {},
  ignoreMomentLocale: true,
  disableCSSModules: true,
  alias: {
    src: resolve(__dirname, '../web'),
    assets: resolve(__dirname, '../web/assets'),
    common: resolve(__dirname, '../web/common'),
    components: resolve(__dirname, '../web/components'),
    constants: resolve(__dirname, '../web/constants'),
    layouts: resolve(__dirname, '../web/layouts'),
    models: resolve(__dirname, '../web/models'),
    services: resolve(__dirname, '../web/services'),
    utils: resolve(__dirname, '../web/utils'),
    libs: resolve(__dirname, '../web/libs'),
    enums: resolve(__dirname, '../web/enums'),
    'packages': resolve(__dirname, '../packages'),
    '@edith/devtools': resolve(__dirname, '../packages/devtools'),
    'fs': 'browserfs/dist/shims/fs.js',
    'buffer': 'browserfs/dist/shims/buffer.js',
    'path': 'browserfs/dist/shims/path.js',
    'processGlobal': 'browserfs/dist/shims/process.js',
    'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
    'bfsGlobal': require.resolve('browserfs')
  },
  chainWebpack(config, { webpack }) {
    // 设置 alias
  
    // 删除进度条插件
    config.plugin('ProvidePlugin').use(webpack.ProvidePlugin, [{ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal'}]);
  }
};
