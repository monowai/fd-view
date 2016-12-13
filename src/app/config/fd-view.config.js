angular
  .module('fd-view')
  .config(appConfig);

/** @ngIject */
function appConfig($locationProvider, $urlRouterProvider, $compileProvider, $httpProvider, toastrConfig, $qProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob|data):/);

  $httpProvider.defaults.withCredentials = true;
  // $httpProvider.interceptors.push('interceptorNgProgress');

  angular.extend(toastrConfig, {
    newestOnTop: false,
    positionClass: 'toast-top-center',
    // preventDuplicates: true,
    closeButton: true,
    target: 'body'
  });

  $qProvider.errorOnUnhandledRejections(false);
}
