import moment from 'moment-timezone';
import template from './fortress-admin.html';
import configModalTemplate from './config-modal.html';
import './fortress-admin.scss';

class AdminFortress {
  /** @ngInject */
  constructor($rootScope, QueryService, User, $http, modalService, ConceptModal, configuration, USER_ROLES) {
    this._root = $rootScope;
    this._query = QueryService;
    this._user = User;
    this._http = $http;
    this._modal = modalService;
    this._concept = ConceptModal;
    this._conf = configuration;
    this._roles = USER_ROLES;
  }

  $onInit() {
    this._query.general('fortress').then(data => {
      this.fortresses = data;
    });
  }

  isAdmin() {
    return this._user.isAuthorized(this._roles.admin);
  }

  selectFortress(f) {
    this.typeOpen = true;
    this.fortress = f;
    this._query.doc(f.name)
      .then(data => {
        this.documents = data;
      });
  }

  openConcept(fortress) {
    this._concept.display(fortress);
  }

  next() {
    const i = this.fortresses.indexOf(this.fortress);
    const f = this.fortresses[i < this.fortresses.length - 1 ? i + 1 : 0];
    this.selectFortress(f);
  }

  previous() {
    const i = this.fortresses.indexOf(this.fortress);
    const f = this.fortresses[i === 0 ? this.fortresses.length - 1 : i - 1];
    this.selectFortress(f);
  }

  editFortress(f = {searchEnabled: true, timeZone: moment.tz.guess()}) {
    const modalDefaults = {
      template: configModalTemplate
    };
    const modalOptions = {
      entity: 'Data Provider',
      obj: f
    };
    this._http.get(`${this._conf.engineUrl()}/api/v1/fortress/timezones`)
      .then(res => {
        modalOptions.timezones = res.data;
        return this._modal.show(modalDefaults, modalOptions);
      })
      .then(res => this._http.post(`${this._conf.engineUrl()}/api/v1/fortress/`, res))
      .then(res => {
        this._root.$broadcast('event:status-ok', res.statusText);
        this.fortress = res.data;
        this.fortresses.push(this.fortress);
      });
  }

  deleteFortress(f) {
    const modalDefaults = {
      size: 'sm'
    };
    const modalOptions = {
      obj: f,
      title: 'Delete...',
      text: `Warning! You are about to delete the Data Provider - "${f.name}" and all associated data. Do you want to proceed?`
    };
    this._modal.show(modalDefaults, modalOptions)
      .then(res => this._http.delete(`${this._conf.engineUrl()}/api/v1/admin/${res.code}`))
      .then(res => {
        this._root.$broadcast('event:status-ok', res.statusText);
        this.fortresses.splice(this.fortresses.indexOf(f), 1);
        this.fortress = null;
      });
  }

  rebuildFortress(f) {
    this._http.post(`${this._conf.engineUrl()}/api/v1/admin/${f.code}/rebuild`)
      .then(res => this._root.$broadcast('event:status-ok', res.statusText));
  }

  rebuildFortressDoc(f, d) {
    this._http.post(`${this._conf.engineUrl()}/api/v1/admin/${f.code}/${d.name}/rebuild`)
      .then(res => this._root.$broadcast('event:status-ok', res.statusText));
  }

  selectDocType(d) {
    this._http.get(`${this._conf.engineUrl()}/api/v1/fortress/${this.fortress.code}/${d.name}/segments`)
      .then(res => {
        this.segments = res.data[0].segments;
      });
  }

  editType(doc) {
    const modalDefaults = {
      template: configModalTemplate
    };
    const modalOptions = {
      entity: 'Document Type',
      obj: doc,
      disable: true
    };

    this._modal.show(modalDefaults, modalOptions)
      .then(res => this._http({
        method: 'PUT',
        url: `${this._conf.engineUrl()}/api/v1/fortress/${this.fortress.code}/${res.name}`,
        dataType: 'raw',
        headers: {'Content-Type': 'application/json'},
        data: ''
      }))
      .then(res => {
        this._root.$broadcast('event:status-ok', res.statusText);
        this.documents.push(res.data);
      });
  }

  deleteDocType(f, dt) {
    const modalDefaults = {
      size: 'sm'
    };
    dt.type = 'Document Type';
    const modalOptions = {
      obj: dt,
      title: 'Delete...',
      text: `Warning! You are about to delete the Document Type - "${dt.name}" and all associated data. Do you want to proceed?`
    };
    this._modal.show(modalDefaults, modalOptions)
      .then(res => this._http({
        method: 'DELETE',
        url: `${this._conf.engineUrl()}/api/v1/admin/${f.code}/${res.name}`,
        dataType: 'raw',
        headers: {'Content-Type': 'application/json'}
      }))
      .then(res => {
        this._root.$broadcast('event:status-ok', res.message);
        // this.documents.splice(this.documents.indexOf(dt), 1);
        this.selectFortress(f);
      });
  }

  deleteSegment(f, dt, s) {
    const modalDefaults = {
      size: 'sm'
    };

    const modalOptions = {
      obj: {name: s},
      title: 'Delete segment...',
      text: `Warning! You are about to delete the Document Segment - "${s}" and all associated data. Do you want to proceed?`
    };
    this._modal.show(modalDefaults, modalOptions)
      .then(res => this._http({
        method: 'DELETE',
        url: `${this._conf.engineUrl()}/api/v1/admin/${f.code}/${dt.name}/${res.name}`,
        dataType: 'raw',
        headers: {
          'Content-Type': 'application/json'
        }
      }))
      .then(res => {
        this._root.$broadcast('event:status-ok', res.message);
        this.segments.splice(this.segments.indexOf(s), 1);
      });
  }
}

export const adminFortress = {
  template,
  controller: AdminFortress
};
