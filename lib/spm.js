/**
 * @fileoverview SeaJS Package Manager.
 * @author lifesinger@gmail.com (Frank Wang), yyfrankyy@gmail.com (Frank Xu)
 */

require('colors');

var CONFIG = require('./config');
var StringUtil = require('./utils/String');


var spm = {};


// prepare available actions
CONFIG.AVAILABLE_ACTIONS.forEach(function(actionName) {
  actionName = StringUtil.capitalize(actionName);
  spm[actionName] = require('./actions/' + actionName);
});


module.exports = spm;

// run directly
if (require.main === module) {
  var args = process.argv;
  var Action = spm['Help'];

  var actionName = StringUtil.capitalize(args[2]);
  if (spm[actionName]) {
    Action = spm[actionName];
  }

  new Action(args.slice(3)).run({ console: true });
}
