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

fdView.controller('ModelCtrl', ['$scope', '$window', '$rootScope', '$filter', '$uibModal', 'modalService', 'QueryService', 'ContentModel', '$state', '$http', '$timeout', '$compile', 'configuration',
  function ($scope, $window, $rootScope, $filter, $uibModal, modalService, QueryService, ContentModel, $state, $http, $timeout, $compile, configuration) {
    //$state.transitionTo('import.load');

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    ContentModel.getAll().then(function (res) {
      $scope.cplist = res.data;
    });

    $scope.createProfile = function () {
      $uibModal.open({
        templateUrl: 'create-profile.html',
        scope: $scope,
        controller: ['$uibModalInstance', function ($uibModalInstance) {
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
                    $uibModalInstance.close(newFortress);
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

          $scope.createEmpty = function(isValid, model) {
            if (isValid) {
              model.tagsOnly = $scope.tags;
              ContentModel.createEmpty(model);
              $uibModalInstance.close(model);
            }
          }
        }]
      }).result.then(function (model) {
        if (model) {
          $state.go('contentModel');
        }
      });
    };

    $scope.editModel = function (model) {
      if (model) {
        ContentModel.getModel(model).then(function () {
          $state.go('contentModel');
        });
      }
    };

    $scope.selected = [];
    $scope.selectModel = function (key) {
      var idx = $scope.selected.indexOf(key);
      if (idx > -1) {
        $scope.selected.splice(idx, 1)
      } else {
        $scope.selected.push(key);
      }
    };

    $scope.selectAll = function () {
      var filtered = $filter('filter')($scope.cplist, $scope.fortress),
          listToSelect = (!!filtered && filtered.length > 0) ? filtered : $scope.cplist;
      if ($scope.selected.length!==listToSelect.length) {
        $scope.selected = _.map(listToSelect, function (m) {
          return m.key;
        });
        $scope.allSelected = true;
      } else {
        $scope.selected = [];
        $scope.allSelected = false;
      }
    };

    $scope.downloadModel = function (keys) {
      if (!!keys) {
        ContentModel.downloadModel(keys).then(function (res) {
          var data = JSON.stringify(res.data),
              blob = new Blob([data], {type: 'text/json'}),
              filename = keys[0]+'.json';
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
          }
          else{
            var e = document.createEvent('MouseEvents'),
                a = document.createElement('a');

            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window,
              0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
          }
        });
      }
    };

    $scope.deleteModel = function (keys) {
      if (!!keys && keys.length>0) {
        modalService.showModal({
          size: 'sm'
        },
        {
          title: 'Delete...',
          text: 'Warning! You are about to delete the Content Model(s). Do you want to proceed?'
        }).then(function () {
          _.each(keys, function (key) {
            ContentModel.deleteModel(key).then(function () {
              $scope.cplist = _.reject($scope.cplist, function (m) {
                return m.key === key;
              });
            });
          });
          $rootScope.$broadcast('event:status-ok', 'Done!');
        });
      }
      $scope.selected = [];
    };
  }]);


fdView.controller('LoadProfileCtrl', ['$scope', '$uibModal', 'QueryService', 'ContentModel', '$state', '$http', '$timeout', '$compile', 'configuration',
  function ($scope, $uibModal, QueryService, ContentModel, $state, $http, $timeout, $compile, configuration) {

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    $scope.fortress = ContentModel.getFortress();
    $scope.type = ContentModel.getDocType();

    $scope.selectFortress = function(fortress) {
      var query = [fortress];
      QueryService.query('documents', query).then(function (data) {
        $scope.documents = data;
        if(data.length>0) {
          $scope.type = $scope.documents[0].name;
          $scope.selectModel($scope.type);
        }
      });
    };

    $scope.selectModel = function (type) {
      ContentModel.getModel($scope.fortress, type)
        .success(function (data) {
          $scope.contentModel = data;
          $scope.modelGraph = model2graph();
        })
        .error(function(){
          $scope.noModel = true;
        });
    };

    var model2graph = function () {
      return ContentModel.graphModel();
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
        $state.go('import.edit', {keys: $scope.keys});
      }
    };

    $scope.reset = function(){
      $state.reload();
    };

  }]);
