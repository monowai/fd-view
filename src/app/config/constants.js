/* Constants */

angular
  .module('config', [])
  .constant('engineUrl', 'http://127.0.0.1:8080')
  .constant('USER_ROLES', {
    all: '*',
    admin: 'ROLE_FD_ADMIN',
    user: 'ROLE_FD_USER'
  });
