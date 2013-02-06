var Handlebars = require('handlebars'),
    lib = require('../node_modules/lumbar/test/lib'),
    styleDoc = require('../lib/lumbar-style-doc'),
    watch = require('./lib/watch');

styleDoc = styleDoc({});

// Disable this until we can easily handle changing content in the handlebars file
describe.skip('config', function() {
  var precompile = Handlebars.precompile;

  before(function() {
    Handlebars.precompile = function() {
      return 'precompiled!';
    };
  });
  after(function() {
    Handlebars.precompile = precompile;
  });

  it('should load markdown file from config',
    lib.runTest('test/artifacts/style-doc.json', 'test/expected/style-doc', {plugins: [styleDoc]}, '/**/*.{js,css,html}'));
});

describe('watch', function() {
  if (!watch.canWatch()) {
    return;
  }

  it('should rebuild on input changes', function(done) {
    this.timeout(10000);

    var expectedFiles = [
            '/bacon/base.css', '/bacon/base.js', '/bacon/items.css', '/bacon/style-doc.html',
                '/ribs/base.css', '/ribs/base.js', '/ribs/items.css', '/ribs/style-doc.html',
            '/bacon/base.css', '/bacon/base.js', '/bacon/items.css', '/bacon/style-doc.html',
                '/ribs/base.css', '/ribs/base.js', '/ribs/items.css', '/ribs/style-doc.html',
            '/bacon/style-doc.html', '/ribs/style-doc.html',
            '/bacon/style-doc.html', '/ribs/style-doc.html'
          ],
        operations = {
          8: function(testdir) {
            // Modify the config file
            watch.appendSpace(testdir + '/style-doc.json');
          },
          16: function(testdir) {
            // Modify the bridge file
            watch.appendSpace(testdir + '/style-doc.md');
          },
          18: function(testdir) {
            // Modify the home template
            watch.appendSpace(testdir + '/template.handlebars');
          }
        };

    this.title = 'watch';
    watch.runWatchTest.call(this,
      'test/artifacts', 'style-doc.json',
      operations, expectedFiles, {plugins: [styleDoc]},
      done);
  });
});
