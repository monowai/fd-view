export default class CreateTargetCtrl {
  /** @ngInject */
  constructor($uibModalInstance, active, tags) {
    this.active = active.label || active.name || active;
    this.canConnect = tags.filter(t => t.id !== active.$id);

    this._uibmi = $uibModalInstance;
  }

  checkElem() {
    if (this.elem) {
      delete this.elem;
    }
  }

  cancel() {
    this._uibmi.dismiss();
  }

  ok(isValid) {
    if (isValid) {
      const target = this.elem || this.target;
      this._uibmi.close({target, relationship: this.rel});
    }
  }
}
