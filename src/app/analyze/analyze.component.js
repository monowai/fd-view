import angular from 'angular';
import {ascending, descending, range} from 'd3';

import {constructChordData} from './charts/chord.helpers';
import template from './analyze.html'; // disabled for ElasticSearch query, re-enable on adding features

/* eslint-disable */
class AnalyzeCtrl {
  /** @ngInject */
  constructor(
    $scope,
    QueryService,
    MatrixRequest,
    SearchService,
    $window,
    $timeout,
    toastr,
    BiPartiteService
  ) {
    this.graphData = MatrixRequest.lastMatrix().matrix;
    this.chartTypes = ['Chord', 'Matrix', 'BiPartite', 'TagCloud', 'Barchart'];
    this.chartType = MatrixRequest.chart || 'Chord';

    // services
    this._scope = $scope;
    this._query = QueryService;
    this._matrix = MatrixRequest;
    this._search = SearchService;
    this._timeout = $timeout;
    this._toastr = toastr;
    this._bp = BiPartiteService;

    angular.element($window).on('resize', () => $scope.$apply());
  }

  $onInit() {
    if (_.isEmpty(this.graphData) && _.isEmpty(this._matrix.aggData)) {
      angular.element('[data-target="#search"]').tab('show');
      this.graphData = [];
    } else if (this._matrix.aggData && this.chartType === 'Barchart') {
      this.aggData = this._matrix.aggData;
      this.aggDetails = this._matrix.aggDetails;
    } else {
      if (this._matrix.reciprocalExcluded() && !this._matrix.sharedChecked()) {
        this.chartType = 'BiPartite';
      }
      this._timeout(() => this.switchChart(), 10);
    }

    this._addOptions();
  }

  _checkOptions() {
    if (!_.isEmpty(this.graphData)) {
      if (
        ((this.chartType === 'Chord' || this.chartType === 'TagCloud') &&
          (this._matrix.reciprocalExcluded() && !this._matrix.sharedChecked())) ||
        ((this.chartType === 'Matrix' || this.chartType === 'BiPartite') &&
          (!this._matrix.reciprocalExcluded() && this._matrix.sharedChecked()))
      ) {
        this._toastr.warning(
          `Search results are not optimal for ${this.chartType} diagram. You can change <strong>Search settings</strong> or chart type.`,
          'Warning',
          {allowHtml: true}
        );
      }
    }
  }

  _addOptions() {
    if (this.chartType === 'Chord' || this.chartType === 'TagCloud') {
      this._matrix.sharedRlxChecked = true;
      this._matrix.reciprocalExcludedChecked = false;
    } else if (this.chartType === 'Matrix' || this.chartType === 'BiPartite') {
      this._matrix.sharedRlxChecked = false;
      this._matrix.reciprocalExcludedChecked = true;
    }
  }

  search() {
    if (this.chartType === 'TagCloud') {
      this._query
        .tagCloud(
          this._matrix.searchText,
          this._matrix.document,
          this._matrix.fortress,
          this._matrix.concept,
          this._matrix.fromRlx
        )
        .then(data => {
          angular.element('[data-target="#view"]').tab('show');
          this.data = data.terms;
        });
    }
    if (this.chartType === 'Barchart') {
      const at = this._matrix.aggType;
      const terms = {
        field: this._matrix.term.name,
        size: this._matrix.sampleSize,
        order: {}
      };
      const query = {
        size: 0,
        fortress: this._matrix.fortress[0],
        _type: this._matrix.document[0],
        query: {query_string: {query: this._matrix.searchText || '*'}},
        aggs: {
          data: {
            terms
          }
        }
      };

      terms.order[
        this._matrix.byMeasure
          ? '_term'
          : at === '_count'
          ? '_count'
          : at === 'percentiles'
            ? 'metric.50'
            : 'metric'
        ] = this._matrix.order;

      if (at !== '_count') {
        if (this._matrix.metric) {
          query.aggs.data.aggs = {metric: {}};
          query.aggs.data.aggs.metric[at] = {field: this._matrix.metric.name};
          if (at === 'percentiles') {
            _.extend(query.aggs.data.aggs.metric[at], {percents: [50]});
          }
        } else {
          return;
        }
      }
      // console.log(query);
      this._query.query('es', query).then(res => {
        this.aggData = res.aggregations.data.buckets.filter(b => {
          if (b.metric) {
            return b.metric.hasOwnProperty('value')
              ? b.metric.value
              : b.metric.values['50.0'] !== 'NaN';
          }
          return b;
        });
        this.aggDetails = {
          aggType: this._matrix.aggTypes[at],
          metric: this._matrix['metric.displayName' || 'term.displayName'],
          term: this._matrix.term.displayName
        };
        this._matrix.aggData = angular.copy(this.aggData);
        this._matrix.aggDetails = angular.copy(this.aggDetails);
        this._search.fortress = this._matrix.fortress;
        this._search.types = this._matrix.document;
        this._search.term = this._matrix.term;
        angular.element('[data-target="#view"]').tab('show');
      });
    } else {
      this._matrix.matrixSearch().then(res => {
        if (!res || !res.matrix.length) {
          this._toastr.info('No data was found. Try altering your criteria');
          return res;
        }
        angular.element('[data-target="#view"]').tab('show');

        this.graphData = res.matrix;
        this.cdData = null;
        this.coData = null;
        this.bpData = null;
        // this.coMgr = new ConstructCooccurrenceData(this.graphData);

        this.switchChart();
      });
    }
  }

  switchChart() {
    this._checkOptions();
    this._matrix.chart = this.chartType;
    if (this.chartType === 'Chord' && !this.cdData) {
      this.cdData = constructChordData(this.graphData);
    } else if (this.chartType === 'Matrix' && !this.coData) {
      this.order = 'name';
      this.coData = this._constructCooccurrenceData(this.graphData);
    } else if (this.chartType === 'BiPartite' && !this.bpData) {
      this.bpData = this._constructBiPartiteData(this.graphData);
    }

    this._addOptions();
  }

  orderMatrix() {
    if (this.order === 'count') {
      this.orderedNodes = this.coData.ordersFn.count;
    } else {
      this.orderedNodes = this.coData.ordersFn.name;
    }
  }

  _constructCooccurrenceData(data) {
    const matrix = [];
    const nodes = _.union(_.map(data, 'source'), _.map(data, 'target'));
    const fromNodes = _.unique(_.map(data, 'source'));
    const toNodes = _.unique(_.map(data, 'target'));

    if (!nodes) {
      return null;
    }
    const m = fromNodes.length;
    const n = toNodes.length;
    const clonedFromNodes = angular.copy(fromNodes);
    const clonedToNodes = angular.copy(toNodes);
    // Compute index per node.
    fromNodes.forEach((name, i, self) => {
      const node = {};
      node.index = i;
      node.count = 0;
      node.name = name;
      self[i] = node;
      matrix[i] = range(n).map(j => ({x: j, y: i, z: 0}));
    });
    toNodes.forEach((name, i, self) => {
      const node = {};
      node.index = i;
      node.count = 0;
      node.name = name;
      self[i] = node;
    });

    // Convert links to matrix; count character occurrences.
    data.forEach(link => {
      const i = clonedFromNodes.indexOf(link.source);
      const j = clonedToNodes.indexOf(link.target);
      matrix[i][j].z += link.count;
      fromNodes[i].count += link.count;
      toNodes[j].count += link.count;
    });
    // Pre-compute the orders.
    const orders = {
      fromName: range(m).sort((a, b) => descending(fromNodes[a].name, fromNodes[b].name)),
      toName: range(n).sort((a, b) => ascending(toNodes[a].name, toNodes[b].name)),
      count: range(n).sort((a, b) => nodes[b].count - nodes[a].count)
    };

    return {
      matrix,
      fromNodes,
      toNodes,
      fromOrders: orders.fromName,
      toOrders: orders.toName,
      ordersFn: orders
    };
  }

  _constructBiPartiteData(data) {
    const chartData = [];

    const bpData = [
      {
        data: this._bp.partData(data),
        dataLength: data.length,
        id: 'Relationship',
        header: ['From', 'To', 'Relationship']
      }
    ];
    chartData.push(bpData);

    return chartData;
  }
}

export const analyzeView = {
  template,
  controller: AnalyzeCtrl
};
