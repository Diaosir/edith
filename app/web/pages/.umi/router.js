import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@tmp/history';
import { routerRedux, dynamic as _dvaDynamic } from 'dva';

const Router = routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../../layouts/index.jsx'),
          LoadingComponent: require('E:/github/edith/app/web/components/Loading')
            .default,
        })
      : require('../../layouts/index.jsx').default,
    routes: [
      {
        path: '/home',
        exact: true,
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require('@tmp/dva').getApp(),
              models: () => [
                import('E:/github/edith/app/web/pages/home/models/home.ts').then(
                  m => {
                    return { namespace: 'home', ...m.default };
                  },
                ),
              ],
              component: () => import('../home/index.tsx'),
              LoadingComponent: require('E:/github/edith/app/web/components/Loading')
                .default,
            })
          : require('../home/index.tsx').default,
        _title: '333',
        _title_default: '333',
      },
      {
        path: '/',
        exact: true,
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../index.js'),
              LoadingComponent: require('E:/github/edith/app/web/components/Loading')
                .default,
            })
          : require('../index.js').default,
        _title: '333',
        _title_default: '333',
      },
      {
        path: '/preview',
        exact: true,
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require('@tmp/dva').getApp(),
              models: () => [
                import('E:/github/edith/app/web/pages/preview/models/preview.ts').then(
                  m => {
                    return { namespace: 'preview', ...m.default };
                  },
                ),
              ],
              component: () => import('../preview/index.tsx'),
              LoadingComponent: require('E:/github/edith/app/web/components/Loading')
                .default,
            })
          : require('../preview/index.tsx').default,
        _title: '333',
        _title_default: '333',
      },
      {
        path: '/test',
        exact: true,
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require('@tmp/dva').getApp(),
              models: () => [
                import('/Users/fengzhihao/Projects/github/edith/app/web/pages/test/models/jest.ts').then(
                  m => {
                    return { namespace: 'jest', ...m.default };
                  },
                ),
              ],
              component: () => import('../test/index.tsx'),
              LoadingComponent: require('E:/github/edith/app/web/components/Loading')
                .default,
            })
          : require('../test/index.tsx').default,
        _title: '333',
        _title_default: '333',
      },
      {
        component: () =>
          React.createElement(
            require('E:/github/edith/node_modules/_umi-build-dev@1.13.12@umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'pages', hasRoutesInConfig: false },
          ),
        _title: '333',
        _title_default: '333',
      },
    ],
    _title: '333',
    _title_default: '333',
  },
  {
    component: () =>
      React.createElement(
        require('E:/github/edith/node_modules/_umi-build-dev@1.13.12@umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'pages', hasRoutesInConfig: false },
      ),
    _title: '333',
    _title_default: '333',
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    routeChangeHandler(history.location);
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return <Router history={history}>{renderRoutes(routes, props)}</Router>;
  }
}
