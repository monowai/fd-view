import template from './column-tab.html';

class ColumnTabCtrl {
  /** @ngInject */
  constructor(ContentModel) {
    this.dataTypes = ['string', 'number', 'date'];
    this.dateFormats = ['Automatic', 'timestamp', 'epoc', 'custom'];
    this.columnNames = Object.keys(ContentModel.getCurrent().content);
    this.tags = ContentModel.getTags();
  }

  $onInit() {
    if (this.column.dateFormat && !this.dateFormats.includes(this.column.dateFormat)) {
      this.column.customDate = this.column.dateFormat;
      this.column.dateFormat = 'custom';
    }
  }

  checkFormat() {
    if (this.column.dataType === 'date') {
      this.column.dateFormat = this.column.dateFormat || 'Automatic';
    }
    if (this.column.dataType !== 'date' && this.column.dateFormat) {
      // Clean up on change
      delete this.column.dateFormat;
      delete this.column.customDate;
    }
  }

  convertTag(tag) {
    if (tag.tag) {
      delete tag.dataType;
      delete tag.persistent;
      delete tag.storeNull;
      delete tag.entityLinks;
      // From here can open tag properties tab
    } else {
      delete tag.$id;
      delete tag.targets;
      delete tag.entityTagLinks;
    }
  }

  toggleAlias(alias) {
    if (alias) {
      this.column.$alias = { code: this.column.$name };
    } else {
      delete this.column.$alias;
    }
  }
}

export const columnTab = {
  template,
  controller: ColumnTabCtrl,
  bindings: {
    column: '<'
  }
};
