/**
 * Created by snatvb on 17.01.17.
 */

const gulp = require('gulp');
const luaImport = require('./index');

gulp.task('default', function () {
  return gulp.src('./test/**/*.lua')
    .pipe(luaImport())
    .pipe(gulp.dest('./dist'))
});
