import angular from 'angular';
import uiBootstrap from 'angular-ui-bootstrap';
import uiTree from 'angular-ui-tree';
import monospaced from 'angular-elastic';
import services from '../../../services';

import EditColdefModal from './edit-coldef.service';
import {tagInput} from './tag-input.component';
import {colProperties} from './col-properties/col-properties.component';
import {columnTab} from './column-tab/column-tab.component';
import {tagTab} from './tag-tab/tag-tab.component';
import {relationshipsTab} from './relationships-tab/relationships-tab.component';
import {entityLinksTab} from './entity-links-tab/entity-links-tab.component';
import {geodataTab} from './geodata-tab/geodata-tab.component';
// import ngtextcomplete from 'ng-textcomplete';

export default angular
  .module('EditColdefModal', [uiBootstrap, uiTree, monospaced, services])
  .service('EditColdefModal', EditColdefModal)
  .component('tagInput', tagInput)
  .component('colProperties', colProperties)
  .component('columnTab', columnTab)
  .component('tagTab', tagTab)
  .component('relationshipsTab', relationshipsTab)
  .component('entityLinksTab', entityLinksTab)
  .component('geodataTab', geodataTab).name;
