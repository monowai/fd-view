/** @ngInject */
function AnalyzeConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('analyze', {
      url: '/analyze',
      component: 'analyzeView',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(AnalyzeConfig);
