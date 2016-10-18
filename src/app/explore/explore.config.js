/** @ngInject */
function ExploreConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('explore', {
      url: '/explore',
      component: 'exploreView',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(ExploreConfig);
