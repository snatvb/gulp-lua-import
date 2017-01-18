/**
 * Created by snatvb on 17.01.17.
 */
'use strict';

const through = require('through2')
  , rs = require('replacestream')
  , gutil = require('gulp-util')
  , path = require('path')
  , fs = require('fs');

var logModuleLoaded = function (filePath, baseFileDir) {
  if(options.log === false) {
    return;
  }
  gutil.log('ModuleLoaded: ' + gutil.colors.cyan(filePath) + ' -> ' + gutil.colors.cyan(baseFileDir));
};

let options = {
  log: true
};

const utils = {
  isModule: function (fileName) {
    return fileName.substr(0,8) === '_module_';
  },
  getFileNameRequire: function (match) {
    let fileName = match.replace(/require\(("|')/ig, '');
    fileName = fileName.replace(/("|')\)/gi, '');
    if(fileName.substr(fileName.length-4,fileName.length) !== '.lua') {
      fileName += '.lua';
    }
    return fileName;
  },
  getModuleContent: function (moduleContent) {
    return '(function () \n' + moduleContent + '\n end)()';
  }
};

function replacement (fileContent, baseFileDir, baseFileName) {
  const pattern = /require\((.+)\)/ig;
  let matches;
  while ((matches = pattern.exec(fileContent)) !== null) {
    const fileName = utils.getFileNameRequire(matches[0]);
    const filePath = path.join(baseFileDir, fileName);
    const moduleContent = loadFile(filePath);
    fileContent = fileContent.replace(matches[0], utils.getModuleContent(moduleContent));
    logModuleLoaded(filePath, path.join(baseFileDir, baseFileName));
  }
  return fileContent;
}

function loadFile (filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return replacement(fileContent, path.parse(filePath).dir, path.parse(filePath).base)
}


//noinspection JSUnresolvedVariable
module.exports = function (userOptions) {
  options = Object.assign(options, userOptions);
  return through.obj(function (file, enc, callback) {
    if (file.isStream()) {
      file.contents = file.contents.pipe(rs(search, replacement));
      return callback(null, file);
    }
    const parseFile = path.parse(file.path);
    const fileName = parseFile.base;
    const fileDir = parseFile.dir;

    if(utils.isModule(fileName)) {
      return callback();
    }
    if (file.isBuffer()) {
      try {
        const content = replacement(String(file.contents), fileDir, fileName);
        file.contents = new Buffer(content);
      } catch (e) {
        return callback(new gutil.PluginError('gulp-lua-import', e));
      }
    }

    return callback(null, file);
  });
};