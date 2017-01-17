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

##  Использование
`local module = require('./_module_module')`
В *require* не имеет значения, будут одинарные или двойные ковычки. Файлы с имемем в начале *_module_* не попадут в *dist*, но будут в сборке. Собирается все как в стандартном языке *Lua*.

Пример такой сборки:

```sh
-- test/index.lua
local module = require('./_module_module')
local module2 = require('./_module_module2')

local test = "test str"
```
```sh
-- test/_module_module.lua
local ff = require('./_module_formodule');

local testModule = 'test 1 module file'
return testModule
```

Сборка(другие файлы смотрите в репозитории):
```sh
-- dist/index.lua
local module = (function()
    local ff = (function()
        local moduleformodule = 'this module for module 1'

        return moduleformodule
    end)();

    local testModule = 'test 1 module file'
    return testModule
end)()
local module2 = (function()
    local test2Module = 'test 2 module file'

    return test2Module
end)()

local test = "test str"
```
