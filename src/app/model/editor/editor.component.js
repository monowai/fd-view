/*
 *
 *  Copyright (c) 2012-2017 "FlockData LLC"
 *
 *  This file is part of FlockData.
 *
 *  FlockData is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  FlockData is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FlockData.  If not, see <http://www.gnu.org/licenses/>.
 */
import angular from 'angular';
import template from './editor.html';

class EditModelCtrl {
  /** @ngInject */
  constructor(
    $scope,
    $stateParams,
    toastr,
    ContentModel,
    DataSample,
    $state,
    $timeout,
    modalService,
    $window
  ) {
    this.origin = { content: {} };

    // services
    this._stateParams = $stateParams;
    this._state = $state;
    this._scope = $scope;
    this._timeout = $timeout;
    this._cm = ContentModel;
    this._modal = modalService;
    this._toastr = toastr;
    this.sample = DataSample;
    this._window = $window;
  }

  $onInit() {
    if (this._stateParams.modelKey === 'new') {
      this.name = 'New model';
      this.model = angular.copy(this.origin);
      angular.element('[data-target="#settings"]').tab('show');
    } else {
      this.loadModel(this._stateParams.modelKey);
    }
    this.jsonOptions = {
      mode: 'tree',
      modes: ['tree', 'code', 'form'],
      expanded: true
    };
    const ctrl = this;
    this.onEditorLoad = instance => {
      ctrl.json = instance;
    };

    this._window.onbeforeunload = e => {
      e = e || this._window.event;
      const msg = 'Do you really want to leave this page?';
      if (e) {
        e.returnValue = msg;
      }
      return msg;
    };
  }

  $onDestroy() {
    this.sample.clean();
    this._window.onbeforeunload = null;
  }

  loadModel(key) {
    this._cm.getModel(key).then(res => {
      this.model = res;
      this.name = this.model.code || this.model.documentType.name;
      this.graph = this._cm.graphModel();
      this.origin = angular.copy(this.model);
    });
  }

  isSaved() {
    return angular.equals(this.origin, this.model);
  }

  uiCanExit() {
    if (this.isSaved()) {
      this._window.onbeforeunload = null;
    } else {
      return this._modal
        .show(
          { size: 'sm' },
          {
            title: 'Discard changes...',
            text: 'Are you sure you want to cancel and discard your changes?'
          }
        )
        .then(() => {
          this.model = this.origin;
          this._cm.updateModel(this.origin);
        });
    }
  }

  canSave() {
    if (this.model) {
      if (this.model.fortress && this.model.documentType) {
        return true;
      } else if (this.model.tagModel && this.model.code && this.model.name) {
        return true;
      }
    }
    return false;
  }

  save() {
    const model = this.json.get();
    this._cm.updateModel(model);
    if (this.canSave()) {
      this._cm.saveModel().then(
        res => {
          this._toastr.success(res.statusText, 'Success');
          angular.element('[data-target="#structure"]').tab('show');
          this.origin = angular.copy(model);
          this.name = this.model.code || this.model.documentType.name;
          this._timeout(() => {
            this._scope.$broadcast('cytoscapeReset');
          }, 500);
        },
        res => {
          this._toastr.error(res.message, 'Error');
        }
      );
    } else {
      this._toastr.warning(
        'Model, cannot be saved. Please check your model configuration!',
        'Error'
      );
      angular.element('[data-target="#settings"]').tab('show');
    }
  }

  updateModel() {
    angular.element('[data-target="#structure"]').tab('show');
    if (!angular.equals(this.diffModel, this.model)) {
      this._cm.updateModel(this.model);
      this._cm.graphModel();
      this._timeout(() => {
        this._scope.$broadcast('cytoscapeReset');
      }, 500);
      delete this.diffModel;
    }
  }

  checkModel() {
    this.diffModel = angular.copy(this.model);
    this.json.focus();
    if (this.json.getMode() !== 'code') {
      this.json.expandAll();
    }
  }

  cleanSample() {
    this.sample.clean();
  }

  validate() {
    if (this.validationResult) {
      delete this.validationResult;
    }
    this.sample.validate(this.model).then(res => {
      this.validationResult = res;
      angular.element('[data-target="#validate"]').tab('show');
    });
  }

  trackResult() {
    this.sample.track();
  }

  cancel() {
    this._cm.clean();
    this._state.go('model');
  }
}

export const modelEditor = {
  template,
  controller: EditModelCtrl,
  controllerAs: 'editor'
};
