import angular from 'angular';
import EditPropertyModalCtrl from './edit-property.controller';
import editPropertyTemplate from './edit-property.html';
import template from './col-properties.html';

class ColPropertiesCtrl {
  /** @ngInject */
  constructor(ContentModel, modalService) {
    const model = ContentModel.getCurrent();
    this.columns = Object.keys(model.content);
    this.entity = model.tagModel ? '' : model.documentType.name;
    this._modal = modalService;
  }

  editProperty(properties, property) {
    this._modal
      .show({
        template: editPropertyTemplate,
        controller: EditPropertyModalCtrl,
        controllerAs: '$ctrl',
        resolve: {
          property: () => property,
          col: () => this.column.name
        }
      })
      .then(res => {
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

export const colProperties = {
  template,
  controller: ColPropertiesCtrl,
  bindings: {
    column: '<'
  }
};
