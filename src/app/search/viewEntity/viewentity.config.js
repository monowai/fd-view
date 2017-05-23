/** @ngInject */
function ViewEntityConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('view', {
      url: '/view/:entityKey',
      component: 'viewEntity',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

export default ViewEntityConfig;
