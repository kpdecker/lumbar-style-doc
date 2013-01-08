var _ = require('underscore'),
    fs = require('fs'),
    hl = require('highlight.js'),
    jade = require('jade'),
    marked = require('marked'),
    stylus = require('stylus');

hl.LANGUAGES.html = hl.LANGUAGES.htm = hl.LANGUAGES.xml;

const DEFAULT_TEMPLATE = fs.readFileSync(__dirname + '/../resources/template.jade');

function escapeJavascript(string) {
  return string.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

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
      content = [],
      sections = [],
      id = 0;

  function finishSection() {
    if (updated.length) {
      if (updated[0].section) {
        updated.push({
          section: true,
          type: 'html',
          pre: true,
          text: '</section>\n',
        });
      }
      updated.links = {};   // Required with marked 0.2.6+ For some reason...
      content.push(marked.parser(updated));
      updated = [];
    }
  }

  for (var i = 0, len = ast.length; i < len; i++) {
    var token = ast[i];
    if (token.type === 'heading' && token.depth === 2) {
      finishSection();

      var sectionId = 'section-' + (++id);
      sections.push({
        id: sectionId,
        name: token.text
      });

      updated.push({
        section: true,
        type: 'html',
        pre: true,
        text: '<section id="' + sectionId + '">\n'
      });
      token.depth = 1;
    }

    updated.push(token);

    if (token.type === 'code') {
      if (token.lang === 'htm') {
        token.lang = 'html';
      }

      if (token.lang === 'html') {
        updated.push({
          type: 'html',
          pre: true,
          text: '<div class="style-doc-sample">' + token.text + '</div>'
        });
      } else if (token.lang === 'javascript') {
        updated.push({
          type: 'html',
          pre: true,
          text: '<script>' + token.text + '</script>'
        });
      } else if (token.lang === 'handlebars') {
        var uniqueId = ++id;

        updated.push({
          type: 'html',
          pre: true,
          text: '<div id="handlebars-' + uniqueId + '" class="style-doc-sample"></div>\n'
            + '<script>document.getElementById("handlebars-' + uniqueId + '").innerHTML = '
              + 'Handlebars.compile("' + escapeJavascript(token.text) + '")(context || {});</script>'
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
        });
      }
    }
  }
  finishSection();

  // Cleanup any template data if necessary
  var templates = {};
  if (options && options.templates) {
    _.each(options.templates, function(value, key) {
      templates[escapeJavascript(key)] = escapeJavascript(value);
    });
  }

  return template({
    sections: sections,
    scripts: (options && options.scripts) || [],
    templates: templates,
    sheets: (options && options.sheets) || [],
    content: content.join('')
  });
};

module.exports.findTemplates = function(input) {
  /*jshint boss:true*/
  var templates = [];

  var extractTemplate = /\{\{\s*#?\s*template\s*"((?:[^"]|\\")+)"/g,
      match;
  while (match = extractTemplate.exec(input)) {
    templates.push(match[1]);
  }

  return _.uniq(templates);
};
