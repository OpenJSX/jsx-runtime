"use strict";

var isArray = Array.isArray;
var assign = require('object-assign');

var MAX_ARRAY_DEPTH = 3;

function Renderer(handler, params) {
  var _this = this;

  this.scope = null;
  this.renderType = params.renderType;
  this.updateType = params.updateType;
  this.handler = handler;
  this.handler.setRenderer(this);

  this._render = function _render(element, noFragment) {
    var oldScope = _this.scope;

    _this.scope = {};
    element = handler.before(element);

    // do not use render overrides at a moment
    // var result = handler.render(...)();
    var result = function(element) {
      if (!isArray(element)) {
        return _this.handleChild(element);
      }

      if (noFragment) {
        var result = [];

        _this.walkChildren(element, function(val) {
          result.push(_this.handleChild(val));
        });

        return result;
      }

      var fragment = handler.fragment();
      _this.handleChildren('#fragment', element, fragment);

      return fragment;
    }(element);

    result = handler.after(result);
    _this.scope = oldScope;

    return result;
  };

  this.render = function render(element, props, children) {
    element = _this.getElement(element, props, children);
    return _this._render(element);
  };

  this.renderTo = function renderTo(target, element, props, children) {
    element = _this.getElement(element, props, children);
    element = _this._render(element);

    handler.renderTo(element, target);
  };
};

Renderer.prototype = {
  handleChild: function(thing) {
    if (thing == null) {
      return null;
    }

    if (typeof thing === 'function') {
      thing = thing();
    }

    if (this.isTagDescriptor(thing)) {
      return this.handleTag(thing);
    }

    return thing;
  },
  walkChildren: function(children, childHandler, index) {
    var stack = [];

    var next = [0, children.length, children];
    var child;
    var length;
    var i;

    index = index | 0;

    top: while (true) {
      if (!next) {
        throw new Error('123');
      }

      i = next[0]
      length = next[1];
      children = next[2];

      for (; i < length; i++) {
        child = children[i];

        if (child == null) continue;

        if (isArray(child) && stack.length < MAX_ARRAY_DEPTH) {
          stack.push([i + 1, length, children]);
          next = [0, child.length, child];
          continue top;
        }

        childHandler(this.handleChild(child), index++);
      }

      if (!stack || !stack.length) break;

      next = stack.pop();
    }
  },

  handleTag: function(descriptor) {
    var tag = descriptor.tag;
    var props = descriptor.props;
    var children = descriptor.children;
    var parent;
    var tagFunction;

    props = (isArray(props) ? assign.apply(null, props) : props || null);

    if (isArray(tag)) {
      tagFunction = tag[1];
      tag = tag[0];

      var child = this.handler.custom(tag, tagFunction, props, children);
      this.check(child, 'custom');

      return this.render(child);
    }

    // Put children handling here if bottom-to-top handling is better

    props = props && this.handler.props(tag, props);
    this.check(props, 'props');

    parent = this.handler.enter(tag, props);
    this.check(parent, 'enter');

    if (isArray(children) && children.length) {
      children = this.handler.children(tag, children, parent);
      this.check(children, 'children');

      this.handleChildren(tag, children, parent);
    }

    parent = this.handler.leave(tag, parent);
    this.check(parent, 'leave')

    return parent;
  },

  handleChildren: function(tag, children, parent, index) {
    var self = this;

    this.walkChildren(children, function(child, i) {
      // probably move this to handleTag() method
      // and provide parentValue for handleChild() call
      child = self.handler.child(tag, parent, child, i);
      self.check(child, 'child');
    }, index);
  },

  isTagDescriptor: function(object) {
    return object && typeof object === 'object' && 'tag' in object &&
      'props' in object && 'children' in object;
  },

  check: function(result, source) {
    if (typeof result === 'undefined') {
      throw new Error('Source [' + source + '] returned undefined');
    }

    return result;
  },
  getElement: function(element, props, children) {
    if (!element) throw new Error('JSX element is not presented');
    if (isArray(element)) return element;

    if (typeof element === 'string') {
      element = {
        tag: element,
        props: isObject(props) ? props : null,
        children: isArray(children) ? children : null
      };
    } else if (typeof element === 'function') {
      element = {
        tag: [element.name || element.displayName || '', element],
        props: isObject(props) ? props : null,
        children: isArray(children) ? children : null
      };
    } else if (!this.isTagDescriptor(element)) {
      throw new Error('Top level element should be a tag or function which returns a tag');
    }

    return element;
  },

  callHandle: function(handle, args) {
    return this.handler[handle].apply(this.handler, args);
  }
};

function isObject(obj) {
  return typeof obj === 'object' && obj && !isArray(obj);
}

module.exports = Renderer;