const noop = () => false;

try {
  module.exports = require('./sparse.node');
} catch (_) {
  module.exports = {
    setSparse: noop,
    holePunch: noop
  };
}
