angular
  .module('fd-view')
  .directive('fdJsonabview', fdJsonabview);

function fdJsonabview() {
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      scope.$watch(attrs.abData, newValue => {
        const container = element[0];
        angular.element(container).empty();
        const options = {
          mode: 'view'
        };
        const editor = new JSONEditor(container, options);
        const data = scope.$eval(attrs.abData);

        editor.set(data);
      });
    }
  };
}
