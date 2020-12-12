var path = require('path');
var fs = require('fs');
var Filter = require('broccoli-filter');
var AssetRevFingerprint = require('broccoli-asset-rev/lib/fingerprint');

function Fingerprint(inputNode, options) {
  if (!(this instanceof Fingerprint)) {
    return new Fingerprint(inputNode, options);
  }

  AssetRevFingerprint.call(this, inputNode, options);
  this.hashMap = {};
  this.digestAlgorithm = options.digestAlgorithm;
}

Fingerprint.prototype = Object.create(AssetRevFingerprint.prototype);
Fingerprint.prototype.constructor = AssetRevFingerprint;

Fingerprint.prototype.processFile = function (srcDir, destDir, relativePath) {
  var self = this;
  return AssetRevFingerprint.prototype.processFile.apply(this, arguments).then(function() {
    var hash = self.hashMap[relativePath];
    if (hash) {
      var hashFile = path.join(destDir, relativePath + '.' + self.digestAlgorithm);
      fs.writeFileSync(hashFile, hash);
    }
  });
};

Fingerprint.prototype.getDestFilePath = function (relativePath) {
  var destFilePath = Filter.prototype.getDestFilePath.apply(this, arguments);
  if (!destFilePath) {
    return null;
  }

  if (this.assetMap[relativePath]) {
    return this.assetMap[relativePath];
  }
  if (this.customHash === null) {
    return this.assetMap[relativePath] = destFilePath;
  }

  var tmpPath = path.join(this.inputPaths[0], relativePath);
  var file = fs.readFileSync(tmpPath, {encoding: null});
  var hash;

  if (this.customHash) {
    hash = this.customHash;
  } else {
    hash = this.hashFn(file, tmpPath);
  }

  var newPath = path.join(path.dirname(relativePath), hash + '-' + path.basename(relativePath));
  this.assetMap[relativePath] = newPath;
  this.hashMap[relativePath] = hash;
  return newPath;
};

module.exports = Fingerprint;