angular
  .module('fd-view.modeler')
  .directive('fileBox', fileBox);

/** @ngInject */
function fileBox($parse) {
  return {
    restrict: 'AE',
    scope: false,
    transclude: true,
    template: `<div class="file-box-input">\
                  <input type="file" id="file" class="box-file">\
                  <label for="file" align="center"><strong>\
                  <i class="fa fa-cloud-download"></i> Click</strong>\
                  <span> to select a delimited file, or drop it here</span>.</label></div>\
                  <div ng-transclude></div>\
                  <div class="file-box-success"><strong>Done!</strong>&nbsp;{{fileName}} is loaded</div>`,
    link: (scope, element, attrs) => {
      const fn = $parse(attrs.fileBox);

      element.on('dragover dragenter', e => {
        e.preventDefault();
        e.stopPropagation();
        element.addClass('is-dragover');
      });
      element.on('dragleave dragend', () => {
        element.removeClass('is-dragover');
      });
      element.on('drop', e => {
        e.preventDefault();
        e.stopPropagation();

        if (e.originalEvent.dataTransfer) {
          if (e.originalEvent.dataTransfer.files.length > 0) {
            const reader = new FileReader();
            reader.fileName = e.originalEvent.dataTransfer.files[0].name;
            reader.onload = onLoadEvent => {
              scope.$apply(() => {
                fn(scope, {$fileContent: onLoadEvent.target.result, $fileName: reader.fileName});
              });
              element.addClass('is-success');
            };
            reader.readAsText(e.originalEvent.dataTransfer.files[0]);
          }
        }
      });
      element.on('change', onChangeEvent => {
        const reader = new FileReader();
        reader.fileName = onChangeEvent.target.files[0].name;
        reader.onload = onLoadEvent => {
          scope.$apply(() => {
            fn(scope, {$fileContent: onLoadEvent.target.result, $fileName: reader.fileName});
          });
          element.addClass('is-success');
        };
        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
}
