import template from './nav-bar.html';

class NavBar {
  /** @ngInject */
  constructor(User, AuthenticationSharedService) {
    this.profile = User.account;
    this._auth = AuthenticationSharedService;
  }

  logout() {
    this._auth.logout();
  }
}

export const navBar = {
  template,
  controller: NavBar
};
