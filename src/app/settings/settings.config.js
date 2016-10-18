/** @ngInject */
function SettingsConfig($stateProvider, USER_ROLES) {
  $stateProvider
    .state('settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsCtrl',
      controllerAs: '$ctrl',
      data: {
        authorizedRoles: [USER_ROLES.user]
      }
    });
}

angular
  .module('fd-view')
  .config(SettingsConfig);
