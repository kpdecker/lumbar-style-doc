var assert = require('assert'),
    lib = require('../node_modules/lumbar/test/lib'),
    styleDoc = require('../lib/lumbar-style-doc');

describe('config', function() {
  it('should load markdown file from config',
    lib.runTest('test/artifacts/style-doc.json', 'test/expected/style-doc', {plugins: [styleDoc]}, '/**/*.{js,css,html}'));
});
