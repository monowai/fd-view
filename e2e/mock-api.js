const MockAPI = function() {
   angular.module('fdApiMock', ['fd-view','ngMockE2E'])
      .run(function($httpBackend) {
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

        $httpBackend.whenPOST('http://127.0.0.1:8080/api/v1/ping')
          .respond('pong');

        $httpBackend.whenPOST('http://127.0.0.1:8080/api/v1/login')
          .respond(account);

        $httpBackend.whenGET('http://127.0.0.1:8080/api/account')
          .respond(account);

        $httpBackend.whenPOST('http://127.0.0.1:8080/api/v1/query/').respond(['a','b']);

        $httpBackend.whenGET('http://127.0.0.1:8080/api/v1/fortress/')
          .respond(null);

        $httpBackend.whenGET(/.*/).passThrough();
      })
};

module.exports = MockAPI;
