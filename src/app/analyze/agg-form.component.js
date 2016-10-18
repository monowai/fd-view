class AggFormCtrl {
  /** @ngInject */
  constructor(MatrixRequest, QueryService) {
    this.params = MatrixRequest;
    this.params.aggType = MatrixRequest.aggType || '_count';
    this.params.order = MatrixRequest.order || 'desc';
    this.params.sampleSize = 10;

    this._query = QueryService;
  }

  $onInit() {
    this._query.general('fortress')
      .then(data => {
        this.params.fortresses = data;
      });
  }
  selectFortress(f) {
    this.params.fortress = f;
    this._query.doc(f)
      .then(data => {
        this.params.documents = data;
      });
  }

  selectDocument(d) {
    if (d.length) {
      this.params.document = d;
      this._query.fields(this.params.fortress[0], d[0])
        .then(res => {
          this.params.fields = res.data.concat(res.links).concat(res.system);
          this.numFields = this.params.fields.filter(f => f.type !== 'string');
        });
    }
  }

  selectAggType(at) {
    if (at === 'Count') {
      delete this.params.metric;
    }
  }
}

angular
  .module('fd-view')
  .component('fdAggForm', {
    templateUrl: 'app/analyze/agg-form.html',
    controller: AggFormCtrl
  });
