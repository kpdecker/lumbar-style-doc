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
    if (token.type == 'code') {
      if (token.lang === 'html') {
        updated.push({
          type: 'html',
          pre: true,
          text: '<div class="style-doc-sample">' + token.text + '</div>'
        });
      }
    }
  }

  return marked.parser(updated);
};
