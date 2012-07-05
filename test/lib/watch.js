var assert = require('assert'),
    fs = require('fs'),
    lib = require('../../node_modules/lumbar/test/lib'),
    lumbar = require('lumbar'),
    wrench = require('wrench');

exports.canWatch = function() {
  // Watch is unsupported on 0.4 and earlier
  return !!fs.watch;
};

exports.appendSpace = function(path) {
  setTimeout(function() {
    console.error('append:', path);
    var fd = fs.openSync(path, 'a');
    fs.writeSync(fd, ' ');
    fs.closeSync(fd);
  }, 500);
};

exports.runWatchTest = function(srcdir, config, operations, expectedFiles, options, done) {
  var title = this.title || config,
      testdir = lib.testDir(title, 'example'),
      outdir = lib.testDir(title, 'test'),
      seenFiles = [];
  if (this.title) {
    this.title += ' ' + outdir;
  }

  wrench.copyDirSyncRecursive(srcdir, testdir);

  function complete(err) {
    process.removeListener('uncaughtException', complete);
    done();
  }
  process.on('uncaughtException', complete);

  options.outdir = outdir;
  var arise = lumbar.init(testdir + '/' + config, options);
  arise.on('output', function(status) {
    var statusFile = status.fileName.substring(outdir.length);
    console.log('statusFile', statusFile);
    if (!expectedFiles.some(function(fileName) { return statusFile === fileName; })) {
      arise.unwatch();
      assert.fail(undefined, status.fileName,  'watchFile:' + statusFile + ': missing from expected list');
    } else {
      seenFiles.push(statusFile);
    }
    var seen = seenFiles.length;
    setTimeout(function() {
      operations[seen] && operations[seen](testdir);
    }, 0);
    if (seenFiles.length < expectedFiles.length) {
      return;
    }

    arise.unwatch();

    seenFiles = seenFiles.sort();
    expectedFiles = expectedFiles.sort();
    assert.deepEqual(seenFiles, expectedFiles, 'watchFile: seen file list matches');

    // Cleanup (Do cleanup here so the files remain for the failure case)
    wrench.rmdirSyncRecursive(testdir);
    wrench.rmdirSyncRecursive(outdir);

    complete();
  });

  var retCount = 0;
  arise.watch(undefined, function(err) {
    err = err || new Error('Callback called without fatal error');
    throw err;
  });
};
