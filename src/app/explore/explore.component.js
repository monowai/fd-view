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

import template from './explore.html';

import {scaleOrdinal, schemeCategory20, max as d3max} from 'd3';

class ExploreCtrl {
  /** @ngInject */
  constructor(MatrixRequest, toastr, $timeout) {
    this.matrix = MatrixRequest.lastMatrix();

    this.layouts = [
      {name: 'cose', randomize: true},
      {name: 'concentric'},
      {name: 'cola'},
      {name: 'grid'},
      {name: 'circle'},
      {name: 'breadthfirst'},
      {name: 'dagre'}];
    this.layout = this.layouts[0];

    const nodeColor = scaleOrdinal(schemeCategory20);

    this.styles = [
      {
        selector: 'node',
        css: {
          'content': 'data(name)',
          'font-size': '15pt',
          'min-zoomed-font-size': '9pt',
          'text-valign': 'bottom',
          'text-halign': 'right',
          'color': 'white',
          'background-color': ele => nodeColor(ele.data().label)
          // 'text-outline-width': 2,
          // 'text-outline-color': '#888',
          // 'width': '50',
          // 'height': '50'
        }
      },
      {
        selector: 'edge',
        css: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': 'black',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'text-outline-color': 'black'
        }
      },
      {
        selector: '.mouseover',
        css: {
          color: '#499ef0'
        }
      }
    ];

    this._matrix = MatrixRequest;
    this._toastr = toastr;
    this._timeout = $timeout;
  }

  $onInit() {
    if (Object.entries(this.matrix).length === 0) {
      angular.element('[data-target="#search"]').tab('show');
      this.graphData = [];
      this._matrix.sharedRlxChecked = false;
      this._matrix.reciprocalExcludedChecked = true;
    } else {
      this.graphData = this.matrix;
      if (!this._matrix.reciprocalExcluded() && this._matrix.sharedChecked()) {
        this._toastr.warning('Search results are not optimal for the graph. You can change <strong>Search settings</strong>.', 'Warning',
          {allowHtml: true});
        this._matrix.sharedRlxChecked = false;
        this._matrix.reciprocalExcludedChecked = true;
      }
      this.updateStyles(this.graphData);
    }
  }

  qtip() {
    if (this.group() === 'nodes') {
      const label = this.data().label;
      const name = this.data().name;
      let tooltipContent = `<strong>${this.data('id')}</strong>&nbsp;<a ui-sref="search({filter:{name: '${label}', value: '${name}'}})">${name}</a><br><strong>${label}</strong>`;
      const context = angular.element('ui-view');
      angular.element(context).injector().invoke([
        '$compile', $compile => {
          const scope = angular.element(context).scope();
          tooltipContent = $compile(tooltipContent)(scope);
        }
      ]);
      return tooltipContent;
    }
    return `<strong>Count: </strong>${this.data().count}`;
  }

  search() {
    this._matrix.matrixSearch().then(data => {
      if (!data || data.edges.length === 0) {
        this._toastr.info('No data was found. Try altering your criteria');
        return data;
      }
      angular.element('[data-target="#view"]').tab('show');

      this._timeout(() => {
        this.graphData = data;
        this.updateStyles(data);
      }, 300);
    });
  }

  updateStyles(data) {
    const maxCount = d3max(data.edges, d => d.data.count);
    const minCount = this._matrix.minCount;
    // const edgeWidth = d3.scaleLinear()
    //   .domain([this._matrix.minCount, maxCount])
    //   .range([1, maxCount < 15 ? maxCount : 15]);

    this.styles.push({
      selector: 'edge',
      css: {
        'width': `mapData(count,${minCount}, ${maxCount}, 1,${maxCount < 15 ? maxCount : 15})`, // function(ele) {return edgeWidth(ele.data('count'))},
        'line-color': '#067B7B',
        'target-arrow-color': '#067B7B',
        'target-arrow-shape': 'triangle'
      }
    });
  }
}

export const exploreView = {
  template,
  controller: ExploreCtrl
};
