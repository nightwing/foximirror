

function stripComments(str){
    if(str.slice(0,2)=='/*'){
        var j = str.indexOf('*/')+2
        str = str.substr(j)
    }
    return str
}
function textModuleDefine(str){
    str = str.replace('\n','\\\n', 'g').replace('"','\\"', 'g')
    str='define("'+str+'");'
    return str
}
function getPath(rel, abs){
    var p1 = rel.split("/")
    var p2 = abs.split("/")
    var p =[]
    if (p1[0] == "."){
        p1.shift()
        p2.pop()
    }else if (p1[0] == ".."){
        p1.shift()
        p2.pop()
        p2.pop()
    }else{
        p2=[]
    }
    var p = Array.concat(p2, p1)
    return p.join("/")
}

function getDeps(str,name){
    var m = str.match(/^.*?require\(\"[^"]+"\)/gm)
    if (!m)
        return []
     
    m1 = []
    for each(var r in m){
        if(!/\s*\/\//.test(r))
            m1.push(r)
    }
    return m1.map(function(r){        
        r=r.slice(r.indexOf("(")+2, -2)
        r = getPath(r, name)
        return r
    })
}

var modules = {}, deps = {}, pending = [], loaded = {}, pluginStr = "ace/requirejs/text!"
function stripPluginStr(name){
	if (name.substring(0, pluginStr.length) == pluginStr)
		name = name.substr(pluginStr.length)
	return name
}

function makeExplicitDefine(name){
    var str = stripComments(modules[name]||"")
	
	var depStr = deps[name] ? ' ["' + deps[name].join('","') + ']' : '[]'
	var depStr = '[]'
	str = str.replace(/require\(\"[^"]+"\)/gm, function(r){
        var i = r.indexOf("(")
        var rel=r.slice(i+2, -2)
        rel = stripPluginStr(rel)
        var abs = getPath(rel, name)
        return r.slice(0, i+2)+abs+r.slice(-2)
    })
	return str.replace('define(', 'define("'+name + '",'+ depStr + ', ')
}

function processModule(name, text){
	var moduleName = stripPluginStr(name)
	if (moduleName != name) {
        var type = "text"
	}
	
	if (type == "text"){
		text = textModuleDefine(text)
		moduleDeps = []
	}else{
		var moduleDeps = getDeps(text, name)
		deps[moduleName] = moduleDeps.map(stripPluginStr)
	}
	modules[moduleName] = text


	loaded[name] = true
	var i = pending.indexOf(name)
	if (i != -1) {
		pending.splice(i, 1)
	}
	moduleDeps.forEach(function(x){
		if(!loaded[x] && pending.indexOf(x)==-1)
			pending.push(x)
	})
	if (pending.length)
		req()
	else
		finishReq()
}

function req() {
    var name = pending[0]
	var url = pluginStr + stripPluginStr(name)	
	
    try {
        processModule(name, require(url))
    }catch(e){
        require([url], function(x) {
			processModule(name, x);
		})
    }
    
}

function finishReq(){
    var str = ""
    for (var mn in modules){
        str+=makeExplicitDefine(mn)
    }
    env.editor.session.setValue(str)
}

pending = ["ace/lib/fixoldbrowsers", "ace/editor", "ace/virtual_renderer", "ace/undomanager", "ace/theme/textmate"]
req()

#>>

deps["ace/virtual_renderer"]
getDeps(modules["ace/virtual_renderer"],"***")
#>>

require(pluginStr+"ace/virtual_renderer")
#>>

env.editor.commands.addCommand
#>>


startAce()
#>>

editor.renderer.$textLayer.element.textContent