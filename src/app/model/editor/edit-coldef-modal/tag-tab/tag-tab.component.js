class TagTab {
  /** @ngInject */
  constructor(modalService, ContentModel) {
    this.columnNames = Object.keys(ContentModel.getCurrent().content);

    this._modal = modalService;
    this._cm = ContentModel;
  }

  addTarget(scope) {
    const tag = scope.$modelValue || scope;

    this._modal.show({
      templateUrl: 'app/model/editor/edit-coldef-modal/tag-tab/create-target.html',
      controller: 'CreateTargetCtrl as $ctrl',
      resolve: {
        active: () => tag,
        tags: () => this._cm.getTags()
      }
    }).then(res => {
      if (!tag.targets) {
        tag.targets = [];
      }
      const target = res.target.id ? this._cm.findTag(res.target.id) : res.target;
      tag.targets.push(angular.extend(target, res.relationship));
    });
  }
}

angular
  .module('fd-view.modeler')
  .component('tagTab', {
    templateUrl: 'app/model/editor/edit-coldef-modal/tag-tab/tag-tab.html',
    controller: TagTab,
    bindings: {
      tag: '<'
    }
  });
