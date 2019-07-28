import _ from 'lodash';

export default class DataSampleService {
  /** ngInject */
  constructor(ContentModel, $http, configuration, $document, toastr) {
    this._cm = ContentModel;
    this._http = $http;
    this._cfg = configuration;
    this._document = $document;
    this._toastr = toastr;
  }

  buildStats(sample, model) {
    this.stats = _(sample.columns)
      .map(c => {
        const col = {
          type: model[c].dataType,
          missing: _(sample)
            .map(c)
            .filter(d => d === '')
            .pairs()
            .value().length
        };
        const o = {};
        if (model[c].callerRef) {
          o[c] = col;
        }
        if (model[c].tag || col.type === 'string') {
          const count = _(sample)
            .map(c)
            .countBy()
            .omit('')
            .pairs()
            .sortByOrder(_.last, 'desc')
            .value();
          o[c] = Object.assign(col, {
            stats: {
              unique: count.length,
              least: _.last(count),
              most: _.first(count),
              values: count
            }
          });
        }
        if (col.type === 'number' || col.type === 'date') {
          if (!model[c].callerRef) {
            o[c] = Object.assign(col, {
              stats: {
                min: d3.min(sample, d => d[c]),
                max: d3.max(sample, d => d[c]),
                mean: d3.mean(sample, d => d[c])
              }
            });
          }
        }
        return o;
      })
      .transform(_.ary(_.extend, 2), {})
      .value();
    return this.stats;
  }

  clean() {
    if (this.data) {
      delete this.data;
    }
    if (this.stats) {
      delete this.stats;
    }
    if (this.validationResult) {
      delete this.validationResult;
    }
  }

  convertCol(key, type) {
    let convertFn;
    // eslint-disable-next-line angular/typecheck-number
    if (type === 'number') {
      convertFn = d => Number(d);
    }
    // eslint-disable-next-line angular/typecheck-string
    if (type === 'string') {
      convertFn = d => d.toString();
    }
    if (type === 'date') {
      convertFn = d => moment(d);
    }

    _.forEach(this.data, row => {
      row[key] = convertFn(row[key]);
    });
  }

  validate(model) {
    this._cm.updateModel(model);
    return this._cm.validate(this.data).then(res => {
      this.validationResult = res.data;
      const entry = model.tagModel ? res.data.tags : res.data.entity;
      this.rows = _.map(res.data.results, (r, i) => {
        const row = entry[i] ? _.clone(entry[i].content.data) : { code: i };
        row._entry = entry[i];
        return Object.assign(row, {
          _messages: _(r)
            .filter(res => res.messages.length)
            .map(m => {
              const msg = {};
              msg[m.sourceColumn] = {
                expression: m.expression,
                messages: m.messages
              };
              return msg;
            })
            .transform(_.ary(_.extend, 2), {})
            .value()
        });
      });
      this.valGridOptions = {
        columnDefs: _(model.content)
          .map((v, k) => {
            return {
              field: k,
              headerName: k,
              editable: false,
              headerClass: () => {
                if (v.tag) {
                  return 'tag';
                }
                if (v.$alias) {
                  return 'alias';
                }
                if (v.callerRef) {
                  return 'bg-green';
                }
                if (!v.persistent) {
                  return 'dim';
                }
              },
              cellClass: params => (params.data._messages[k] ? 'bg-danger' : null),
              cellRenderer: params =>
                params.data._messages[k]
                  ? `<a href ng-click="$ctrl.showValidMsg(${params.rowIndex})" uib-tooltip="Click to see messages" tooltip-append-to-body="true"><i class="fa fa-warning"></i></a>`
                  : params.value || ''
            };
          })
          .unshift({
            field: 'code',
            headerName: 'Code',
            suppressSorting: true,
            suppressMenu: true,
            pinned: true,
            cellRenderer: params => {
              const msgsTpl = _.isEmpty(params.data._messages)
                ? ''
                : `<a href ng-click="$ctrl.showValidMsg(${params.rowIndex})" tooltip-placement="auto top-right" tooltip-append-to-body="true" uib-tooltip="Click to see messages"><i class="fa fa-warning"></i></a>`;
              const entityTpl = params.data._entry
                ? `<a href ng-click="$ctrl.showResult(${params.rowIndex})" tooltip-placement="auto top-right" tooltip-append-to-body="true" uib-tooltip="Click to see result entity">
                   <i class="fa fa-info"></i></a>`
                : '';
              return `${msgsTpl + entityTpl}&nbsp;<span>${params.value}</span>`;
            }
          })
          .value(),
        rowData: this.rows,
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        rowSelection: 'multiple',
        angularCompileHeaders: true,
        angularCompileRows: true,
        headerCellRenderer: params => {
          // params.$scope.editColDef = $ctrl.showColDef;

          const eCell = this._document[0].createElement('span');
          eCell.innerHTML = `<span class="ag-click-ico" ng-click="$ctrl.showColDef('${params.colDef.headerName}')" ng-hide="Code">
                               <i class="fa fa-edit"></i></span>&nbsp;${params.colDef.headerName}`;
          return eCell;
        }
      };

      return {
        validationResult: this.validationResult,
        rows: this.rows,
        valGridOptions: this.valGridOptions
      };
    });
  }

  track() {
    if (this.validationResult) {
      let payload = this._cm.getCurrent().tagModel
        ? this.validationResult.tags[0]
        : this.validationResult.entity;
      payload = _.map(payload, e => e);
      this._http
        .put(`${this._cfg.engineUrl()}/api/v1/track/`, payload)
        .then(res => this._toastr.success(res.statusText, 'Success'));
    }
  }
}
