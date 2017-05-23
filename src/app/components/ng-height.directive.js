/** @ngInject */
function ngHeight($window) {
  return {
    restrict: 'A',
    link: (scope, elem, attrs) => {
      const winHeight = $window.innerHeight;
      const headerHeight = attrs.ngHeight ? attrs.ngHeight : 0;
      elem.css('height', `${winHeight - headerHeight}px`);
    }
  };
}

export default ngHeight;
