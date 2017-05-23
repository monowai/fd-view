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

export default class ConceptModalCtrl {
  constructor($uibModalInstance, $http, configuration, fortress) {
    const ctrl = this;
    ctrl.title = fortress.name;
    ctrl.layouts = [{name: 'dagre'},
      {name: 'circle'},
      {name: 'cose', randomize: true},
      {name: 'grid'},
      {name: 'concentric'},
      {name: 'random'},
      {name: 'breadthfirst'}];
    ctrl.layout = ctrl.layouts[0];

    ctrl.styles = [
      {
        selector: 'node',
        css: {
          'content': 'data(name)',
          // 'font-size': '12pt',
          'min-zoomed-font-size': '9pt',
          'text-halign': 'center',
          'text-valign': 'center',
          'color': '#222D32',
          'background-color': '#499ef5',
          'width': '120',
          'height': '55'
        }
      },
      {
        selector: 'node[label="Concept"]',
        css: {
          'background-color': '#ff7701'
        }
      },
      {
        selector: 'edge',
        css: {
          'curve-style': 'bezier',
          'content': 'data(relationship)',
          'width': 2,
          'color': '#fff',
          'line-color': '#888',
          'target-arrow-color': '#888',
          'target-arrow-shape': 'triangle',
          'edge-text-rotation': 'autorotate'
        }
      },
      {
        selector: ':selected',
        css: {
          'background-color': 'f2b871',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'text-outline-width': 2,
          'text-outline-color': '#888'
        }
      },
      {
        selector: 'node:selected',
        css: {
          'border-width': 2,
          'border-color': '#888'
        }
      }
    ];

    this._http = $http;
    this._uibmi = $uibModalInstance;
    this._cfg = configuration;
    this._fortress = fortress;
  }

  $onInit() {
    this._http.get(`${this._cfg.engineUrl()}/api/v1/concept/${this._fortress.name}/structure/`)
      .then(res => {
        this.conceptGraph = res.data;
      });
  }

  qtip() {
    const id = this.data('id');
    const edges = this._private.edges;
    if (this.data().label === 'Concept') {
      return _(edges)
        .map(e => e._private.data.relationship)
        .uniq()
        .reduce((s, r) => `${s}<br>${r}`, `<strong>${this.data('name')}:</strong>`);
    }
    return this.data().label || this.data().relationship;
  }

  close() {
    this._uibmi.dismiss();
  }
}
