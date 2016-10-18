/** @ngInject */
function LoginConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('login', {
      url: '/login',
      component: 'loginView',
      data: {
        authorizedRoles: [USER_ROLES.all]
      }
    })
    .state('welcome', {
      url: '/',
      component: 'welcomeView',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(LoginConfig);
