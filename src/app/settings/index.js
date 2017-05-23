import angular from 'angular';

import {settingsView} from './settings.component';
import SettingsConfig from './settings.config';

export default angular
  .module('fd-view.settings', [])
  .component('settingsView', settingsView)
  .config(SettingsConfig)
  .name;
