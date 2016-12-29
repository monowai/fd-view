

exports.config = {

  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': require('phantomjs-prebuilt').path
  },
  // seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
  specs: ['../tests/e2e/*.js'],
  baseUrl: 'http://127.0.0.1:8888',
  framework: 'jasmine2',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  // Additional parameters to use in test suites
  params: {
    login: {
      user: 'test',
      password: 'test'
    }
  }
};
