/** @ngInject */
function ModelConfig($stateProvider, USER_ROLES) {
  $stateProvider.state('model', {
    url: '/model',
    component: 'modelView',
    data: {
      authorizedRoles: [USER_ROLES.all]
    }
  });
}

export default ModelConfig;
