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
    _test: true,
    before: {}
  };

  let wrapped = render(
    <Wrap before="1" { ... props }></Wrap>
  );

  let unwrapped = <div Test={ 1 } test="2" _test={ true } before={ {} }></div>

  return assert.deepEqual(unwrapped, wrapped);
}
