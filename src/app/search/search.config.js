/** @ngInject */
function SearchConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('search', {
      url: '/search',
      component: 'searchView',
      params: {
        filter: null
      },
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    })
    .state('view', {
      url: '/view/:entityKey',
      component: 'viewEntity',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(SearchConfig);
