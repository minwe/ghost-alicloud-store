const unidecode = require('unidecode');

exports.safeString = function safeString(string, options) {
  options = options || {};

  if (string === null) {
    string = '';
  }

  // Handle the £ symbol separately, since it needs to be removed before the unicode conversion.
  string = string.replace(/£/g, '-');

  // Remove non ascii characters
  string = unidecode(string);

  // Replace URL reserved chars: `@:/?#[]!$&()*+,;=` as well as `\%<>|^~£"{}` and \`
  string = string.replace(/(\s|\.|@|:|\/|\?|#|\[|\]|!|\$|&|\(|\)|\*|\+|,|;|=|\\|%|<|>|\||\^|~|"|\{|\}|`|–|—)/g, '-')
  // Remove apostrophes
    .replace(/'/g, '')
    // Make the whole thing lowercase
    .toLowerCase();

  // Handle whitespace at the beginning or end.
  string = string.trim();

  return string;
};

const logPrefix = '[AliCloudStorage]';

exports.log = function log() {
  const args = Array.from(arguments);

  args.unshift(logPrefix);

  console.log.apply(console, args)
};

exports.isOk = function isOk(result) {
  return result && result.res && result.res.status === 200;
};
