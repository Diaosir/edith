import { resolve } from 'path';
export default {
  disableCSSSourceMap: true,
  hash: true,
  history: 'hash',
  targets: {ios: 8, ie: 9},
  exportStatic: true,
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
    src: resolve(__dirname, 'src'),
    "@/packages": resolve(__dirname, '../packages'),
    "edith-runtime": resolve(__dirname, '../packages/edith-runtime'),
    "edith-jest": resolve(__dirname, '../packages/edith-jest'),
    "edith-vscode": resolve(__dirname, '../packages/edith-vscode'),
    "edith-types": resolve(__dirname, '../packages/edith-types')
  },
  chainWebpack(config, { webpack }) {
    config.output.globalObject('this'); //worker-loader devServer 模式下报错 "window is not defined"
  }
};
