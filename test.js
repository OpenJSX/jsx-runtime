var jsx = require('./');

jsx.register('HTML', {
  '*': {
    enter: function(tag, props) {
      props = props ? ' ' + props : '';

      return '<' + tag + props + '>';
    },
    leave: function(parent, tag) {
      return parent + '</' + tag + '>';
    },
    child: function(child, parent) {
      return parent + child;
    },
    props: function(props) {
      return Object.keys(props).map(function(key) {
        return key + '="' + props[key] + '"';
      }).join(' ');
    }
  }
});

var html = jsx.render({
  tag: 'div',
  props: {
    test: 1,
    zzz: 2,
    blah: "3"
  },
  children: [1, 2, '3', true, {tag: 'span', props: null, children: null}]
}, 'html');

console.log(html);