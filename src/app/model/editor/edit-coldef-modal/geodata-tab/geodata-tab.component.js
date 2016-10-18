class GeodataTab {
}

angular
  .module('fd-view.modeler')
  .component('geodataTab', {
    templateUrl: 'app/model/editor/edit-coldef-modal/geodata-tab/geodata-tab.html',
    controller: GeodataTab,
    bindings: {
      tag: '<'
    }
  });
