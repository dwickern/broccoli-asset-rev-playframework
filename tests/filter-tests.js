var fs       = require('fs');
var path     = require('path');
var crypto   = require('crypto');
var assert   = require('assert');
var walkSync = require('walk-sync');
var broccoli = require('broccoli');
var MergeTrees = require('broccoli-merge-trees');
var AssetRev = require('../lib/asset-rev');
var sinon    = require('sinon');
var builder;

function md5Hash(buf) {
  var md5 = crypto.createHash('md5');
  md5.update(buf);
  return md5.digest('hex');
}
function sha1Hash(buf) {
  var sha1 = crypto.createHash('sha1');
  sha1.update(buf);
  return sha1.digest('hex');
}

function confirmOutput(actualPath, expectedPath, hashFn) {
  var actualFiles = walkSync(actualPath);
  var expectedFiles = walkSync(expectedPath);
  hashFn = hashFn || md5Hash;

  assert.deepEqual(actualFiles, expectedFiles, 'files output should be the same as those input');

  expectedFiles.forEach(function(relativePath) {
    if (relativePath.slice(-1) === '/') { return; }

    var actual   = fs.readFileSync(path.join(actualPath, relativePath), { encoding: null });
    var expected = fs.readFileSync(path.join(expectedPath, relativePath), { encoding: null });

    assert(0 === actual.compare(expected), relativePath + ': does not match expected output');

    var m = relativePath.match(/-([0-9a-f]+)\./i);
    if (m) {
      assert.equal(m[1], hashFn(actual), relativePath + ': file hash does not match fingerprint');
    }
  });
}

function confirmPathPresent(list, pattern) {
  return list.some(function(item) {
    return item.search(pattern) !== -1;
  });
}

describe('broccoli-asset-rev-playframework', function() {
  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('revs the assets and rewrites the source', function(){
    var sourcePath = 'tests/fixtures/basic';

    var node = AssetRev(sourcePath + '/input', {
      extensions: ['js', 'json', 'css', 'png', 'jpg', 'gif', 'map'],
      replaceExtensions: ['html', 'js', 'css']
    });

    builder = new broccoli.Builder(node);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });
});
