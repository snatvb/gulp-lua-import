/**
 * Created by snatvb on 17.01.17.
 */

// class LuaImport {
//   apply(compiler) {
//     console.log("The compiler is starting to compile...");
//   }
// }
// twklsdjf
module.exports = function (source) {
  console.log(source);
  this.callback(null, source);
};