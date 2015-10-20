import assert from 'assert';
import runtime from '../../../';

export var tests = {
  '#tags definition is required':
  $(render => {
    assert.throws(() => {
      render(<div />);
    }, (e) => {
      return e.message === 'JSX [div] is not found and [*] is missing';
    });
  }, {}),

  'enter() visitor is required':
  $(render => {
    assert.throws(() => {
      render(<div />);
    }, (e) => {
      return e.message === 'JSX Interpreter handler should provide [enter] method';
    });
  }, {
    tags: {
      '*': {}
    }
  }),
  'enter()': $(render => {
    assert.equal(render(<div />), 'div1');
  }, {
    tags: {
      'div': {
        enter: function(tag) {
          return tag + '1';
        }
      }
    }
  }),
  'leave()': $(render => {
    assert.equal(render(<div />), 'div12');
  }, {
    tags: {
      'div': {
        enter: function(tag) {
          return tag + '1';
        },
        leave: function(tag) {
          return tag + '2'
        }
      }
    }
  }),
  'props()': $(render => {
    var result = render(<div foo="1" bar="2" baz="3" />);

    assert.deepEqual(result, {
      tag: 'div',
      props: {
        foo: '11',
        bar: '21',
        baz: '31'
      },
      children: null
    });
  }, {
    tags: {
      'div': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: null
          }
        },
        props: function(props) {
          var newProps = {};

          Object.keys(props).forEach(function(key) {
            newProps[key] = props[key] + '1';
          });

          return newProps;
        }
      }
    }
  }),
  'child()': $(render => {
    var result = render(<div>
      <span></span>
      { 1 }
      test
    </div>);

    assert.deepEqual(result, {
      tag: 'div',
      props: null,
      children: [
        { tag: 'span', children: [], props: null },
        1,
        'test'
      ]
    });
  }, {
    tags: {
      '*': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: []
          }
        },
        child: function(child, parent) {
          parent.children.push(child);
          return child;
        }
      }
    }
  }),
  'children()': $(render => {
    var result = render(<div>
      { true }
      { 1 }
      test
    </div>);

    assert.deepEqual(result, {
      tag: 'div',
      props: null,
      children: [
        'true1',
        '11',
        'test1'
      ]
    });
  }, {
    tags: {
      '*': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: []
          }
        },
        child: function(child, parent) {
          parent.children.push(child);
          return child;
        },
        children: function(children, parent) {
          return children.map((child) => child + '1');
        }
      }
    }
  }),
  'custom() as a child': $(render => {
    class Foo extends Custom {};

    const actual = render(<div>
      <Foo test="1"><span /></Foo>
    </div>);

    const expected = <div>
      <div test="1"><span /></div>
    </div>;

    assert.deepEqual(actual, expected);
  }, {
    tags: {
      '*': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: null
          };
        },
        custom: function(Class, props, children) {
          var result = new Class(props, children);
          return result.render();
        },
        child: function(child, parent) {
          parent.children || (parent.children = []);
          parent.children.push(child);
          return child;
        }
      }
    }
  }),
  'custom() as a top-level': $(render => {
    class Foo extends Custom {};

    const actual = render( <Foo test="1"><span /></Foo>);
    const expected = <div test="1"><span /></div>;

    assert.deepEqual(actual, expected);
  }, {
    tags: {
      '*': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: null
          };
        },
        custom: function(Class, props, children) {
          var result = new Class(props, children);
          return result.render();
        },
        child: function(child, parent) {
          parent.children || (parent.children = []);
          parent.children.push(child);
          return child;
        }
      }
    }
  }),
  'custom() as a top-level function': $(render => {
    class Foo extends Custom {};

    const actual = render(Foo, {
      test: '1'
    }, [<span />]);
    const expected = <div test="1"><span /></div>;

    assert.deepEqual(actual, expected);
  }, {
    tags: {
      '*': {
        enter: function(tag, props) {
          return {
            tag, props,
            children: null
          };
        },
        custom: function(Class, props, children) {
          var result = new Class(props, children);
          return result.render();
        },
        child: function(child, parent) {
          parent.children || (parent.children = []);
          parent.children.push(child);
          return child;
        }
      }
    }
  })
};

class Custom {
  constructor(props, children) {
    this.props = props;
    this.children = children;
  }

  render() {
    return <div { ...this.props }>{ this.children }</div>;
  }
}

function $(fn, config) {
  return function() {
    var renderer = runtime.register('test', config);

    fn(renderer.render);

    runtime._remove('test');
  };
}