# gulp-lua-import
Конфигурационный файл для сборки:
```sh
const gulp = require('gulp');
const luaImport = require('./index');

gulp.task('default', function () {
  return gulp.src('./test/**/*.lua')
    .pipe(luaImport())
    .pipe(gulp.dest('./dist'))
});
```
Где `./test/**/*.lua` - папка с вашими *lua* файлами, а `./dist` - где будут храниться ваши собранные файлы
