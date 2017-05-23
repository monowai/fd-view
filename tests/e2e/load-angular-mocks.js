// https://reasoncodeexample.com/2015/10/03/loading-angular-mocks-js-as-a-mock-module-angular-integration-tests/

module.exports = {
  mock: getScript()
};

function getScript() {
  const path = require("path");
  const fs = require("fs");
  const angularMocksDir = path.dirname(require.resolve("angular-mocks"));
  const angularMocksFilePath = path.join(angularMocksDir, "angular-mocks.js");

  return fs.readFileSync(angularMocksFilePath).toString();
}
