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
 * Created by dmty on 10/08/16.
 */

'use strict';

fdView.controller('StatsCtrl', ['$scope', 'QueryService',
  function ($scope, QueryService) {
    QueryService.general('fortress').then(function (data) {
      $scope.fortresses = data;
    });

    $scope.chartOptions = {
      type: 'pie',
      titleField: 'key',
      valueField: 'doc_count',
      creditsPosition: 'bottom-right'
    };

    $scope.selectFortress = function (f) {
      var payload = {
        'size': 0,
        'fortress': f.name,
        'query': {
          'match_all': {}
        },
        'aggs' : {
          'count_by_type' : {
            'terms' : {
              'field' : '_type'
            }
          }
        }
      };

      QueryService.query('es',payload).then(function (data) {
        $scope.chartOptions.dataProvider = data.aggregations.count_by_type.buckets;
        AmCharts.makeChart('docChart', $scope.chartOptions);
      });

    };

  }
]);
