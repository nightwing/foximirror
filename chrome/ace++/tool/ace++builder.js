var moduleList = 
['pilot/fixoldbrowsers'
,'pilot/es5-shim'
,'pilot/index'
,'pilot/types/basic'
,'pilot/types'
,'pilot/types/command'
,'pilot/canon'
,'pilot/useragent'
,'pilot/oop'
,'pilot/keys'
,'pilot/event_emitter'
,'pilot/typecheck'
,'pilot/lang'
,'pilot/types/settings'
,'pilot/settings'
,'pilot/commands/settings'
,'pilot/dom'
,'pilot/event'
,'ace/editor'
,'ace/keyboard/textinput'
,'ace/mouse/mouse_handler'
,'ace/mouse/default_handlers'
,'ace/mouse/mouse_event'
,'ace/keyboard/keybinding'
,'ace/commands/default_commands'
,'ace/edit_session'
,'ace/selection'
,'ace/range'
,'ace/mode/text'
,'ace/tokenizer'
,'ace/mode/text_highlight_rules'
,'ace/mode/behaviour'
,'ace/unicode'
,'ace/document'
,'ace/anchor'
,'ace/background_tokenizer'
,'ace/edit_session/folding'
,'ace/edit_session/fold_line'
,'ace/edit_session/fold'
,'ace/search'
,'ace/undomanager'
,'ace/virtual_renderer'
,'ace/layer/marker'
,'ace/layer/text'
,'ace/layer/cursor'
,'ace/renderloop'
,'pilot/environment'
,'ace/theme/textmate'
,"text!ace/css/editor.css"
]


var aceRoot = 'file:///C:/Users/LED/Desktop/00/ace/'
var PATHS = {'ace/':'lib/ace/', 'pilot/':'support/pilot/lib/pilot/', 'build/': "build/src/"}

function transformPath(path) {
    for (var sub in PATHS){
        if(path.indexOf(sub) === 0) {
			return aceRoot + PATHS[sub] + path.substr(sub.length);
        }
    }
    return aceRoot + path
}
req = function(path){
    var x = path
    if(x.substring(0,5)=="text!"){
        x=x.substr(5)
        var mod = 'text'
    }
    x = transformPath(x)
    if(x.lastIndexOf(".")==-1)
        x = x+'.js'
    var str = makeReq(x)
    if(str.slice(0,2)=='/*'){
        var j = str.indexOf('*/')+2
        str = str.substr(j)
    }
    str = str.replace('\r','', 'g')
    if(mod == 'text'){
        str = str.replace('\n','\\\n', 'g').replace('"','\\"', 'g')
        str='define("'+str+'");'
    }
    
    return str
} 
//getLocalFile(aceRoot+"build/src/").reveal()

var mods = req("build/ace-uncompressed").match(/define\(.*]/g)

var deps = {}
mods.map(function(x){
    return deps[x.match(/['"]([^'"]*)['"]/)[1]]= x.match(/\[(.*)\]/)[1]
})
deps
var str = ''
for each(x in moduleList){
    str+=req(x).replace('define(', 'define(\''+x + '\', [' + (deps[x]||'') + '], ')
}
str