/**
 * Created by snatvb on 19.01.17.
 */

const utils = {
  isModule: function (fileName) {
    return fileName.substr(0, 8) === '_module_';
  },
  getFileNameRequire: function (match) {
    let fileName = match.replace(/require/ig, '');
    fileName = fileName.replace(/[()"']/gi, '');
    if (fileName.substr(fileName.length - 4, fileName.length) !== '.lua') {
      fileName += '.lua';
    }
    return fileName;
  },
  getVariable: function (match, fileName) {
    const pattern = /(.)*=(.)*?r/ig;
    if(pattern.test(match)) {
      const vname = /(.)*=/i.exec(match);
      if(vname !== null) {
        return `${vname[0]} `;
      }
    }
    let variable = fileName.replace(/\//gim, '');
    variable = variable.replace(/[^-0-9a-z_]/gim, '');
    return 'local __' + variable + '__ = '
  },
  getModuleContent: function (moduleContent, fileName, match) {
    const exception = this.getException(match);
    const variable = this.getVariable(match, fileName);
    if (exception !== false) {
      return variable + '(function () \n'
        + 'local __RESULT__\n'
        + 'local __testPcall__ = function () \n'
        + moduleContent
        + '\n end\n'
        + 'local __PCAL__, __RESULT__ = pcall(__testPcall__)\n'
        + 'if not __PCAL__ then\n'
        + exception + '("ERROR: '+ fileName +' have critical wrongs")\n'
        + 'end\n'
        + 'return __RESULT__\n'
        + '\n end)()';
    }
    return variable + '(function () \n' + moduleContent + '\n end)()';
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
  },

  /**
   * Ищем обработчик исключений
   * @param {String} match
   * @returns {String | boolean}
   */
  getException: function (match) {
    const exceptionPattern = /\)\((.)+\)$/i;
    let result = exceptionPattern.exec(match);
    if (result === null) {
      return false;
    }
    result = result[ 0 ].replace(/[()"']/gi, '');
    return result;
  }
};

module.exports = utils;
