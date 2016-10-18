angular
  .module('fd-view')
  .directive('autofocus', ['$timeout', $timeout => {
    return {
      restrict: 'A',
      link: (scope, element) => {
        $timeout(() => element[0].focus());
      }
    };
  }]);
