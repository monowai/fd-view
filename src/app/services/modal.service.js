import template from './confirm-modal.html';

export default class ModalService {
  /** @ngInject */
  constructor($uibModal) {
    this._uibModal = $uibModal;
    this._modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      template
    };
  }

  show(customModalDefaults, customModalOptions) {
    const tempModalDefaults = Object.assign({}, this._modalDefaults, customModalDefaults);
    const tempModalOptions = Object.assign({}, customModalOptions);

    if (!tempModalDefaults.controller) {
      tempModalDefaults.controller = [
        '$scope',
        '$uibModalInstance',
        function ($scope, $uibModalInstance) {
          $scope.modalOptions = tempModalOptions;
          $scope.obj = $scope.modalOptions.obj;

          $scope.ok = res => $uibModalInstance.close(res);
          $scope.close = $uibModalInstance.dismiss;
        }
      ];
    }

    return this._uibModal.open(tempModalDefaults).result;
  }
}
