/**
 * Created by snatvb on 17.01.17.
 */
'use strict';

const through = require('through2')
  , rs = require('replacestream')
  , gutil = require('gulp-util')
  , fs = require('fs');


let options = {
  pathDivider: '/',
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
  },
  getFileDir: function (filePath) {
    if(!Array.isArray(filePath)) {
      filePath = filePath.split(options.pathDivider);
    }
    return (filePath.slice(0, filePath.length - 1)).join(options.pathDivider);
  }
};

function replacement (fileContent, baseFileDir) {
  const pattern = /require\((.+)\)/ig;
  let matches;
  while ((matches = pattern.exec(fileContent)) !== null) {
    const fileName = utils.getFileNameRequire(matches[0]);
    const filePath = baseFileDir + options.pathDivider + fileName;
    const moduleContent = loadFile(filePath);
    fileContent = fileContent.replace(matches[0], utils.getModuleContent(moduleContent));
    if(options.log) {
      console.log('ModuleLoaded: ' + filePath + ' -> ' + baseFileDir);
    }
  }
  return fileContent;
}

function loadFile (filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return replacement(fileContent, utils.getFileDir(filePath))
}


//noinspection JSUnresolvedVariable
module.exports = function (userOptions) {
  options = Object.assign(options, userOptions);
  return through.obj(function (file, enc, callback) {
    if (file.isStream()) {
      file.contents = file.contents.pipe(rs(search, replacement));
      return callback(null, file);
    }

    const filePath = file.path.split(options.pathDivider);
    const fileName = filePath[filePath.length - 1];
    const fileDir = utils.getFileDir(filePath);

    if(utils.isModule(fileName)) {
      return callback();
    }
    if (file.isBuffer()) {
      try {
        const content = replacement(String(file.contents), fileDir);
        file.contents = new Buffer(content);
      } catch (e) {
        return callback(new gutil.PluginError('gulp-lua-import', e));
      }
    }

    return callback(null, file);
  });
};