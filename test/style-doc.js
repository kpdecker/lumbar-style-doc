var styleDoc = require('../lib/style-doc'),
    should = require('should');

describe('live preview generator', function() {
  describe('html', function() {
    it('should create live preview for html content', function() {
      styleDoc('```html\n<div class="foo">Test</div>```').should.equal(
          '<pre><code class="lang-html">&lt;div class=&quot;foo&quot;&gt;Test&lt;/div&gt;</code></pre>\n'
          + '<div class="style-doc-sample"><div class="foo">Test</div></div>');
    });
  });

  describe('unknown code', function() {
    it('should ignore code blocks without a language type', function() {
      styleDoc('```\n{{template "foo"}}```').should.equal(
          '<pre><code>{{template &quot;foo&quot;}}</code></pre>\n');
    });
  });
});
