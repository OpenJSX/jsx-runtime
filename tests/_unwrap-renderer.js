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