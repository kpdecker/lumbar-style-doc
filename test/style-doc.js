var styleDoc = require('../lib/style-doc'),
    should = require('should');

describe('file generator', function() {
  const MARKDOWN = '# test';
  const TEMPLATE_PREFIX = '<!DOCTYPE html><html>'
        + '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">';
  const BODY = '</head><body><h1>test</h1>\n</body></html>';

  it('should output jade template', function() {
    styleDoc(MARKDOWN).should.equal(TEMPLATE_PREFIX + BODY);
  });
  it('should output passed jade template', function() {
    styleDoc(MARKDOWN, {template: '|foo !{content}'}).should.equal('foo <h1>test</h1>\n');
  });

  it('should include script references', function() {
    styleDoc(MARKDOWN, {scripts: ['foo', 'bar']}).should.equal(
      TEMPLATE_PREFIX
        + '<script src="foo"></script><script src="bar"></script>'
        + BODY);
  });

  it('should include sheet references', function() {
    styleDoc(MARKDOWN, {sheets: [{href: 'foo'}, {href: 'bar', media: 'foo'}]}).should.equal(
      TEMPLATE_PREFIX
        + '<link rel="stylesheet" href="foo"><link rel="stylesheet" href="bar" media="foo">'
        + BODY);
  });
  it('should include template references', function() {
    styleDoc(MARKDOWN, {templates: {"ba\nr": 'as\"df'}}).should.equal(
      TEMPLATE_PREFIX
        + '<script>Handlebars.templates["ba\\nr"] = Handlebars.compile("as\\"df");</script>'
        + BODY);
  });

  it('should generate a tab for each h2 section', function() {
    styleDoc('# The Doc\ncontent\n## test1\nfoo1\n## test2\n foo2\n').should.equal(
      TEMPLATE_PREFIX + '</head>'
        + '<body>'
        + '<nav><button data-tab="#section-1">test1</button><button data-tab="#section-2">test2</button></nav>'
        + '<h1>The Doc</h1>\n<p>content\n</p>\n'
        + '<section id="section-1">\n<h1>test1</h1>\n<p>foo1\n</p>\n</section>\n'
        + '<section id="section-2">\n<h1>test2</h1>\n<p> foo2\n</p>\n</section>\n'
        + '</body></html>');
  });
});

describe('live preview generator', function() {
  describe('html', function() {
    it('should create live preview for html content', function() {
      styleDoc('```html\n<div class="foo">Test</div>```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-html">&lt;div class=&quot;foo&quot;&gt;Test&lt;/div&gt;</code></pre>\n'
          + '<div class="style-doc-sample"><div class="foo">Test</div></div>');
    });
    it('should create live preview for htm content', function() {
      styleDoc('```htm\n<div class="foo">Test</div>```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-html">&lt;div class=&quot;foo&quot;&gt;Test&lt;/div&gt;</code></pre>\n'
          + '<div class="style-doc-sample"><div class="foo">Test</div></div>');
    });

    it('should highlight', function() {
      styleDoc('```html\n<div>Test</div>```', {template: false}).should.equal(
          '<pre><code class="lang-html"><span class="tag">&lt;<span class="title">div</span>&gt;</span>Test<span class="tag">&lt;/<span class="title">div</span>&gt;</span></code></pre>\n'
          + '<div class="style-doc-sample"><div>Test</div></div>');
    });
  });

  describe('handlebars', function() {
    it('should create rendering snippet for handlebars content', function() {
      styleDoc('```handlebars\n{{template "foo"}}\nbar```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-handlebars">{{template &quot;foo&quot;}}\nbar</code></pre>\n'
          + '<div id="handlebars-1" class="style-doc-sample"></div>\n'
          + '<script>document.getElementById("handlebars-1").innerHTML = Handlebars.compile("{{template \\"foo\\"}}\\nbar")(context || {});</script>');
    });
    it('should create unique ids for each handlebars entry', function() {
      styleDoc('```handlebars\n{{template "foo"}}```\n```handlebars\n{{template "bar"}}```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-handlebars">{{template &quot;foo&quot;}}</code></pre>\n'
          + '<div id="handlebars-1" class="style-doc-sample"></div>\n'
          + '<script>document.getElementById("handlebars-1").innerHTML = Handlebars.compile("{{template \\"foo\\"}}")(context || {});</script>'
          + '<pre><code class="lang-handlebars">{{template &quot;bar&quot;}}</code></pre>\n'
          + '<div id="handlebars-2" class="style-doc-sample"></div>\n'
          + '<script>document.getElementById("handlebars-2").innerHTML = Handlebars.compile("{{template \\"bar\\"}}")(context || {});</script>');
    });
    it('should return the handlebars templates referenced', function() {
      styleDoc.findTemplates('```handlebars\n{{template "foo"}}```\n```handlebars\n{{template "bar"}}```')
          .should.eql(['foo', 'bar']);
    });
  });

  describe('styles', function() {
    it('should include css output within the document', function() {
      styleDoc('```css\nfoo { bar: 1 }```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-css">foo { bar: 1 }</code></pre>\n'
          + '<style class="style-doc-sample">foo { bar: 1 }</style>');
    });

    it('should include stylus output within the document', function() {
      styleDoc('```stylus\nfoo\n  bar 1```', {highlight: false, template: ''}).should.equal(
          '<pre><code class="lang-stylus">foo\n  bar 1</code></pre>\n'
          + '<style class="style-doc-sample">foo {\n  bar: 1;\n}\n</style>');
    });
    it('should error on funky stylus', function() {
      (function() {
        styleDoc('```stylus\nfoo```', {highlight: false, template: ''});
      }).should.throw();
    });
  });

  describe('unknown code', function() {
    it('should ignore code blocks without a language type', function() {
      styleDoc('```\n{{template "foo"}}```', {highlight: false, template: ''}).should.equal(
          '<pre><code>{{template &quot;foo&quot;}}</code></pre>\n');
    });
  });
});
