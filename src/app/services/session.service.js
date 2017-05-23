export default class Session {
  create(data) {
    this.login = data.login;
    this.name = data.name;
    this.email = data.email;
    this.status = data.status;
    this.companyName = data.companyName;
    this.userRoles = data.userRoles;
    this.apiKey = data.apiKey;
  }

  invalidate() {
    this.login = null;
    this.name = null;
    this.email = null;
    this.status = null;
    this.companyName = null;
    this.userRoles = null;
    this.apiKey = null;
  }
}
