import angular from 'angular';

export default class EditColdefCtrl {
  /** @ngInject */
  constructor(coldef, ContentModel, modalService, $uibModalInstance) {
    const name = Object.keys(coldef)[0];
    this.cd = angular.copy(coldef[name]);
    this.cd.$name = name;
    const model = ContentModel.getCurrent();
    this.entity = model.tagModel ? '' : model.documentType.name;
    this.tagModel = model.tagModel;

    if (coldef.options) {
      this.openAsTag = coldef.options.openAsTag;
    }
    this.caption = this.openAsTag ? 'Tag Input' : 'Column Definition';
    this.tab = this.cd.tag || this.openAsTag ? 1 : 0;

    if (coldef.options && coldef.options.link) {
      this.tab = 2; // EntityTagLinks
    }

    this._coldef = coldef;
    this._modal = modalService;
    this._uibmi = $uibModalInstance;
  }

  cancel() {
    if (angular.equals(_.omit(this.cd, '$name'), this._coldef[this.cd.$name])) {
      this._uibmi.dismiss();
    } else {
      this._modal
        .show(
          { size: 'sm' },
          {
            title: 'Discard changes...',
            text: 'Are you sure you want to cancel and discard your changes?'
          }
        )
        .then(() => {
          this._uibmi.dismiss();
        });
    }
  }

  ok(data) {
    if (data.dataType === 'date') {
      data.dateFormat = data.dateFormat === 'custom' ? data.customDate : data.dateFormat;
      if (data.customDate) {
        delete data.customDate;
      }
    }

    if (data.name === '') {
      delete data.name;
    }

    this._uibmi.close(data);
  }
}
