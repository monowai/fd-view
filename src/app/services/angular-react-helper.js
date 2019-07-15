// https://github.com/sfroestl/angular-react-migration

import angular from 'angular';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {mapValues} from 'lodash';

function render(element, Component, props) {
  ReactDOM.render( < Component
  {...
    props
  }
  />, element);
}

function toBindings(propTypes) {
  return mapValues(propTypes, () => '<');
}

function toProps(propTypes, controller) {
  return mapValues(propTypes, (val, key) => {
    return controller[key];
  });
}

export function getAngularService(document, name) {
  const injector = angular.element(document.body).injector() || {}; // eslint-disable-line angular/document-service
  return injector.get(name);
}

export function react2angular(Component) {
  const {propTypes = {}} = Component;
  return {
    bindings: toBindings(propTypes),
    controller: /* @ngInject */ function controller($scope, $element) {
      this.$onChanges = () => render($element[0], Component, toProps(propTypes, this));
      this.$onDestroy = () => ReactDOM.unmountComponentAtNode($element[0]);
    }
  };
}

export const wrapProvider = WrappedComponent => ({store, ...props}) => (
  < Provider
store = {store} >
  < WrappedComponent
{...
  props
}
/>
< /Provider>
);
