var broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');

var defaults = Object.create(broccoliAssetRevDefaults);
defaults.digestAlgorithm = 'md5';
module.exports = defaults;
