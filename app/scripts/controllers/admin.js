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

fdView.controller('AdminCtrl', ['$scope', '$state', '$rootScope', '$http', 'modalService', 'configuration',
  function ($scope, $state, $rootScope, $http, modalService, configuration) {

    $scope.health = {title: 'Health'};
    $http.get(configuration.engineUrl() + '/api/v1/admin/health').then(function (res) {
      $scope.fdhealth = res.data;
      $scope.health.state = res.data;
    });

    $scope.user = {
      title: 'Profile',
      state: $scope.profile
    };

    $scope.allowEdit = function (profile) {
      return profile.userRoles.indexOf('ROLE_FD_ADMIN')>-1 && !profile.apiKey;
    };

    $scope.editProfile = function (profile) {
      modalService.show({
        templateUrl: 'edit-user.html'
      }, {obj: profile, disable:true}).then(function (res) {
        $http.post(configuration.engineUrl() + '/api/v1/profiles/',
          {login: res.login,
            name: res.name,
            companyName: res.companyName,
            email: res.email
          }).then(function (response) {
            $rootScope.$broadcast('event:status-ok', response.statusText);
            angular.extend(profile, response.data);
          });
      });
    };
  }]);

fdView.controller('AdminFortressCtrl', ['$scope', '$rootScope', 'QueryService', 'AuthenticationSharedService', '$state', '$http', '$timeout', 'modalService', 'configuration', 'USER_ROLES',
  function ($scope, $rootScope, QueryService, AuthenticationSharedService, $state, $http, $timeout, modalService, configuration, USER_ROLES) {

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    $scope.isAdmin = function () {
      return AuthenticationSharedService.isAuthorized(USER_ROLES.admin);
    };

    $scope.selectFortress = function(f) {
      var query = [f.name];
      $scope.typeOpen = true;
      $scope.fortress = f;
      QueryService.query('documents', query).then(function (data) {
        $scope.documents = data;
        $scope.isOpen = false;
      });
    };

    $scope.next = function () {
      var i = $scope.fortresses.indexOf($scope.fortress);
      var f = $scope.fortresses[i<$scope.fortresses.length-1 ? i+1 : 0];
      $scope.selectFortress(f);
    };
    $scope.previous = function () {
      var i = $scope.fortresses.indexOf($scope.fortress);
      var f = $scope.fortresses[i!==0 ? i-1 : $scope.fortresses.length-1];
      $scope.selectFortress(f);
    };

    $scope.editFortress = function (f) {
      var modalDefaults = {
        templateUrl: 'views/partials/configDPModal.html'
      };
      var modalOptions = {
        entity: 'Data Provider',
        obj: f
      };

      modalService.showModal(modalDefaults, modalOptions).then(function (res) {
        $http.post(configuration.engineUrl()+'/api/v1/fortress/', res).then(function(response){
          $rootScope.$broadcast('event:status-ok', response.statusText);
          $scope.fortress = response.data;
          $scope.fortresses.push($scope.fortress);
        });
      });
    };

    $scope.deleteFortress = function (f) {
      var modalDefaults = {
        size: 'sm'
      };
      var modalOptions = {
        obj: f,
        title: 'Delete...',
        text: 'Warning! You are about to delete the Data Provider - "'+f.name+'" and all associated data. Do you want to proceed?'
      };
      modalService.showModal(modalDefaults,modalOptions).then(function (res) {
        $http.delete(configuration.engineUrl()+'/api/v1/admin/'+res.code).then(function (response) {
          $rootScope.$broadcast('event:status-ok', response.statusText);
          $scope.fortresses.splice($scope.fortresses.indexOf(f), 1);
          $scope.fortress = null;
        });
      });
    };

    $scope.rebuildFortress = function (f) {
      $http.post(configuration.engineUrl()+'/api/v1/admin/'+f.code+'/rebuild').then(function (res) {
        $rootScope.$broadcast('event:status-ok', res.statusText);
      });
    };

    $scope.rebuildFortressDoc = function (f,d) {
      $http.post(configuration.engineUrl()+'/api/v1/admin/'+f.code+'/'+d.name+'/rebuild').then(function (res) {
        $rootScope.$broadcast('event:status-ok', res.statusText);
      });
    };

    $scope.selectDocType = function (d) {
      $http.get(configuration.engineUrl() + '/api/v1/fortress/'+$scope.fortress.code+'/'+d.name+'/segments').then(function (response) {
        $scope.segments = response.data[0].segments;
      });
    };

    $scope.editType = function (doc) {
      var modalDefaults = {
        templateUrl: 'views/partials/configDPModal.html'
      };
      var modalOptions = {
        entity: 'Document Type',
        obj: doc,
        disable: true
      };

      modalService.showModal(modalDefaults, modalOptions).then(function (res) {
        $http({
          method: 'PUT',
          url: configuration.engineUrl() + '/api/v1/fortress/' +$scope.fortress.code+'/'+res.name,
          dataType: 'raw',
          headers: {
            'Content-Type': 'application/json'
          },
          data: ''
        }).then(function(response){
          $rootScope.$broadcast('event:status-ok', response.statusText);
          $scope.documents.push(response.data);
        });
      });
    };

    $scope.deleteDocType = function (f, dt) {
      var modalDefaults = {
        size: 'sm'
      };
      dt.type = 'Document Type';
      var modalOptions = {
        obj: dt,
        title: 'Delete...',
        text: 'Warning! You are about to delete the Document Type - "'+dt.name+'" and all associated data. Do you want to proceed?'
      };
      modalService.showModal(modalDefaults,modalOptions).then(function (res) {
        $http({
          method: 'DELETE',
          url: configuration.engineUrl() + '/api/v1/admin/' +f.code+'/'+res.name,
          dataType: 'raw',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          $rootScope.$broadcast('event:status-ok', response.message);
          $scope.documents.splice($scope.documents.indexOf(dt), 1);
        });
      });
    };

    $scope.deleteSegment = function (f,dt,s) {
      var modalDefaults = {
        size: 'sm'
      };

      var modalOptions = {
        obj: {name: s},
        title: 'Delete segment...',
        text: 'Warning! You are about to delete the Document Segment - "'+s+'" and all associated data. Do you want to proceed?'
      };
      modalService.showModal(modalDefaults,modalOptions).then(function (res) {
        $http({
          method: 'DELETE',
          url: configuration.engineUrl() + '/api/v1/admin/' +f.code+'/'+dt.name+'/'+res.name,
          dataType: 'raw',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          $rootScope.$broadcast('event:status-ok', response.message);
          $scope.segments.splice($scope.segments.indexOf(s), 1);
        });
      });
    }
  }]);

// fdView.controller('AdminUserCtrl', ['$scope', '$rootScope', '$uibModal', 'QueryService', 'AuthenticationSharedService', '$state', '$http', '$timeout', 'configuration', 'USER_ROLES',
//   function ($scope, $rootScope, $uibModal, QueryService, AuthenticationSharedService, $state, $http, $timeout, configuration, USER_ROLES) {
//
//   }]);
