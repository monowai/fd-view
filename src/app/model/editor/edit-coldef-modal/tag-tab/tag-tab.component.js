import angular from 'angular';
import CreateTargetCtrl from './create-target.controller';

import template from './tag-tab.html';
import './tag-tab.scss';

class TagTabCtrl {
  /** @ngInject */
  constructor(modalService, ContentModel) {
    this.columnNames = Object.keys(ContentModel.getCurrent().content);

    this._modal = modalService;
    this._cm = ContentModel;
  }

  addTarget(scope) {
    const tag = scope.$modelValue || scope;

    this._modal
      .show({
        template: require('./create-target.html'),
        controller: CreateTargetCtrl,
        controllerAs: '$ctrl',
        resolve: {
          active: () => tag,
          tags: () => this._cm.getTags()
        }
      })
      .then(res => {
        if (!tag.targets) {
          tag.targets = [];
        }
        const target = res.target.id ? this._cm.findTag(res.target.id) : res.target;
        tag.targets.push(angular.extend(target, res.relationship));
      });
  }
}

export const tagTab = {
  template,
  controller: TagTabCtrl,
  bindings: {
    tag: '<'
  }
};
