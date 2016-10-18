/** @ngInject */
function ModelConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('model', {
      url: '/model',
      component: 'modelView',
      data: {
        authorizedRoles: [USER_ROLES.all]
      }
    });
}

angular
  .module('fd-view.modeler')
  .config(ModelConfig);
