import template from './matrix-form.html';

class MatrixFormCtrl {
  /** @ngInject */
  constructor(MatrixRequest, QueryService) {
    this.params = MatrixRequest;
    this._query = QueryService;
  }

  $onInit() {
    this._query.general('fortress').then(data => {
      this.params.fortresses = data;
    });
  }

  selectFortress(f) {
    this.params.fortress = f;
    this._query.doc(f).then(data => {
      this.params.documents = data;
    });
    this.params.concepts = [];
    this.params.fromRlxs = [];
    this.params.toRlxs = [];
  }

  selectDocument(d) {
    this.params.document = d;
    this._query.concept('/', d).then(data => {
      const conceptMap = _.flatten(_.map(data, 'concepts'));
      if (conceptMap[0]) {
        this.params.concepts = _.uniq(conceptMap, c => c.name);
      }
    });
    this.params.fromRlxs = [];
    this.params.toRlxs = [];
  }

  selectAllFromRlx() {
    const filtered = filter(this.params.fromRlxs);

    _.forEach(filtered, item => {
      item.selected = true;
    });
  }

  selectConcept(concept) {
    this.params.concept = concept;
    this._query.concept('/relationships', this.params.document).then(data => {
      const conceptMap = _.filter(_.flatten(_.map(data, d => d.concepts)), c =>
        _.includes(concept, c.name)
      );

      const rlxMap = _.flatten(_.map(conceptMap, c => c.relationships));
      const rlx = _.uniq(rlxMap, c => c.name);

      this.params.fromRlxs = rlx;
      this.params.toRlxs = rlx;
    });
  }
}

export const fdMatrixForm = {
  template,
  transclude: true,
  controller: MatrixFormCtrl
};
