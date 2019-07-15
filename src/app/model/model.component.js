import template from './model.html';
import './model.scss';

class ModelCtrl {
  /** @ngInject */
  constructor(
    $filter,
    $rootScope,
    modalService,
    QueryService,
    ContentModel,
    $state,
    $window,
    $document,
    User
  ) {
    this.selected = [];
    this.profile = User.account;

    // services
    this._filter = $filter;
    this._root = $rootScope;
    this._modal = modalService;
    this._query = QueryService;
    this._content = ContentModel;
    this._state = $state;
    this._window = $window;
    this._document = $document;
  }

  $onInit() {
    this._query.general('fortress').then(data => {
      this.fortresses = data;
    });

    this._content.getAll().then(res => {
      this.cplist = res.data;
    });
  }

  createModel() {
    this._state.go('editModel', {modelKey: 'new'});
  }

  selectModel(key) {
    const idx = this.selected.indexOf(key);
    if (idx > -1) {
      this.selected.splice(idx, 1);
    } else {
      this.selected.push(key);
    }
  }

  selectAll() {
    const filtered = this._filter('filter')(this.cplist, this.fortress);
    const listToSelect = filtered && filtered.length ? filtered : this.cplist;
    if (this.selected.length === listToSelect.length) {
      this.selected = [];
      this.allSelected = false;
    } else {
      this.selected = _.map(listToSelect, m => m.key);
      this.allSelected = true;
    }
  }

  /** @ngInject */
  downloadModel(keys) {
    if (keys) {
      this._content.downloadModel(keys).then(res => {
        const data = angular.toJson(res.data);
        const blob = new Blob([data], {type: 'text/json'});
        const filename = `${keys[0]}.json`;
        if (this._window.navigator && this._window.navigator.msSaveOrOpenBlob) {
          this._window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          const e = this._document[0].createEvent('MouseEvents');
          const a = this._document[0].createElement('a');

          a.download = filename;
          a.href = this._window.URL.createObjectURL(blob);
          a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
          e.initEvent(
            'click',
            true,
            false,
            this._window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          a.dispatchEvent(e);
        }
      });
    }
  }

  deleteModel(keys) {
    if (keys && keys.length) {
      this._modal
        .show(
          {
            size: 'sm'
          },
          {
            title: 'Delete...',
            text: 'Warning! You are about to delete the Content Model(s). Do you want to proceed?'
          }
        )
        .then(() => {
          _.each(keys, key => {
            this._content.deleteModel(key).then(() => {
              this.cplist = _.reject(this.cplist, m => m.key === key);
            });
          });
          this._root.$broadcast('event:status-ok', 'Done!');
        });
    }
    this.selected = [];
  }

  openFile(ele) {
    const reader = new FileReader();
    reader.onload = onLoadEvent => {
      const fileContent = onLoadEvent.target.result;
      const models = angular.fromJson(fileContent);
      this._content.uploadModel(models).then(res => {
        this._root.$broadcast('event:status-ok', res.statusText);
        if (models.length === 1) {
          this._state.go('editModel', {modelKey: res.data[0].key});
        } else {
          this.cplist = this.cplist.concat(res.data);
        }
      });
    };
    reader.readAsText(ele.files[0]);
  }
}

export const modelView = {
  template,
  controller: ModelCtrl
};
