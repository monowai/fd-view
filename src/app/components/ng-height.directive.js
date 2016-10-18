angular
  .module('fd-view')
  .directive('ngHeight', ngHeight);

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
