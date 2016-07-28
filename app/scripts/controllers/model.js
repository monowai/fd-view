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

    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    ContentModel.getAll().then(function (res) {
      $scope.cplist = res.data;
    });

    $scope.createProfile = function () {
      $state.go('contentModel');
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

    $scope.openFile = function (ele) {
      var reader = new FileReader();
      reader.onload = function(onLoadEvent) {
        var fileContent = onLoadEvent.target.result,
            models = JSON.parse(fileContent);
        ContentModel.uploadModel(models).then(function (res) {
          $rootScope.$broadcast('event:status-ok', res.statusText);
          if (models.length === 1) {
            $state.go('contentModel', {modelKey: res.data[0].key});
          } else {
            $scope.cplist = $scope.cplist.concat(res.data);
          }
        });
      };
      reader.readAsText(ele.files[0]);
    };

  }]);
