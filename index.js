const loaderUtils = require('loader-utils');

const converter = require('./src/converter');

module.exports = function cssThemesLoader(source, map) {
  const options = Object.assign({}, {
    ignore: null,
    target: null,
  }, loaderUtils.getOptions(this));

  if (!options.ignore && !options.target) {
    this.callback(null, source, map);
  }

  const newText = converter({ text: source, target: options.target, ignore: options.ignore });

  this.callback(null, newText, map);
};
