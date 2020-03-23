import { Application } from 'egg';
// import { EggShell } from 'egg-shell-decorators';

export default (app: Application) => {
  const { router, controller } = app;
  // EggShell(app, {
  //   prefix: '/api/v1',
  //   quickStart: true,
  //   swaggerOpt: {
  //     open: true,
  //     title: '示例',
  //     version: '1.0.0',
  //     host: '127.0.0.1',
  //     port: 7001,
  //     schemes: [ 'http' ],
  //     paths: {
  //       outPath: './api-docs/public/json/main.json',
  //       definitionPath: './definitions',
  //       swaggerPath: './swagger',
  //     },
  //     tokenOpt: {
  //       default: 'manager',
  //       tokens: {
  //         manager: '123',
  //         user: '321',
  //       },
  //     }
  //   },
  // });
  router.all('/restapi/*', controller.home.api);
  router.post('/project/:id/tree', controller.git.getProject)
  router.post('/project/:id/file', controller.git.fileContent)
  router.get('/vscode', controller.home.vscode);
  router.get('/getExtensionsConfig', controller.home.getVscodeExtensionsConfig);
  router.get('/static-extension/:extensionName', controller.home.getExtension);
  router.get('*', controller.home.index);
  // router.get('*', controller.home.index);
};