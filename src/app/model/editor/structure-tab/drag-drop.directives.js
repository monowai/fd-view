angular
  .module('fd-view.modeler')
  .directive('draggable', draggable)
  .directive('droppable', droppable);

function draggable() {
  return (scope, element) => {
    // this gives us the native JS object
    const el = element[0];
    el.draggable = true;

    el.addEventListener('dragstart', e => {
      // console.log(this);

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('id', this.id);
      this.classList.add('dragging');
      return false;
    }, false);

    el.addEventListener('dragend', () => {
      this.classList.remove('dragging');

      return false;
    }, false);
  };
}

function droppable() {
  return {
    scope: {
      droppable: '='
    },
    link: (scope, element) => {
      const el = element[0];

      el.addEventListener('dragover', e => {
        e.dataTransfer.dropEffect = 'move';

        if (e.preventDefault) {
          e.preventDefault();
        }

        return false;
      }, false);

      el.addEventListener('drop', e => {
        // Stops some browsers from redirecting.
        if (e.stopPropagation) {
          e.stopPropagation();
        }

        const elementDropped = document.getElementById(e.dataTransfer.getData('id'));
        const dropMethod = scope.droppable;

        // call the drop passed drop function
        if (angular.isFunction(dropMethod)) {
          scope.droppable(elementDropped, element[0], e);
        }

        return false;
      }, false);
    }
  };
}
