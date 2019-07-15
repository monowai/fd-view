/** @ngInject */
function SettingsConfig($stateProvider, USER_ROLES) {
  $stateProvider.state('settings', {
    url: '/settings',
    component: 'settingsView',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  });
}

export default SettingsConfig;
