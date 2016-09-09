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

// New Search Controller
fdView.controller('MetaHeaderCtrl', ['$scope', 'EntityService', '$timeout', '$anchorScroll', '$uibModal', 'QueryService', 'MatrixRequest', 'configuration', 'SearchService',
  function ($scope, EntityService, $timeout, $anchorScroll, $uibModal, QueryService, MatrixRequest, configuration, SearchService) {
    var ctrl = this;
    //ToDo: Why do I need to Explore functions?
    $scope.advancedSearch = false;
    $scope.searchResultFound = false;
    $scope.logResultFound = false;
    $scope.seeLogsAction = false;
    $scope.searchResults = [];
    $scope.logsResults = [];
    $scope.selectedLog = [];
    $scope.fragments = [];
    // ToDo: Fortress+DocType structure rather than x^2
    ctrl.fortress = SearchService.fortress ? SearchService.fortress[0] : "";
    ctrl.types = SearchService.types ? SearchService.types.map(function (t) { return {name: t}; }) : [];

    $scope.tf = SearchService.term;

    $scope.openGraphExplorer = function (entityKey) {
      EntityService.getEntityPK(entityKey).then(function (id) {
        var url = configuration.exploreUrl() + 'graph.html?id=' + id;
        window.open(url);
      });
    };

    $scope.openDetailsView = function (entityKey) {
      window.open('#/view/' + entityKey);
    };

    $scope.showAdvancedSearch = function () {
      $scope.advancedSearch = !$scope.advancedSearch;
    };

    $scope.loadTypes = function (fortress) {
      if (fortress) {
        return QueryService.doc(fortress);
      }
    };

    $scope.setFilter = function (fortress, type) {
      if (ctrl.fortress!==fortress) {
        ctrl.types = [];
        ctrl.fortress = fortress;
      }
      if (type && _.findIndex(ctrl.types, {name: type})<0) ctrl.types.push({name: type});
    };

    $scope.search = function () {
      var typesToBeSend = ctrl.types.map(function (t) { return t.name; });

      $scope.sr = new SearchService(MatrixRequest.searchText || '*', ctrl.fortress, typesToBeSend, (!$scope.tf || $scope.tf.disabled) ? null : $scope.tf);
      $scope.sr.nextPage(function () {
        $timeout(function(){$anchorScroll('results')},100);
      });

      $scope.searchResultFound = true;
      $scope.logResultFound = false;
    };

    $scope.findLogs = function (entityKey, index) {
      if ($scope.searchResults[index]['logs'] === null && !$scope.searchResults[index]['seeLogsAction']) {
        $scope.metaheaderSelected = entityKey;
        EntityService.getLogsForEntity(entityKey).then(function (data) {
          $scope.searchResults[index]['logs'] = data.changes;
          $scope.searchResults[index]['seeLogsAction'] = true;
          console.log('$scope.searchResults : ', $scope.searchResults);
          $scope.logsResults = data.changes;
          $scope.fragments = data.fragments;
          $scope.logResultFound = true;
        });
      }
      else {
        $scope.searchResults[index]['seeLogsAction'] = !$scope.searchResults[index]['seeLogsAction'];
      }
    };

    $scope.openPopup = function (logId) {
      $scope.log1 = EntityService.getJsonContentForLog($scope.metaheaderSelected, logId);
//            .then(function(data){
//            $scope.log1 = data;
//        });

      var modalInstance = $uibModal.open({
        templateUrl: 'singleLogModalContent.html',
        controller: ModalInstanceSingleLogCtrl,
        resolve: {
          log1: function () {
            return $scope.log1;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    $scope.openDeltaPopup = function () {
      var logId1 = $scope.selectedLog[0];
      var logId2 = $scope.selectedLog[1];


      // Getting Log1
      $scope.log1 = EntityService.getJsonContentForLog($scope.metaheaderSelected, logId1);

      // Getting Log2
      $scope.log2 = EntityService.getJsonContentForLog($scope.metaheaderSelected, logId2);

      var modalInstance = $uibModal.open({
        templateUrl: 'myModalContent.html',
        controller: ModalInstanceCtrl,
        resolve: {
          log1: function () {
            return $scope.log1;
          },
          log2: function () {
            return $scope.log2;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    $scope.selectLog = function (logId) {
      if ($scope.selectedLog.indexOf(logId) === -1) {
        $scope.selectedLog.push(logId);
      }
      else {
        $scope.selectedLog.splice($scope.selectedLog.indexOf(logId), 1);
      }
    }

}]);


var ModalInstanceCtrl = ['$scope', '$uibModalInstance', 'log1', 'log2', function ($scope, $uibModalInstance, log1, log2) {
  $scope.log1 = log1;
  $scope.log2 = log2;
  $scope.showUnchangedFlag = false;
  $scope.showUnchanged = function () {
    if (!$scope.showUnchangedFlag) {
      jsondiffpatch.formatters.html.showUnchanged();
    }
    else {
      jsondiffpatch.formatters.html.hideUnchanged();
    }
    $scope.showUnchangedFlag = !$scope.showUnchangedFlag;
  };
  $scope.ok = function () {
    $uibModalInstance.dismiss('cancel');
  };
}];

var ModalInstanceSingleLogCtrl = ['$scope', '$uibModalInstance', 'log1', function ($scope, $uibModalInstance, log1) {
  $scope.log1 = log1;
  $scope.ok = function () {
    $uibModalInstance.dismiss('cancel');
  };
}];

fdView.factory('SearchService', ['EntityService', function (EntityService) {
  var Search = function (searchText, fortress, typesToBeSend, termFilter) {
    this.entities = [];
    this.busy = false;
    this.index=0;
    // this.total=0;
    this.searchText = searchText;
    this.fortress = fortress;
    this.typesToBeSend = typesToBeSend;
    var query = {match:{}};
    if (termFilter) {
      query.match[termFilter.name] = {
        query: termFilter.value,
        type: "phrase"
      };

      this.termFilter = {bool: {must: [{query: query}]}};
    }
  };

  Search.prototype.nextPage = function (callback) {
    if (this.busy || this.index===this.total) return;
    this.busy = true;

    EntityService.search(this.searchText, this.fortress, this.typesToBeSend, this.index, this.termFilter)
      .then(function (data) {
        angular.forEach(data.results, function (d) {
          d.resources = [];
          var uniqueList = [];
          _.find(d.fragments, function (ele, k) {
            var uniqueEle = _.difference(_.uniq(ele), uniqueList);
            if (uniqueEle.length > 0) {
              d.resources.push({key: k, value: uniqueEle});
              uniqueList = _.union(uniqueEle, uniqueList);
            }
          });
        });

        this.entities = this.entities.concat(data.results);
        this.index += data.results.length;
        this.total = data.total;
        this.busy = false;
        if(callback) callback();
      }.bind(this));
  };

  return Search;
}]);

fdView.filter('cleanCode', function () {
  return function (code) {
    var keys = code.split('.');
    if (keys.length>1) {
      return keys
        .filter(function (key) {
          return key!=='tag' && key!=='code';
        })
        .slice(-2)
        .reduce(function (acc, el) {
          return acc +'/'+el;
        });
    }
    return code;
  }
});
