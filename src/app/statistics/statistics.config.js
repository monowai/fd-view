/** @ngInject */
function StatsConfig($stateProvider, USER_ROLES) {
  $stateProvider.state('statistics', {
    url: '/statistics',
    component: 'statsView',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  });
}

export default StatsConfig;
