/** @ngInject */
function StatsConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('statistics', {
      url: '/statistics',
      component: 'statsView',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(StatsConfig);
