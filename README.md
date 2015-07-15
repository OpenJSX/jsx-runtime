[![Build Status](https://travis-ci.org/jsx-ir/jsx-runtime.svg?branch=master)](https://travis-ci.org/jsx-ir/jsx-runtime)

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

### API

_Definition in TypeScript format_
```typescript
/// <reference path="https://github.com/jsx-ir/spec/blob/master/spec.d.ts" />

interface Runtime {
  // Register Renderer
  register(name: string, config: RendererConfig): Renderer;
}

interface RendererConfig {
  // Method is called by the Renderer before tag handlers receives any signals
  // This allows to override passed data, or setup some props
  before(element: JSX.Element): JSX.Element;

  // Method is called by the Renderer after all JSX tree is handled by tag handlers
  // This allows post modification of generated output
  after(element: any): any;

  tags: {
    // Wildcard for any tag. Think about it as a default handler.
    // Is used when specific tag handler is not present
    '*': TagHandler;

    // Handlers of any tags, like 'div', 'span', 'SomethingCool', etc.
    [tag: string]: TagHandler;
  };
}

interface TagHandler {
  // [optional]
  // If present, is called with JSX.Props of JSX.Element.
  // Returns new value for props
  props?: (props: JSX.Props, tag: string) => any;

  // [optional]
  // If present, is called with JSX.Child of JSX.Element's children.
  // Return new value for child
  child?: (child: JSX.Child, parent: any, tag: string) => any;

  // This is mandatory signal. Takes tag name of currently handled tag,
  // and props value previously handled by "props" signal, if it was present
  enter: (tag: string, props: any) => any;

  // [optional]
  // If present, is called with "element" returned by "enter" signal.
  // Return new value for element
  leave?: (element: any, tag: string) => any;

  // [optional]
  // If present, is called with JSX.Children which is JSX.Element's children property
  // This method is called before any "child" signal is called.
  // Returns new array of children
  children?: (children: JSX.Children, parent: any, tag: string) => any[];

  // [optional]
  // If present, allows to override Runtime's internal handling of tags
  // captured form the scope, i.e. function-tags or component-tags
  custom?: (fn: Function, props: JSX.Props, children: JSX.Children, tag: string) => any;
}

interface Renderer {
  // Renders JSX.Element
  render(element: JSX.Element);

  // Computes JSX.Element from giving parameters and renders it as function-tag
  render(fn: Function, props?: JSX.Props, children?: JSX.Children);

  // Computes JSX.Element from giving parameters and renders simple tag
  render(tag: string, props?: JSX.Props, children?: JSX.Children);
}
```

### License

[MIT](LICENSE.md)