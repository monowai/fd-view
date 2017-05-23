import ConceptModalCtrl from './concept-modal.controller';
import template from './concept-modal.html';

export default class ConceptModal {
  /** @ngInject */
  constructor(modalService) {
    this._modalService = modalService;
  }

  display(fortress) {
    this._modalService.show({
      size: 'lg',
      template,
      controller: ConceptModalCtrl,
      controllerAs: 'ctrl',
      resolve: {
        fortress: () => fortress
      }
    });
  }
}
