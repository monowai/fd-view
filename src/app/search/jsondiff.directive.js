angular
  .module('fd-view')
  .directive('fdJsondiff', () => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        const left = scope.$eval(attrs.abLeft);
        const right = scope.$eval(attrs.abRight);

        const delta = jsondiffpatch.create({
          objectHash: obj => {
            return obj._id || obj.id || obj.name || angular.toJson(obj);
          }
        }).diff(left, right);

        jsondiffpatch.formatters.html.hideUnchanged();
        // beautiful html diff
        angular.element('#visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        // self-explained json
        angular.element('#annotated').innerHTML = jsondiffpatch.formatters.annotated.format(delta, left);
      }
    };
  })
  .directive('fdJsondiff2', () => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        // scope.$watchCollection(['attr.abLeft','attrs.abRight'], function (newValue) {
        scope.$watch(attrs.abLeft, newValue => {
          const left = scope.$eval(attrs.abLeft);
          const right = scope.$eval(attrs.abRight);

          const delta = jsondiffpatch.create({
            objectHash: obj => {
              return obj._id || obj.id || obj.name || angular.toJson(obj);
            }
          }).diff(left, right);

          jsondiffpatch.formatters.html.hideUnchanged();
          // beautiful html diff
          angular.element('#visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
        });
      }
    };
  });
