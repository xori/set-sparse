const noop = () => false;

try {
  module.exports = require('./sparse.node').setSparse;
} catch (_) {
  module.exports = noop;
}
