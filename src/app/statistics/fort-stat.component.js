import template from './fort-stat.html';

class FortStatCtrl {
  /** @ngInject */
  constructor(QueryService, ConceptModal) {
    /* eslint camelcase: 0 */ // query for ElasticSearch
    this.payload = {
      size: 0,
      query: {
        match_all: {}
      },
      aggs: {
        count_by_type: {
          terms: {
            field: '_type'
          }
        }
      }
    };

    this._query = QueryService;
    this._concept = ConceptModal;
  }

  $onChanges(change) {
    if (change.fortress) {
      this.payload.fortress = this.fortress.name;
    }
    if (change.search.currentValue) {
      this.show = false;
      this.payload.query = { query_string: { query: this.search } };
    }
    this._query.query('es', this.payload).then(data => {
      if (data.hits.total > 0) {
        this.chartData = data.aggregations.count_by_type.buckets;
        this.show = true;
      } else {
        this.show = false;
      }
    });
  }

  openConcept(fortress) {
    this._concept.display(fortress);
  }
}

export const fortStat = {
  template,
  controller: FortStatCtrl,
  bindings: {
    fortress: '<',
    search: '<'
  }
};
