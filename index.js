/**
 * Created by snatvb on 17.01.17.
 */
'use strict';

const through = require('through2')
  , rs = require('replacestream')
  , gutil = require('gulp-util')
  , path = require('path')
  , fs = require('fs');

function logModuleLoaded(filePath, baseFileDir) {
  if (options.log === false) {
    return;
  }
  gutil.log('ModuleLoaded: ' + gutil.colors.cyan(filePath) + ' -> ' + gutil.colors.cyan(baseFileDir));
}

let options = {
  log: true,
  ignoreFolders: []
};

const utils = {
  isModule: function (fileName) {
    return fileName.substr(0, 8) === '_module_';
  },
  getFileNameRequire: function (match) {
    let fileName = match.replace(/require\(("|')/ig, '');
    fileName = fileName.replace(/("|')\)/gi, '');
    if (fileName.substr(fileName.length - 4, fileName.length) !== '.lua') {
      fileName += '.lua';
    }
    return fileName;
  },
  getModuleContent: function (moduleContent) {
    return '(function () \n' + moduleContent + '\n end)()';
  },
  haveIgnoreFolder: function (parseFolder, ignoreArray) {
    console.log(ignoreArray);
    for (let i = 0; i < ignoreArray.length; i++) {
      const ignoreFolder = ignoreArray[ i ];
      for (let j = 0; j < parseFolder.length; j++) {
        const folder = parseFolder[ j ];
        if (folder === ignoreFolder) {
          return true;
        }
      }
    }
    return false;
  }
};

function replacement(fileContent, baseFileDir, baseFileName) {
  const pattern = /require\((.+)\)/ig;
  let matches;
  while ((matches = pattern.exec(fileContent)) !== null) {
    const fileName = utils.getFileNameRequire(matches[ 0 ]);
    const filePath = path.join(baseFileDir, fileName);
    const moduleContent = loadFile(filePath);
    fileContent = fileContent.replace(matches[ 0 ], utils.getModuleContent(moduleContent));
    logModuleLoaded(filePath, path.join(baseFileDir, baseFileName));
  }
  return fileContent;
}

function loadFile(filePath) {
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

    if (utils.isModule(fileName)
      || utils.haveIgnoreFolder(file.path.split(path.sep), options.ignoreFolders)) {
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