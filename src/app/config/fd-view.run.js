angular
  .module('fd-view')
  .run(appRun);

/** @ngInject */
function appRun($transitions, $rootScope, $state, AuthenticationSharedService, User, Session, toastr, USER_ROLES) {
  $transitions.onStart({}, trans => {
    User.isAuthorized = AuthenticationSharedService.isAuthorized;
    User.userRoles = USER_ROLES;
    AuthenticationSharedService.valid(trans.$to().data.authorizedRoles);
  });

  // Call when the the client is confirmed
  const loginConfirmed = $rootScope.$on('event:auth-loginConfirmed', () => {
    User.authenticated = true;
    if (!User.account.apiKey && Session.userRoles.includes('ROLE_FD_ADMIN')) {
      $state.go('admin.user');
    } else if ($state.is('login')) {
      $state.go('welcome');
    }
  });

  // Call when the 401 response is returned by the server
  const loginRequired = $rootScope.$on('event:auth-loginRequired', () => {
    // if ($rootScope.authenticated.username || $scope.password) {
    // Only display this if the user is attempting to login, not when they just hit the page
    toastr.warning('Please login with valid credentials...');
    // }
    Session.invalidate();
    delete User.authenticated;
    if (!$state.is('settings') && !$state.is('login')) {
      $state.go('login');
    }
  });

  // Call when the 403 response is returned by the server
  const notAuthorized = $rootScope.$on('event:auth-notAuthorized', (event, data) => {
    toastr.error(data.message, 'Error');
  });

  // Call when the 404 response is returned by the server
  const notFound = $rootScope.$on('event:not-found', () => {
    $rootScope.errorMessage = 'errors.404';
    toastr.warning('Please, check your <a ui-sref="settings">Settings</a>', 'Resource not found!',
      {allowHtml: true});
  });

  // Call when the 500 response is returned by the server
  const serverError = $rootScope.$on('event:server-error', (event, data) => {
    toastr.error(data.message);
  });

  const serverReport = $rootScope.$on('event:server-report', (event, data) => {
    toastr.warning(data.message);
  });

  // Call when the 200 response is returned by the server
  const statusOk = $rootScope.$on('event:status-ok', (event, data) => {
    toastr.success(data, 'Success');
  });

  // Call when the user logs out
  const loginCancelled = $rootScope.$on('event:auth-loginCancelled', () => {
    $state.go('login');
    toastr.success('Successfully logged out...');
  });

  // Call when the user logs out
  const sessionTimeout = $rootScope.$on('event:auth-session-timeout', () => {
    $state.go('login');
  });
}
