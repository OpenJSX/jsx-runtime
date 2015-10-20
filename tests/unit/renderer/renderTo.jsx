import { renderTo } from '../../_unwrap-renderer.js';
import assert from 'assert';

export var tests = {
  'render fragment'() {
    var target = <div />;
    var result = <div>
      <span />
      <p />
      <div />
    </div>;

    renderTo(target, [<span />, <p />, <div />]);

    return assert.deepEqual(target, result);
  },
  'render single element'() {
    var target = <div />;
    var result = <div>
      <span>test</span>
    </div>;

    renderTo(target, <span>test</span>);

    return assert.deepEqual(target, result);
  }
}
