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
import angular from 'angular';
import _ from 'lodash';
import {dsvFormat} from 'd3';

import template from './sample-tab.html';

class SampleTabCtrl {
  /** @ngInject */
  constructor($window, ContentModel, DataSample, EditColdefModal, toastr, $document) {
    this.hasHeader = true;
    this.lastProvider = angular.fromJson($window.localStorage.getItem('last-provider'));

    this._window = $window;
    this._cm = ContentModel;
    this.sample = DataSample;
    this._edit = EditColdefModal;
    this._toastr = toastr;
    this._document = $document;
  }

  _setGrid(data) {
    this.sample.data = data.slice(0, 200);
    this.sample.data.totalImport = data.length;
    this.gridOptions = {
      columnDefs: _.map(data.columns, k => {
        return {field: k, headerName: k, editable: true, headerClass: () => {
          const column = this.model.content[k];
          if (column) {
            if (column.tag) {
              return 'tag';
            }
            if (column.$alias) {
              return 'alias';
            }
            if (column.callerRef) {
              return 'bg-green';
            }
            if (!column.persistent) {
              return 'dim';
            }
          }
        }};
      }),
      rowData: this.sample.data,
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowSelection: 'multiple',
      angularCompileHeaders: true,
      headerCellRenderer: params => {
        params.$scope.editColDef = this.showColDef;

        const eCell = this._document[0].createElement('span');
        eCell.innerHTML = `<span class="ag-click-ico" ng-click="$ctrl.showColDef('${params.colDef.headerName}')"><i class="fa fa-edit"></i></span>&nbsp;${params.colDef.headerName}`;
        return eCell;
      }
    };

    this._cm.updateModel(this.model);
    this._cm.getDefault({rows: this.sample.data})
      .then(res => {
        this._toastr.success('Data is loaded', 'Success');
        this.model = {};
        this.model = res;
        this.modelGraph = this._cm.graphModel();
        this.tags = this._cm.getTags();
        this.dataStats = this.sample.buildStats(data, res.content);
      }, res => {
        this._toastr.error(res, 'Error');
      });
  }

  previouslyLoaded() { // to fix
    return false;
    // this.model && Object.keys(this.model.content).length &&
    //   this._window.localStorage.hasOwnProperty('import-data') &&
    //   angular.equals(this.lastProvider, this.model.tagModel ?
    //   {provider: 'Tag', code: this.model.code} :
    //   {provider: this.model.fortress.name, type: this.model.documentType.name});
  }

  loadPrevious() {
    const model = this._cm.getCurrent().content;
    let data = angular.fromJson(this._window.localStorage.getItem('import-data'));
    data = data.map(row => {
      return _.forIn(row, (v, k) => {
        if (v && typeof v !== model[k].dataType) {
          if (model[k].dataType === 'number') {
            row[k] = Number(v);
          } else {
            row[k] = String(v);
          }
        }
      });
    });
    data.columns = angular.fromJson(this._window.localStorage.getItem('import-data-cols'));
    this._setGrid(data);
  }

  loadFile(fileContent, fileName, delim) {
    const model = this._cm.getCurrent().content;
    if (fileContent) {
      const lines = fileContent.match(/[^\r\n]+/g);
      let i = 0;
      while (lines[i].match(/^#.*/)) {
        lines[i] = '';
        i++;
      }
      const clean = lines.join('\n').trim();

      const data = dsvFormat(delim === '\\t' ? '\t' : delim).parse(clean, d => {
        return _.forIn(d, (v, k) => {
          if (/^\s*$/.test(v)) {
            d[k] = null;
            return;
          }
          if (model[k] && model[k].dataType === 'string') {
            return;
          }
          if (/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i.test(v)) {// /^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
            d[k] = Number(v);
          }
        });
      });
      this._window.localStorage.setItem('import-data', angular.toJson(data));
      this._window.localStorage.setItem('import-data-cols', angular.toJson(data.columns));
      let lastProvider = {};
      if (this.model.tagModel) {
        lastProvider = {
          provider: 'Tag', code: this.model.code
        };
      } else {
        lastProvider = {
          provider: this.model.fortress.name,
          type: this.model.documentType.name};
      }

      this._setGrid(data);
      this._window.localStorage.setItem('last-provider', angular.toJson(lastProvider));
    } else {
      this._toastr.warning('File is not loaded', 'Warning');
    }
  }

  showColDef(key, options) {
    this._edit.display(key, options);
  }
}

export const sampleTab = {
  bindings: {
    model: '='
  },
  controller: SampleTabCtrl,
  template
};
