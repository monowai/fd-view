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

angular
  .module('fd-view')
  .component('navBar', {
    templateUrl: 'app/layout/nav-bar.html',
    controller: NavBar
  });
