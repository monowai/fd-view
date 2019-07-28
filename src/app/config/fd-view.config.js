import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import reducer from './reducers';

/** @ngInject */
function appConfig(
  $locationProvider,
  $urlRouterProvider,
  $compileProvider,
  $httpProvider,
  toastrConfig,
  $qProvider,
  $ngReduxProvider
) {
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

  // fix for the layout footer
  setTimeout(() => {
    $.AdminLTE.layout.fix();
  }, 500); // eslint-disable-line

  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  $ngReduxProvider.createStoreWith({ reducer }, [thunk, logger]);
}

export default appConfig;
