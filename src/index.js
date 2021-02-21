if (process.platform === 'win32') {
  module.exports = require('./sparse.node').setSparse;
} else {
  module.exports = function() { return false; };
}
