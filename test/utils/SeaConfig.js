/**
 * @author lifesinger@gmail.com (Frank Wang)
 */

require('colors');

var path = require('path');
var assert = require('assert');

var SeaConfig = require('../../lib/utils/SeaConfig');


var DATA_DIR = path.resolve(__dirname, '../data/configs');
var testName = path.basename(__filename);
console.log(('test ' + testName).cyan);


// {{{
console.log('  test SeaConfig.parseAlias');

var alias;
alias = SeaConfig.parseAlias(getFile('seajs_config.js'));
assert.equal(alias['increment'], 'increment.js?t=20110530');
assert.equal(alias['lib'], './lib');
assert.equal(alias['underscore'], 'underscore/1.1.6/underscore');

alias = SeaConfig.parseAlias(getFile('seajs_config_2.js'));
assert.equal(alias['increment'], 'increment.js?t=20110530');
assert.equal(alias['lib'], './lib');
assert.equal(alias['underscore'], 'underscore/1.1.6/underscore');
// }}}


// {{{
console.log('  test SeaConfig.parseBase');

var base;
base = SeaConfig.parseBase(getFile('seajs_config.js'));
assert.equal(base, 'http://a.tbcdn.cn/libs');
// }}}


console.log((testName + ' is ').cyan + 'PASSED'.green);


// Helpers
function getFile(filename) {
  return DATA_DIR + '/' + filename;
}
