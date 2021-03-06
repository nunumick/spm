/**
 * @fileoverview spm install.
 * @author yyfrankyy@gmail.com (Frank Xu)
 */

var fs = require('fs');
var path = require('path');

var uglifyjs = require('uglify-js');
var jsp = uglifyjs.parser.parse;

var CONFIG = require('../config');
var MESSAGE = CONFIG.MESSAGE;
var ActionFactory = require('./ActionFactory');


var Install = ActionFactory.create('Install', function() {
  var config = {
    force: false,
    seajs: ['sea.js', 'sea-debug.js']
  };

  for (var i in config) {
    this.config[i] = config[i];
  }

  this.depth = 0;
  this.queried = {};
});


Install.prototype.AVAILABLE_OPTIONS = {
  force: {
    alias: ['-f', '--force']
  },
  seajs: {
    alias: ['-s', '--seajs'],
    length: 1
  },
  from: {
    alias: ['--from'],
    length: 1
  },
  min: {
    alias: ['-m', '--min']
  },
  debug: {
    alias: ['-d', '--debug']
  }
};


Install.prototype.run = function(opts, fromDeps) {
  var self = this,
      opts = opts || {},
      mods = opts.mods || [],
      config = opts.config || {},
      seajses = self.config.seajs,
      seajs = '',
      suffixes = [];

  if (config.from && config.from[0]) {
    var deps = getDeps(config.from[0]);
    deps.forEach(function(m) {
      if (mods.indexOf(m) === -1) {
        mods.push(m);
      }
    });
  }

  if (mods == []) {
    return;
  }

  for (var i in config) {
    this.config[i] = config[i];
  }

  if (config.seajs) {
    seajses = config.seajs;
  }

  for (var i = 0, l = seajses.length; i < l; i++) {
    if (!path.existsSync(seajses[i])) continue;
    seajs = seajses[i];
    break;
  }

  if (path.existsSync(seajs)) {
    seajs = fs.realpathSync(seajs).replace(/^(.*\/).*$/, '$1');
  } else {
    if (!self.config.force && mods.indexOf('seajs') === -1) {
      return;
    }
    seajs = fs.realpathSync('.');
  }

  util.readFromPath(CONFIG.REGISTRY, function(data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = [];
    }
    mods.forEach(function(mod) {

      if (mod in self.queried) return;
      self.queried[mod] = true;

      if (path.existsSync(mod) && !self.config.force) {
        console.log('%s exists, use "--force" to reinstall it.', mod);
        return;
      }

      //if (config.min) {
      //  suffixes = ['.js'];
      //} else if (config.debug) {
      //  suffixes = ['-debug.js'];
      //} else {
      suffixes = ['-debug.js', '.js'];
      //}

      if (mod in data) {
        //install(data[mod], seajs, suffixes);
        var meta = data[mod], target = seajs,
            name = meta.filename || meta.name, version = meta.version,
            remotefile = CONFIG.SPM_SERVER + path.join(meta.name, version, name);

        suffixes.forEach(function(suffix) {
          var remote = remotefile + suffix,
            //local = path.join(target, mod, version, mod + suffix);
              local = path.join(target, name + suffix);

          //util.mkdirSilent(path.join(target, mod));
          //util.mkdirSilent(path.join(target, mod, version));

          util.download(remote, local, function(e) {
            var depth = self.depth, depthChar = depth == 0 ? '' : '|-';
            while (deps--) {
              depthChar = ' ' + depthChar;
            }

            //console.log('Installed %s@%s at %s.', mod, version, local);
            console.log('%s%s(%s) at %s.',
                fromDeps ? fromDeps.cyan + ' -> ' : '',
                name.green,
                version.cyan,
                local.yellow);

            if (suffix === '-debug.js') {
              var deps = getDeps(local);
              if (deps.length == 0) return;
              self.depth++;

              self.run({
                config: config,
                mods: deps
              }, mod);
            }
          });
        });
      } else {
        console.log('%s not found in registry (%s).'.blue, CONFIG.REGISTRY);
      }

    });
  });
};


function getDeps(file) {
  var source = fs.readFileSync(fs.realpathSync(file)).toString();
  var deps = extract.getAstDependencies(jsp(source));
  return deps;
}


module.exports = Install;
