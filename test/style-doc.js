var styleDoc = require('../lib/style-doc'),
    should = require('should');

describe('live preview generator', function() {
  describe('unknown code', function() {
    it('should ignore code blocks without a language type', function() {
      styleDoc('```\n{{template "foo"}}```').should.equal(
          '<pre><code>{{template &quot;foo&quot;}}</code></pre>\n');
    });
  });
});
