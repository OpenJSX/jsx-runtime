var jsx = require('../');

var renderer = jsx.register('jsx-unwrap', {
  fragment: function() {
    return {
      tag: '#fragment',
      props: null,
      children: []
    };
  },

  renderTo: function(target, element) {
    if (element.tag === '#fragment') {
      target.children = element.children;
    } else {
      target.children = [element];
    }
  },

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
        return child;
      }
    }
  }
});

module.exports = renderer;