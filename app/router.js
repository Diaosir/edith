'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.all('/restapi/*', controller.home.api);
  router.post('/project/:id/tree', controller.git.getProject)
  router.post('/project/:id/file', controller.git.fileContent)
  router.get('/vscode', controller.home.vscode);
  router.get('/getExtensionsConfig', controller.home.getVscodeExtensionsConfig);
  router.get('/static-extension/:extensionName', controller.home.getExtension);
  router.get('/user', controller.user.find);
  router.get('*', controller.home.index);
};
