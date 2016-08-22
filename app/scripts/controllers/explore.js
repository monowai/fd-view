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

fdView.controller('ExploreCtrl', ['$scope', '$http', 'MatrixRequest', '$compile', '$controller', 'configuration', 'toastr',
  function ($scope, $http, MatrixRequest, $compile, $controller, configuration, toastr) {
    $scope.matrix = MatrixRequest.lastMatrix();
    if(_.isEmpty($scope.matrix)) {
      angular.element('[data-target="#search"]').tab('show');
      $scope.graphData = [];
      MatrixRequest.sharedRlxChecked = false;
      MatrixRequest.reciprocalExcludedChecked = true;
    } else {
      $scope.graphData=$scope.matrix;
      if (!MatrixRequest.reciprocalExcluded() && MatrixRequest.sharedChecked()) {
        toastr.warning('Search results are not optimal for the graph. You can change <strong>Search settings</strong>.', 'Warning',
          {allowHtml: true});
      }
    }

    $scope.layouts = [{name: 'cose'},
      {name: 'grid'},{name: 'concentric'},
      {name: 'circle'}, {name: 'breadthfirst'},
      {name: 'dagre'}];
    $scope.layout = $scope.layouts[0];

    var nodeColor = d3.scale.category20();

    $scope.styles = [
      {'selector': 'node',
      'css': {
        'content': 'data(name)',
        'font-size': '15pt',
        'min-zoomed-font-size': '9pt',
        'text-halign': 'center',
        'text-valign': 'center',
        'color': 'white',
        'background-color': function (ele) { return nodeColor(ele.data().label); },
        'text-outline-width': 2,
        'text-outline-color': '#888',
        'width': '50',
        'height': '50'
      }},
      {'selector':'edge',
        'css':{
          'width': 'data(count)',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }},
      {'selector':':selected',
        'css':{
          'background-color': 'black',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'text-outline-color': 'black'
        }},
      {'selector':'.mouseover',
        'css':{
          'color':'#499ef0'
      }}
    ];

    $scope.qtip = function () {
      if (this.group()==='nodes') {
        return '<strong>'+this.data('id')+' </strong>'+this.data().name+
               '<br><strong>Type: </strong>'+this.data().label;
      } else {
        return '<strong>Count: </strong>'+this.data().count;
      }

    };

    $scope.search = function () {
      angular.element('[data-target="#view"]').tab('show');

      MatrixRequest.matrixSearch().then(function (data) {
        if (!data || data.edges.length === 0) {
          toastr.info('No data was found. Try altering your criteria');
          return data;
        }
        $scope.graphData = data;
      });
    };
  }]);
