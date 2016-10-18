angular
  .module('fd-view.modeler')
  .directive('textcomplete', textcomplete);

/** @ngInject */
function textcomplete(Textcomplete) {
  return {
    restrict: 'EA',
    scope: {
      columns: '=',
      message: '=',
      id: '@',
      name: '@',
      placeholder: '@',
      disabled: '='
    },
    template: '<textarea id="{{id}}" name="{{name}}" ng-model="message" type="text"  class="form-control" msd-elastic ng-disabled="disabled" placeholder="{{placeholder}}"></textarea>',
    link: (scope, iElement, iAttrs) => {
      const cols = scope.columns;
      const codes = ['data'];
      const ta = iElement.find('textarea');
      const textcomplete = new Textcomplete(ta, [
        {
          match: /(^|\s)([\w\-]*)$/,
          search: (term, callback) => {
            callback(cols.map(colName => colName.toLowerCase().includes(term.toLowerCase()) ? colName : null));
          },
          index: 2,
          replace: colName => `$1['${colName}']`
        },
        {
          match: /(^|\s)#([\w\-]*)$/,
          search: (term, callback) => {
            callback(codes.map(code => code.toLowerCase().includes(term.toLowerCase()) ? code : null));
          },
          index: 2,
          replace: code => `$1#${code}[`
        }
      ]);

      angular.element(textcomplete).on({
        'textComplete:select': (e, value) => {
          scope.$apply(() => {
            scope.message = value;
          });
        },
        'textComplete:show': e => {
          angular.element(this).data('autocompleting', true);
        },
        'textComplete:hide': e => {
          angular.element(this).data('autocompleting', false);
        }
      });
    }
  };
}
