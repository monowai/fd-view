/*
 *
 *  Copyright (c) 2012-2016 "FlockData LLC"
 *
 *  This file is part of FlockData.
 *
 *  FlockData is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  FlockData is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FlockData.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var fdView = angular.module('fdView', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'toastr',
  'ngTagsInput',
  'ngProgress',
  'angularMoment',
  'config',
  'fdView.directives',
  'http-auth-interceptor',
  'ab.graph.matrix.directives',
  'ng.jsoneditor',
  'ngTableResize',
  'monospaced.elastic',
  'ngTextcomplete',
  'infinite-scroll',
  'ui.tree',
  'sticky'
])
  .config(['$stateProvider','$urlRouterProvider','$locationProvider','USER_ROLES', function ($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES) {
    $stateProvider
      .state('welcome', {
        url: '/',
        templateUrl: 'views/welcome.html',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        data: {
          authorizedRoles: [USER_ROLES.all]
        }
      })
      .state('search', {
        url: '/search',
        templateUrl: 'views/search.html',
        controller: 'MetaHeaderCtrl as $ctrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('analyze', {
        url: '/analyze',
        templateUrl: 'views/analyze.html',
        controller: 'AnalyzeCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('explore', {
        url: '/explore',
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('view', {
        url: '/view/:entityKey',
        templateUrl: 'views/viewentity.html',
        controller: 'ViewEntityCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('statistics', {
        url: '/statistics',
        templateUrl: 'views/statistics.html',
        controller: 'StatsCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('model', {
        url: '/model',
        templateUrl: 'views/model.html',
        controller: 'ModelCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('contentModel', {
        url: '/edit/:modelKey',
        templateUrl: 'views/modeleditor.html',
        controller: 'EditModelCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      })
      .state('admin.health', {
        url: '/health',
        template: '<fd-info-box info="health"></fd-info-box>'
      })
      .state('admin.fortress', {
        url: '/fortress',
        templateUrl: 'views/admin-fortress.html',
        controller: 'AdminFortressCtrl'
      })
      .state('admin.user', {
        url: '/user',
        template: '<fd-info-box info="user"><button class="btn btn-warning pull-right" ng-click="editProfile(profile)" ng-show="allowEdit(profile)">Edit</button></fd-info-box>'//,
        // controller: 'AdminUserCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl',
        data: {
          authorizedRoles: [USER_ROLES.user]
        }
      });
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  }])
  .config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob|data):/);
  }])
  .config(['toastrConfig', function(toastrConfig) {
    angular.extend(toastrConfig, {
      newestOnTop: false,
      positionClass: 'toast-top-center',
      // preventDuplicates: true,
      closeButton: true,
      target: 'body'
    });
  }])
  .run(['$rootScope', '$state', '$http', 'AuthenticationSharedService', 'Session', 'toastr', 'USER_ROLES',
    function ($rootScope, $state, $http, AuthenticationSharedService, Session, toastr, USER_ROLES) {
      // TODO NEED TO SEE
      $rootScope.$on("$stateChangeError", console.log.bind(console));
      $rootScope.$on('$stateChangeStart', function (event, next) {
        $rootScope.isAuthorized = AuthenticationSharedService.isAuthorized;
        $rootScope.userRoles = USER_ROLES;
        AuthenticationSharedService.valid(next.data.authorizedRoles);
      });

      // Call when the the client is confirmed
      $rootScope.$on('event:auth-loginConfirmed', function () {
        $rootScope.authenticated = true;
        if (!$rootScope.account.apiKey && Session.userRoles.indexOf('ROLE_FD_ADMIN')>-1) {
          $state.go('admin.user');
        } else if ($state.is('login')) {
          $state.go('welcome');
        }
      });

      // Call when the 401 response is returned by the server
      $rootScope.$on('event:auth-loginRequired',
        function () {
          //if ($rootScope.authenticated.username || $scope.password) {
          // Only display this if the user is attempting to login, not when they just hit the page
            toastr.warning('Please login with valid credentials...');
          //}
          Session.invalidate();
          delete $rootScope.authenticated;
          if (!$state.is('settings') && !$state.is('login')) {
            $state.go('login');
          }
        }
      );
      // Call when the 403 response is returned by the server
      $rootScope.$on('event:auth-notAuthorized',
        function (event,data) {
          toastr.error(data.message, 'Error');
        }
      );

      // Call when the 404 response is returned by the server
      $rootScope.$on('event:not-found',
        function () {
          $rootScope.errorMessage = 'errors.404';
          // if ($state.is('login')) {
            toastr.warning('Please, check your <a ui-sref="settings">Settings</a>','Resource not found!',
              {allowHtml: true});
          // } else {
          //   toastr.warning('Resource not found!');
          // }

        }
      );
      // Call when the 500 response is returned by the server
      $rootScope.$on('event:server-error',
        function (event,data) {
          toastr.error(data.message);
        }
      );

      $rootScope.$on('event:server-report',
        function (event,data) {
          toastr.warning(data.message);
        }
      );

      // Call when the 200 response is returned by the server
      $rootScope.$on('event:status-ok',
        function (event, data) {
          toastr.success(data, 'Success');
        }
      );
      // Call when the user logs out
      $rootScope.$on('event:auth-loginCancelled',
        function () {
          $state.go('login');
          toastr.success('Successfully logged out...');
        }
      );

      // Call when the user logs out
      $rootScope.$on('event:auth-session-timeout',
        function () {
          $state.go('login');
        }
      );
    }]);


fdView.provider('configuration', ['engineUrl', function ( engineUrl) {
  var config = {
    'engineUrl': localStorage.getItem('engineUrl') ||  engineUrl,
    'devMode': localStorage.getItem('devMode')
  };

  return {
    $get: function () {
      return {
        devMode: function () {
          return config.devMode;
        },
        engineUrl: function () {
          return config.engineUrl;
        },
        exploreUrl: function () {
          return config.exploreUrl;
        },
        setEngineUrl: function (engineUrl) {
          config.engineUrl = engineUrl || config.engineUrl;
          localStorage.setItem('engineUrl', engineUrl);
        },
        setDevMode: function (devMode) {
          //config.devMode = devMode || config.devMode;
          if (devMode) {
            config.devMode = devMode;
            localStorage.setItem('devMode', devMode);
          } else {
            delete config.devMode;
            localStorage.removeItem('devMode');
          }

        }

      };

    }
  };
}]);

fdView.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.interceptors.push('interceptorNgProgress');
}]);
