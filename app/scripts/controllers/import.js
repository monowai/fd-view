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

fdView.controller('ImportCtrl', ['$scope', '$window', '$rootScope', '$uibModal', 'QueryService', 'ContentProfile', '$state', '$http', '$timeout', '$compile', 'configuration',
  function ($scope, $window, $rootScope, $uibModal, QueryService, ContentProfile, $state, $http, $timeout, $compile, configuration) {
    //$state.transitionTo('import.load');

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    ContentProfile.getAll().then(function (res) {
      $scope.cplist = res.data;
    });

    $scope.createProfile = function () {
      $uibModal.open({
        templateUrl: 'create-profile.html',
        scope: $scope,
        controller: function ($uibModalInstance) {
          $scope.new = {};

          $scope.cancel = $uibModalInstance.dismiss;

          $scope.selectFortress = function(fortress) {
            var query = [fortress];
            QueryService.query('documents', query).then(function (data) {
              $scope.documents = data;
              if(data.length>0) {
                $scope.new.documentType = $scope.documents[0];
              }
            });
          };

          $scope.createFortress = function() {
            $uibModal.open({
              templateUrl: 'create-fortress-modal.html',
              resolve: {
                timezones: function() {
                  return $http.get(configuration.engineUrl() + '/api/v1/fortress/timezones').then(function (response) {
                    return response.data;
                  })
                }
              },
              controller: ['$scope','$uibModalInstance','timezones',function($scope, $uibModalInstance, timezones) {
                $scope.searchable = true;
                $scope.timezones = timezones;
                $scope.timezone = moment.tz.guess();
                $scope.close = $uibModalInstance.dismiss;
                $scope.save = function() {
                  var newFortress = {
                    name: $scope.name,
                    searchEnabled: $scope.searchable,
                    storeEnabled: $scope.versionable,
                    timeZone: $scope.timezone
                  };
                  $http.post(configuration.engineUrl()+'/api/v1/fortress/', newFortress).then(function(response){
                    $rootScope.$broadcast('event:status-ok', response.statusText);
                    $uibModalInstance.close(response.data);
                  });
                };
              }]
            }).result.then(function(newDP){
              $scope.fortresses.push(newDP);
              $scope.new.fortress = newDP;
              $scope.documents = [];
            });
          };

          $scope.createType = function(f) {
            if(!f) {return;}
            $uibModal.open({
              templateUrl: 'create-type-modal.html',
              size: 'sm',
              resolve: {
                fortress: function() {
                  return f.name.toLowerCase().replace(/\s+/g, '');
                }
              },
              controller: ['$scope','$uibModalInstance','fortress', function($scope, $uibModalInstance, fortress) {
                $scope.searchable = false;
                $scope.versionable = false;
                $scope.close = $uibModalInstance.dismiss;
                $scope.save = function(name) {
                  // -- waiting for end point added
                  // var newType = {
                  //   name: $scope.name,
                  //   searchEnabled: $scope.searchable,
                  //   storeEnabled: $scope.versionable
                  // };
                  // $http.post(configuration.engineUrl()+'/api/v1/fortress/'+fortress+'/docs/',newType).then(function(response){
                  //   $uibModalInstance.close(response.data);
                  // });
                  $http({
                    method: 'PUT',
                    url: configuration.engineUrl() + '/api/v1/fortress/' +fortress+'/'+name,
                    dataType: 'raw',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    data: ''
                  }).then(function(response){
                    $rootScope.$broadcast('event:status-ok', response.statusText);
                    $uibModalInstance.close(response.data);
                  });
                };
              }]
            }).result.then(function(newDocType){
              $scope.documents.push(newDocType);
              $scope.new.documentType = newDocType;
            });
          };

          $scope.createEmpty = function(profile) {
            ContentProfile.createEmpty(profile);
            $uibModalInstance.close(profile);
          }
        }
      }).result.then(function (profile) {
        $state.go('contentProfile');
        // angular.element('[data-target="#editor"]').tab('show');
        // $scope.editProfile(profile);
      });
    };

    $scope.editProfile = function (profile) {
      if (profile) {
        ContentProfile.getProfile(profile).then(function () {
          $state.go('contentProfile');
        });
      }
    };


  }]);


fdView.controller('LoadProfileCtrl', ['$scope', '$uibModal', 'QueryService', 'ContentProfile', '$state', '$http', '$timeout', '$compile', 'configuration',
  function ($scope, $uibModal, QueryService, ContentProfile, $state, $http, $timeout, $compile, configuration) {
    $scope.delim=',';
    $scope.hasHeader=true;

    $scope.loadFile = function(fileContent, fileName){
      $scope.fileName = fileName;
      $scope.csvContent = fileContent;
    };

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    $scope.fortress = ContentProfile.getFortress();
    $scope.type = ContentProfile.getDocType();

    $scope.selectFortress = function(fortress) {
      var query = [fortress];
      QueryService.query('documents', query).then(function (data) {
        $scope.documents = data;
        if(data.length>0) {
          $scope.type = $scope.documents[0].name;
          $scope.selectProfile($scope.type);
        }
      });
    };

    $scope.selectProfile = function (type) {
      ContentProfile.getProfile($scope.fortress, type)
        .success(function (data) {
          $scope.contentProfile = data;
          $scope.profileGraph = profile2graph();
        })
        .error(function(){
          $scope.noProfile = true;
        });
    };

    var profile2graph = function () {
      return ContentProfile.graphProfile();
    };



    $scope.checkProfile = function() {
      if (!$scope.fortress) {
        $uibModal.open({
          templateUrl: 'error-modal.html',
          size: 'sm',
          controller: function($scope, $uibModalInstance){
            $scope.missing = 'Data Provider';
            $scope.ok = $uibModalInstance.dismiss;
          }
        });
      } else if (!$scope.type) {
        $uibModal.open({
          templateUrl: 'error-modal.html',
          size: 'sm',
          controller: function($scope, $uibModalInstance){
            $scope.missing = 'Data Type';
            $scope.ok = $uibModalInstance.dismiss;
          }
        });
      } /*else if (!$scope.csvContent) {
       $uibModal.open({
       templateUrl: 'error-modal.html',
       size: 'sm',
       controller: function($scope, $uibModalInstance){
       $scope.missing = 'CSV file';
       $scope.ok = $uibModalInstance.dismiss;
       }
       });
       }*/ else {
        if ($scope.csvContent) {
          var csvParser = d3.dsv($scope.delim, 'text/plain');
          csvParser.parse($scope.csvContent, function (data) {
            $scope.data = data;
            $scope.keys = d3.keys(data);
          });
        }
        // option for comma only
        // d3.csv.parse($scope.csvContent, function(data){
        //   $scope.data = data;
        //   $scope.keys = d3.keys(data);
        // });

        $state.go('import.edit', {keys: $scope.keys});
      }
    };

    $scope.reset = function(){
      $state.reload();
    };

  }]);
