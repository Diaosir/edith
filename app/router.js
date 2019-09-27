'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.all('/restapi/*', controller.home.api);
  router.post('/project/:id/tree', controller.git.getProject)
  router.post('/project/:id/file', controller.git.fileContent)
  router.get('*', controller.home.index);
};
