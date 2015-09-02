"use strict";

var isArray = Array.isArray;
var assign = require('object-assign');

var MAX_ARRAY_DEPTH = 3;

function Renderer(handler) {
  var _this = this;

  this.scope = null;
  this.handler = handler;
  this.handler.setRenderer(this);

  this.render = function renderJSX(element, props, children) {
    if (!element) throw new Error('JSX element is not presented');

    if (typeof element === 'string') {
      element = {
        tag: element,
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      };
    } else if (typeof element === 'function') {
      element = {
        tag: [element.name || element.displayName || '', element],
        props: isObject(props) ? props : null,
        children: Array.isArray(children) ? children : null
      };
    }

    if (!_this.isTagDescriptor(element)) {
      throw new Error('Top level element should be a tag or function which returns a tag');
    }

    _this.scope = {};
    element = handler.before(element);

    handler.process(function() {
      element = _this.renderChild(element);
    })();

    element = handler.after(element);
    _this.scope = null;

    return element;
  };
};

Renderer.prototype = {
  renderChild: function(thing) {
    if (thing == null) {
      return null;
    }

    if (this.isTagDescriptor(thing)) {
      return this.handleTag(thing);
    }

    return thing;
  },
  walkChildren: function(children, childHandler, depth) {
    var length = children.length;
    var i = 0;
    var child;

    depth = depth | 0;

    for (; i < length; i++) {
      child = children[i];

      if (child == null) continue;
      if (isArray(child) && depth < MAX_ARRAY_DEPTH) {
        this.walkChildren(child, childHandler);
        continue;
      }

      childHandler(this.renderChild(child));
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

      return this.renderChild(child);
    }

    // Put children handling here if bottom-to-top handling is better

    props = props && this.handler.props(tag, props);
    this.check(props, 'props');

    parent = this.handler.enter(tag, props);
    this.check(parent, 'enter');

    if (isArray(children) && children.length) {
      children = this.handler.children(tag, children, parent);
      this.check(children, 'children');

      parent = this.handleChildren(tag, children, parent);
    }

    parent = this.handler.leave(tag, parent);
    this.check(parent, 'leave')

    return parent;
  },

  handleChildren: function(tag, children, parent) {
    var self = this;

    this.walkChildren(children, function(child) {
      // probably move this to handleTag() method
      // and provide parentValue for renderChild() call
      parent = self.handler.child(tag, parent, child);
      self.check(parent, 'child');
    });

    return parent;
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
  }
};

function isObject(obj) {
  return typeof obj === 'object' && obj && !isArray(obj);
}

module.exports = Renderer;