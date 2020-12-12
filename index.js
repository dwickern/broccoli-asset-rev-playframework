var path = require('path');
var AssetRev = require('broccoli-asset-rev/index');

module.exports = {
  name: require('./package').name,
  initializeOptions: function() {
    AssetRev.initializeOptions.call(this);
  },
  postprocessTree: function (type, tree) {
    if (type === 'all' && this.options.enabled) {
      tree = require('./lib/asset-rev')(tree, this.options);
    }

    return tree;
  },
  included: function (app) {
    this.app = app;
    this.initializeOptions();
  },
  treeFor: function() {},

  // ember-cli-fastboot uses the presence of this flag to give a
  // helpful error if you're using an older version of this addon that
  // doesn't know how to rewrite the fastboot manifest.
  supportsFastboot: true
};
