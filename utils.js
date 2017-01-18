/**
 * Created by snatvb on 19.01.17.
 */

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

module.exports = utils;