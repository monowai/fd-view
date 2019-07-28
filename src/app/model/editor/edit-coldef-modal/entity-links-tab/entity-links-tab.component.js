import template from './entity-links-tab.html';
import './entity-links.scss';

class EntityLinksTabCtrl {
  addLink() {
    this.column.entityLinks = this.column.entityLinks || [];
    this.column.entityLinks.push({ missingAction: 'IGNORE' });
  }

  deleteLink(entity) {
    this.column.entityLinks = this.column.entityLinks.filter(link => entity !== link);
  }

  parentSelected(links) {
    return Boolean(links.find(el => el.parent));
  }
}

export const entityLinksTab = {
  template,
  controller: EntityLinksTabCtrl,
  bindings: {
    column: '<'
  }
};
