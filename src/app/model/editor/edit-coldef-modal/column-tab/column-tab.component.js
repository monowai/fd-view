class ColumnTab {
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
    if (this.column.dataType !== 'date' && this.column.dateFormat) { // Clean up on change
      delete this.column.dateFormat;
      delete this.column.customDate;
    }
  }

  convertTag(tag) {
    if (tag.tag) {
      delete tag.dataType;
      delete tag.persistent;
      delete tag.storeNull;
      // ToDo: open tag properties tab
    } else {
      delete tag.$id;
      delete tag.targets;
      delete tag.entityTagLinks;
    }
  }

  toggleAlias(alias) {
    if (alias) {
      this.column.$alias = {code: this.column.$name};
    } else {
      delete this.column.$alias;
    }
  }
}

angular
  .module('fd-view.modeler')
  .component('columnTab', {
    templateUrl: 'app/model/editor/edit-coldef-modal/column-tab/column-tab.html',
    controller: ColumnTab,
    bindings: {
      column: '<'
    }
  });
