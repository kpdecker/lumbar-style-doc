var marked = require('marked');

module.exports = function(input, options) {
  marked.setOptions({
    gfm: true,
    pedantic: false,
    sanitize: false
  });

  var ast = marked.lexer(input),
      updated = [];
  for (var i = 0, len = ast.length; i < len; i++) {
    var token = ast[i];
    updated.push(token);
  }

  return marked.parser(updated);
};
