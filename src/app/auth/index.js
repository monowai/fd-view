import angular from 'angular';

import {loginView} from './login.component';
import {welcomeView} from './welcome.component';
import LoginConfig from './login.config';

import './auth.scss';

export default angular
  .module('fd-view.auth', [])
  .component('loginView', loginView)
  .component('welcomeView', welcomeView)
  .config(LoginConfig)
  .name;
