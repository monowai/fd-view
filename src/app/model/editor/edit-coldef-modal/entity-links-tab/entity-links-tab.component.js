class EntityLinksTab {
  addLink() {
    this.column.entityLinks = this.column.entityLinks || [];
    this.column.entityLinks.push({missingAction: 'IGNORE'});
  }

  deleteLink(entity) {
    this.column.entityLinks = this.column.entityLinks.filter(link => entity !== link);
  }

  parentSelected(links) {
    return Boolean(links.find(el => el.parent));
  }
}

angular
  .module('fd-view.modeler')
  .component('entityLinksTab', {
    templateUrl: 'app/model/editor/edit-coldef-modal/entity-links-tab/entity-links-tab.html',
    controller: EntityLinksTab,
    bindings: {
      column: '<'
    }
  });
