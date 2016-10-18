class ColProperties {
  /** @ngInject */
  constructor(ContentModel, modalService) {
    const model = ContentModel.getCurrent();
    this.columns = Object.keys(model.content);
    this.entity = model.tagModel ? '' : model.documentType.name;
    this._modal = modalService;
  }

  editProperty(properties, property) {
    this._modal.show({
      templateUrl: 'app/model/editor/edit-coldef-modal/col-properties/edit-property.html',
      controller: 'EditPropertyModalCtrl as $ctrl',
      resolve: {
        property: () => property,
        col: () => this.column.name
      }
    }).then(res => {
      if (property) {
        angular.extend(property, res);
      } else {
        properties.push(res);
      }
    });
  }

  addProperty(col) {
    col.properties = col.properties || [];
    return this.editProperty(col.properties);
  }
}

angular
  .module('fd-view.modeler')
  .component('colProperties', {
    templateUrl: 'app/model/editor/edit-coldef-modal/col-properties/col-properties.html',
    controller: ColProperties,
    bindings: {
      column: '<'
    }
  });
