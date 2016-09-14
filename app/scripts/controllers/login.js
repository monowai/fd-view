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

/**
 * Created by Nabil on 09/08/2014.
 */

"use strict";

fdView.controller('LoginCtrl', ['$scope', '$http', '$interval', '$stateParams', 'AuthenticationSharedService', 'configuration',
  function ($scope, $http, $interval, $stateParams, AuthenticationSharedService, configuration) {
    var ping = $interval(function () {
      $http({
        method: 'GET',
        url: configuration.engineUrl()+'/api/ping/',
        transformResponse: []
      }).then(function () {
          stopPing();
        },function () {
          $scope.failed = true;
        });
    }, 5000);

    var stopPing = function () {
      if (angular.isDefined(ping)){
        $interval.cancel(ping);
        ping = undefined;
        $scope.failed = undefined;
      }
    };

    $scope.login = function () {
      AuthenticationSharedService.login($scope.username, $scope.password)
        .then(function (res) {
          $scope.setCurrentUser(res.data);
        });
    };

    $scope.logout = function () {
      AuthenticationSharedService.logout();
    };

    $scope.$on('$destroy', function () {
      stopPing();
    })


}]);
