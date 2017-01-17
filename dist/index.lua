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