/** @ngInject */
function autofocus($timeout) {
  return {
    restrict: 'A',
    link: (scope, element) => {
      $timeout(() => element[0].focus());
    }
  };
}

export default autofocus;
