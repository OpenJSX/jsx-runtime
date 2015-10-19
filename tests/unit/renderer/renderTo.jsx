var renderTo = require('../../_unwrap-renderer.js').renderTo;
var assert = require('assert');

export var tests = {
  'fragment': function() {
    var target = <div />;
    var result = <div>
      <span />
      <p />
      <div />
    </div>;

    renderTo(target, [<span />, <p />, <div />]);

    return assert.deepEqual(target, result);
  },
  'single': function() {
    var target = <div />;
    var result = <div>
      <span>test</span>
    </div>;

    renderTo(target, <span>test</span>);

    return assert.deepEqual(target, result);
  }
}
