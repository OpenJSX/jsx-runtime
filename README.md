## JSX IR Runtime

Runtime for rendering JSX-IR. Runtime does not renders JSX-IR, otherwise it provides common interfaces for Renderer to be implemented.

### Installation

```npm install jsx-runtime```

### Usage

This package does not really intended to be used by the end user, instead users should install Renderers which depends on this package.

Runtime 1 main and most important method,  registers an Renderer to the runtime:

```js
  jsx.register(rendererName, rendererConfig);
```

Simple Renderer may look like this:
```js
var jsx = require('../');

var renderer = jsx.register('jsx-unwrap', {
  tags: {
    '*': {
      enter: function(tag, props) {
        return {
          tag: tag,
          props: props || null,
          children: []
        };
      },
      leave: function(parent, tag) {
        if (!parent.children.length) {
          parent.children = null;
        }

        return parent;
      },
      child: function(child, parent) {
        parent.children.push(child);
        return parent;
      }
    }
  }
});

module.exports = renderer;
```
_https://github.com/jsx-ir/jsx-runtime/blob/master/tests/_unwrap-renderer.js_

This simple Renderer from tests just unwraps incoming data back to JSX-IR so it could be easy testable. Renderers could be used in many different ways, starting from generating simple string-markup to complex output of framework objects, bypassing string/dom parsing and initializing directly with passed values.

