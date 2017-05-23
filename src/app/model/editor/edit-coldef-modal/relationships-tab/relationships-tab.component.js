class RelationshipsTabCtrl {
  /** @ngInject */
  constructor(ContentModel, modalService) {
    const model = ContentModel.getCurrent();
    this.columnNames = Object.keys(model.content);
    this.entity = model.tagModel ? '' : model.documentType.name;
    this._modal = modalService;
  }

  $onInit() {
    if (this.tag.options && this.tag.options.link) {
      this.addEntityRel();
    }
  }

  addEntityRel() {
    if (!this.tag.entityTagLinks) {
      this.tag.entityTagLinks = [];
    }
    this.tag.entityTagLinks.push({relationshipName: 'Undefined'});
  }

  editProperty(properties, property) {
    this._modal.show({
      templateUrl: 'app/model/editor/edit-coldef-modal/col-properties/edit-property.html',
      controller: 'EditPropertyModalCtrl as $ctrl',
      resolve: {
        property: () => property,
        col: () => this.tag.$name
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

export const relationshipsTab = {
  templateUrl: 'app/model/editor/edit-coldef-modal/relationships-tab/relationships-tab.html',
  controller: RelationshipsTabCtrl,
  bindings: {
    tag: '<'
  }
};
