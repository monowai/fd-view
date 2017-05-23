const MockAPI = function() {
  angular.module('fdApiMock', ['fd-view', 'ngMockE2E'])
    .run(function($httpBackend, configuration) {
      const account = {
        "login": "test",
        "name": "test",
        "companyName": "flockdata",
        "apiKey": "SeCreT_ApI_kEy",
        "email": null,
        "status": "ENABLED",
        "userRoles": [
          "ROLE_FD_ADMIN",
          "ROLE_FD_USER",
          "ROLE_USER"
        ],
        "active": true
      };

      const engineUrl = configuration.engineUrl();

      $httpBackend.whenPOST(engineUrl+'/api/v1/ping')
        .respond('pong');

      $httpBackend.whenPOST(engineUrl+'/api/v1/login')
        .respond(account);

      $httpBackend.whenGET(engineUrl+'/api/account')
        .respond(account);

      $httpBackend.whenPOST(engineUrl+'/api/v1/query/')
        .respond(['a','b']);

      $httpBackend.whenGET(engineUrl+'/api/v1/fortress/')
        .respond(null);

      $httpBackend.whenGET(/.*/).passThrough();
    })
};

module.exports = MockAPI;
