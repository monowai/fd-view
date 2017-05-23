export default class EditPropertyModalCtrl {
  /** @ngInject */
  constructor($uibModalInstance, ContentModel, property, col) {
    this.dataTypes = ['string', 'number', 'date'];
    if (property) {
      this.property = property;
    }

    this.columns = ContentModel.getCurrent().content;
    this.column = col;

    this._uibmi = $uibModalInstance;
  }

  setProperties(col) {
    const cd = this.columns[col];
    this.property.dataType = cd.dataType;
    this.property.storeNull = cd.storeNull;
    if (cd.dataType === 'date') {
      this.property.dateFormat = cd.dateFormat;
    }
  }

  cancel() {
    this._uibmi.dismiss();
  }

  ok(p) {
    this._uibmi.close(p);
  }
}
