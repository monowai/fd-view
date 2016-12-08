class MetaHeaderCtrl {
  /** @ngInject */
  constructor($stateParams, $window, EntityService, $timeout, $anchorScroll, QueryService, MatrixRequest, configuration, SearchService) {
    if ($stateParams.filter) {
      SearchService.fortress = MatrixRequest.fortress;
      SearchService.types = MatrixRequest.document;
      SearchService.term = $stateParams.filter;
      SearchService.term.disabled = true;
    }

    this.advancedSearch = false;
    this.searchResultFound = false;
    this.logResultFound = false;
    this.searchResults = [];
    this.logsResults = [];
    this.fragments = [];

    this.seeLogsAction = false;
    this.selectedLog = [];

    // Can do Fortress+DocType structure rather than x^2
    this.fortress = SearchService.fortress ? SearchService.fortress[0] : "";
    this.types = SearchService.types ? SearchService.types.map(t => {
      return {name: t};
    }) : [];

    this.tf = SearchService.term;

    // services
    this._window = $window;
    this._entity = EntityService;
    this._timeout = $timeout;
    this._anchor = $anchorScroll;
    this._query = QueryService;
    this._matrix = MatrixRequest;
    this._config = configuration;
    this._search = SearchService;
  }

  openGraphExplorer(entityKey) {
    this._entity.getEntityPK(entityKey).then(id => {
      const url = `${this._config.exploreUrl()}graph.html?id=${id}`;
      this._window.open(url);
    });
  }

  openDetailsView(entityKey) {
    const url = `#/view/${entityKey}`;
    this._window.open(url);
  }

  showAdvancedSearch() {
    this.advancedSearch = !this.advancedSearch;
  }

  loadTypes(fortress) {
    if (fortress) {
      return this._query.doc(fortress);
    }
  }

  setFilter(fortress, type) {
    if (this.fortress !== fortress) {
      this.types = [];
      this.fortress = fortress;
    }
    if (type && !this.types.filter(name => type).length) {
      this.types.push({name: type});
    }
  }

  search() {
    const typesToBeSend = this.types.map(t => t.name);

    this.sr = new this._search(this._matrix.searchText || '*', this.fortress, typesToBeSend, (!this.tf || this.tf.disabled) ? null : this.tf);
    this.sr.nextPage(() => {
      this._timeout(() => this._anchor('results'), 100);
    });

    this.searchResultFound = true;
    this.logResultFound = false;
  }

  findLogs(entityKey, index) {
    if (this.searchResults[index].logs === null && !this.searchResults[index].seeLogsAction) {
      this.metaheaderSelected = entityKey;
      this._entity.getLogsForEntity(entityKey)
        .then(data => {
          this.searchResults[index].logs = data.changes;
          this.searchResults[index].seeLogsAction = true;
          // console.log('searchResults : ', this.searchResults);
          this.logsResults = data.changes;
          this.fragments = data.fragments;
          this.logResultFound = true;
        });
    } else {
      this.searchResults[index].seeLogsAction = !this.searchResults[index].seeLogsAction;
    }
  }

  openPopup(logId) {
    this.log1 = this._entity.getJsonContentForLog(this.metaheaderSelected, logId)
      ;// .then(data => this.log1 = data);
    const modalOptions = {
      log1: this.log1
    };

    modalService
      .show({
        templateUrl: 'app/search/single-log-modal.html'
      }, modalOptions)
      .then(selectedItem => {
        this.selected = selectedItem;
      } /* , () => $log.info('Modal dismissed at: ' + new Date())  */);
  }

  openDeltaPopup() {
    const logId1 = this.selectedLog[0];
    const logId2 = this.selectedLog[1];

    // Getting Log1
    this.log1 = this._entity.getJsonContentForLog(this.metaheaderSelected, logId1);

    // Getting Log2
    this.log2 = this._entity.getJsonContentForLog(this.metaheaderSelected, logId2);

    const ModalInstanceCtrl = ['$uibModalInstance', 'log1', 'log2', function ($uibModalInstance, log1, log2) {
      this.log1 = log1;
      this.log2 = log2;
      this.showUnchangedFlag = false;
      this.showUnchanged = () => {
        if (this.showUnchangedFlag) {
          jsondiffpatch.formatters.html.hideUnchanged();
        } else {
          jsondiffpatch.formatters.html.showUnchanged();
        }
        this.showUnchangedFlag = !this.showUnchangedFlag;
      };
      this.ok = () => {
        $uibModalInstance.dismiss('cancel');
      };
    }];

    modalService.show({
      size: 'lg',
      templateUrl: 'app/search/delta-modal.html',
      controller: ModalInstanceCtrl,
      controllerAs: '$ctrl',
      resolve: {
        log1: () => this.log1,
        log2: () => this.log2
      }
    }).then(selectedItem => {
      this.selected = selectedItem;
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  selectLog(logId) {
    if (this.selectedLog.includes(logId)) {
      this.selectedLog.splice(this.selectedLog.indexOf(logId), 1);
    } else {
      this.selectedLog.push(logId);
    }
  }
}

angular
  .module('fd-view')
  .component('searchView', {
    templateUrl: 'app/search/search.html',
    controller: MetaHeaderCtrl
  });
