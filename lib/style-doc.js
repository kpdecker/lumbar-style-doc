var hl = require('highlight.js'),
    marked = require('marked');

hl.LANGUAGES['html'] = hl.LANGUAGES['htm'] = hl.LANGUAGES['xml'];

module.exports = function(input, options) {
  var highlight = !options || options.highlight === undefined || options.highlight;

  marked.setOptions({
    gfm: true,
    pedantic: false,
    sanitize: false,
    highlight: function(code, lang) {
      if (!highlight) {
        return code;
      }

      if (lang && hl.LANGUAGES[lang]) {
        return hl.highlight(lang, code).value;
      } else {
        return hl.highlightAuto(code).value;
      }
    }
  });

  var ast = marked.lexer(input),
      updated = [],
      id = 0;
  for (var i = 0, len = ast.length; i < len; i++) {
    var token = ast[i];
    updated.push(token);
    if (token.type == 'code') {
      if (token.lang === 'htm') {
        token.lang = 'html';
      }

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
