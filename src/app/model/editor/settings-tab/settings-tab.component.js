class SettingsTab {
  /** @ngInject */
  constructor(ContentModel) {
    this.allModels = [];

    this._cm = ContentModel;
  }

  cleanTagModel() {
    if (this.model.tagModel) {
      if (this.model.fortress) {
        delete this.model.fortress;
      }
      if (this.model.documentType) {
        delete this.model.documentType;
      }
      if (this.modelToLoad) {
        delete this.modelToLoad;
      }
    }
  }

  findModel(model) {
    const findModel = model => {
      return _.find(this.allModels, m => {
        if (model.tagModel) {
          return m.code === model.code;
        }
        return m.fortress === model.fortress.name && m.documentType === model.documentType.name;
      });
    };

    if (this.allModels.length) {
      this.modelToLoad = findModel(model);
    } else {
      this.getAllModels().then(() => {
        this.modelToLoad = findModel(model);
      });
    }
  }

  getAllModels() {
    return this._cm.getAll().then(res => {
      this.allModels = res.data;
      this.tagModels = _.filter(res.data, {documentType: 'TagModel'});
    });
  }

  loadModel(key) {
    this.editor.loadModel(this.modelToLoad.key);
    if (this.modelToLoad) {
      delete this.modelToLoad;
    }
  }

  updateModel() {
    if (this.modelToLoad) {
      this.editor.loadModel(this.modelToLoad.key);
    }
    angular.element('[data-target="#structure"]').tab('show');
  }

  sampleData() {
    if (this.modelToLoad) {
      this.editor.loadModel(this.modelToLoad.key);
    }
    angular.element('[data-target="#sample"]').tab('show');
  }
}

angular
  .module('fd-view.modeler')
  .component('settingsTab', {
    bindings: {
      model: '='
    },
    controller: SettingsTab,
    templateUrl: 'app/model/editor/settings-tab/settings-tab.html',
    require: {
      editor: '^modelEditor'
    }
  });
