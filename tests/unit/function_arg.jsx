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

  let wrapped = render(Wrap, props, [
    <div className="first">1</div>,
    <span className="second">2</span>,
    <p className="third">3</p>,
  ]);

  let unwrapped = <div { ... props }>
    <div className="first">1</div>
    <span className="second">2</span>
    <p className="third">3</p>
  </div>

  return assert.deepEqual(unwrapped, wrapped);
}
