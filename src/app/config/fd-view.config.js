/*
 *
 *  Copyright (c) 2012-2017 "FlockData LLC"
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
