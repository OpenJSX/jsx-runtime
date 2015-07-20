var render = require('../_unwrap-renderer.js').render;
var assert = require('assert');

function Wrap(props, children) {
  return <div {... props }>
    { children }
  </div>
}

export var test = () => {
  let props = {
    Test: 1,
    test: '2',
    _test: true
  };

  let wrapped = render(
    <Wrap { ... props } after="1"></Wrap>
  );

  let unwrapped = <div Test={ 1 } test="2" _test={ true } after="1"></div>

  return assert.deepEqual(unwrapped, wrapped);
}
