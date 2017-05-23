/** @ngInject */
function AdminConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('admin', {
      url: '/admin',
      component: 'adminView',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    })
    .state('admin.health', {
      url: '/health',
      template: '<fd-info-box info="$ctrl.health"></fd-info-box>'
    })
    .state('admin.fortress', {
      url: '/fortress',
      component: 'adminFortress'
    })
    .state('admin.user', {
      url: '/user',
      component: 'adminUser'
    });
}

export default AdminConfig;
