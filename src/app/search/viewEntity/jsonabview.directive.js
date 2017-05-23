import angular from 'angular';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

export default function fdJsonabview() {
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
