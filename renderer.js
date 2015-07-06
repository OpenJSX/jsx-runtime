var isArray = Array.isArray;
var hasOwn = Object.prototype.hasOwnProperty;

function Renderer(interpreter, callbacks) {
  this.callBefore = callbacks && callbacks.before || this.noop;
  this.callAfter = callbacks && callbacks.after || this.noop;

  this.interpreter = interpreter;
};

Renderer.prototype = {
  render: function renderJSX(tree) {
    if (!tree) throw new Error('JSX tree is not presented');

    if (!this.isPrimitive(tree) && !this.isTagDescriptor(tree)) {
      throw new Error('Tree top level item should be tag or primitive value');
    }

    tree = this.callBefore(tree);
    tree = this.renderChild(tree);
    tree = this.callAfter(tree);

    return tree;
  },
  renderChild: function(thing) {
    if (thing == null) {
      return null;
    }

    if (this.isTagDescriptor(thing)) {
      return this.handleTag(thing);
    }

    if (isArray(thing)) {
      // handle this if returning multiple elements will be supported
    }

    if (this.isPrimitive(thing)) {
      return this.handlePrivimite(thing);
    }

    throw new Error('Wrong value for JSX tree');
  },

  handleTag: function(descriptor) {
    var tag = descriptor.tag + '';
    var props = descriptor.props;
    var children = descriptor.children;
    var parent;

    // Put children handling here if bottom-to-top handling is better

    props = props && this.interpreter.props(tag, props);
    parent = this.interpreter.enter(tag, props);

    if (isArray(children) && children.length) {
      parent = this.handleChildren(tag, children, parent);
    }

    parent = this.interpreter.leave(tag, parent);

    return parent;
  },

  handleChildren: function(tag, children, parent) {
    var length = children.length;
    var i = 0;
    var child;

    for (; i < length; i++) {
      child = this.renderChild(children[i]);

      if (child) {
        // probably move this to handleTag() method
        // and provide parentValue for renderChild() call
        parent = this.interpreter.child(tag, parent, child);
      }
    }

    return parent;
  },
  handlePrivimite: function(thing) {
    return thing;
  },

  isPrimitive: function(thing) {
    switch (typeof thing) {
      case 'string':
      case 'boolean':
      case 'number':
        return true;
    }

    return false;
  },
  isTagDescriptor: function(object) {
    return object && typeof object === 'object' && 'tag' in object &&
      'props' in object && 'children' in object;
  },

  noop: function(a) { return a }
};

module.exports = Renderer;