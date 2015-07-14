var render = require('../_unwrap-renderer.js').render;
var assert = require('assert');

export var test = () => {
  return assert.deepEqual(<div />, render(<div />));
}
