var fs = require('fs'),
    hl = require('highlight.js'),
    jade = require('jade'),
    marked = require('marked'),
    stylus = require('stylus');

hl.LANGUAGES['html'] = hl.LANGUAGES['htm'] = hl.LANGUAGES['xml'];

const DEFAULT_TEMPLATE = fs.readFileSync(__dirname + '/template.jade');

module.exports = function(input, options) {
  var highlight = !options || options.highlight === undefined || options.highlight,
      template = options && options.template !== undefined ? options.template : DEFAULT_TEMPLATE;

  template = template ? jade.compile(template) : function(data) { return data.content; };

  marked.setOptions({
    gfm: true,
    pedantic: false,
    sanitize: false,
    highlight: function(code, lang) {
      if (!highlight) {
        return code;
      }

      if (lang && hl.LANGUAGES[lang]) {
        var ret = hl.highlight(lang, code).value;

        // Work around a rendering bug in highlight js where gt are not being escaped.
        if (lang === 'html') {
          ret = ret.replace(/>>/g, '>&gt;');
        }

        return ret;
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
      } else if (token.lang === 'css') {
        updated.push({
          type: 'html',
          pre: true,
          text: '<style class="style-doc-sample">' + token.text + '</style>'
        });
      } else if (token.lang === 'stylus') {
        stylus.render(token.text, function(err, style){
          if (err) {
            throw err;
          }

          // WARN: This assumes that stylus never goes async. UT coverage should handle this case should that happen
          updated.push({
            type: 'html',
            pre: true,
            text: '<style class="style-doc-sample">' + style + '</style>'
          });
        })
      }
    }
  }

  return template({
    sheets: (options && options.sheets) || [],
    content: marked.parser(updated)
  });
};
