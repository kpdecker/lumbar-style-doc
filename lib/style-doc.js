var marked = require('marked');

module.exports = function(input, options) {
  marked.setOptions({
    gfm: true,
    pedantic: false,
    sanitize: false
  });

  var ast = marked.lexer(input),
      updated = [],
      id = 0;
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
      } else if (token.lang === 'handlebars') {
        var uniqueId = ++id;

        updated.push({
          type: 'html',
          pre: true,
          text: '<div id="handlebars-' + uniqueId + '" class="style-doc-sample"></div>\n'
            + '<script>document.getElementById("handlebars-' + uniqueId + '").innerHTML = '
              + 'Handlebars.compile("' + token.text.replace(/"/g, '\\"') + '")();</script>'
        });
      }
    }
  }

  return marked.parser(updated);
};
