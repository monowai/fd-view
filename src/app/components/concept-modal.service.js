class ConceptModal {
  /** @ngInject */
  constructor(modalService) {
    this._modalService = modalService;
  }

  display(fortress) {
    this._modalService.show({
      size: 'lg',
      templateUrl: 'app/components/concept-modal.html',
      controller: 'ConceptModalCtrl',
      controllerAs: 'ctrl',
      resolve: {
        fortress: () => fortress
      }
    });
  }
}

angular
  .module('fd-view')
  .service('ConceptModal', ConceptModal);
