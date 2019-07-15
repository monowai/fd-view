/** @ngInject */
function ModelEditorConfig($stateProvider, USER_ROLES) {
  $stateProvider.state('editModel', {
    url: '/edit/:modelKey',
    component: 'modelEditor',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  });
}

export default ModelEditorConfig;
