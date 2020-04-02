import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;
  router.all('/restapi/*', controller.home.api);
  router.post('/project/:id/tree', controller.git.getProject)
  router.post('/project/:id/file', controller.git.fileContent)
  router.get('/vscode', controller.home.vscode);
  router.get('/getExtensionsConfig', controller.home.getVscodeExtensionsConfig);
  router.get('/static-extension/:extensionName', controller.home.getExtension);
  router.get('*', controller.home.index);
  router.post('/npm/packjson', controller.npm.packageJson)
};