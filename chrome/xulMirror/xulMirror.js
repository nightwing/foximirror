//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

//Form elements
var codebox = null;


function doOnload(){
	wrap = $("wrap")
	gBrowser = $("content")
	content = gBrowser.contentWindow
	
	// sadia must inspect content
	shadia.defWindow = gBrowser

	Firebug.Ace.initialize({
		win2: {id:"code", starter:FBL.bind(xulMirror.initialize, xulMirror)}
	})

}

function doOnUnload(){
	Firebug.Ace.shutdown()
	xulMirror.shutdown()
}

toggleOrient = function(){
	var or = wrap.style.MozBoxOrient=='horizontal'?'vertical':'horizontal'
	wrap.style.MozBoxOrient=or
	wrap.children[1].setAttribute("orient",or)
	wrap.children[1].firstChild.removeAttribute("height")
	wrap.children[1].firstChild.removeAttribute("width")
}


/**======================-==-======================*/

var codeCache = {}, sessions = {}, Templates = {}, gTemplate, gTemplateName
var contentTypes = {
	getContextMenuItems: function(_, target){
		var id = target.id
		var selectedContentType = 'text/html'
		
	}
}

xulMirrorDataSource = function(a, query, ext, editGlue){
	var name = a+"."+ext
	if(codeCache[name])
		return codeCache[name]
	var t = templateList.currentTemplate
	if(name in t.sessions)
		return codeCache[name] = t.sessions[name] + ""
	
	if(a in t.shortNameMap){
		name = t.shortNameMap[a]
		return codeCache[name]||(codeCache[name] = t.sessions[name] + "")
	}
}

xulMirror = {
	initialize: function(aceWindow) {
		codebox = Firebug.Ace.win2.editor
		
		codebox.addCommands({
			execute: updatePreview
		})

		templateList.init()
		
		//loadTemplate(gTemplateName)
	
		// make sure editGlue is initialized
		$shadia.editGlue.setDataSource("xulMirror", xulMirrorDataSource)

		//tabSelect('main')
		updatePreview()
		codebox.focus()		
	},
	//* * * * * * * * * * * * * * * * * * * * * * * * *

	shutdown: function() {
		$shadia.editGlue.removeDataSource("xulMirror")
		if(currentTemplateChanged() && gTemplateName[gTemplateName.length-1]!='\u2217')
			gTemplateName += 
		
		saveTemplates()
	},

};
//-----------------------------------------------------------------------------
updatePreview_inBrowser = function(){
	content.location = 'edit:@xulMirror`'+templateList.currentTemplate.defaultName
}
var dWin
updatePreview_detached = function(){
	if(!dWin || dWin.closed){
		dWin = $shadia.openWindow('edit:@xulMirror`'+templateList.currentTemplate.defaultName)
	}else
		dWin.location = 'edit:@xulMirror`'+templateList.currentTemplate.defaultName
}
updatePreview = updatePreview_inBrowser
toggleDetach = function(button){
	if(updatePreview == updatePreview_inBrowser){
		updatePreview = updatePreview_detached
		button.label = 'undetach'
		$("split").setAttribute("state", "collapsed")
		//$("codebox").appendChild(button.parentNode)
	}else{
		$("split").setAttribute("state", "")
		updatePreview = updatePreview_inBrowser
		button.label = 'detach'
		dWin.close()
		//$("contentbox").appendChild(button.parentNode)
	}
	updatePreview()
}
//-----------------------------------------------------------------------------
var changeTimeout = null, tabChangeTimeout = null, gSessionId = null, gAutoUpdate = true
onChange = function(){
	if(gSessionId == "overview"){
		codeCache = {}
		clearTimeout(tabChangeTimeout)
		tabChangeTimeout = setTimeout(function(){
			templateList.currentTemplate.updateSessions()
			templateList.updateTabs()
		}, 10, null)		
	}else
		codeCache[gSessionId] = ''
	
	if(!gAutoUpdate)
		return
	clearTimeout(changeTimeout)
	changeTimeout = setTimeout(updatePreview, 700, null)	
}


function Template(txt){
	txt = txt||'emptyTemplete\n!@!===main.xul {\n\n\n}\n!@!===binding.xml {\n\n\n}\n!@!===overlay.xml {\n\n\n}\n'
	var im = txt.split("\n!>>===================>*-*<====================<<!")
	if(im[1])
		txt = im[0]
	var i = txt.indexOf("\n")
	this.name = txt.substring(0, i).trim()
	this.updateSessions(txt)
	this.fullCode = im[1] || this.toLongString()
	this.__defineGetter__("overviewSession", this.createOverviewSession)
}
Template.prototype = {
	//Object.defineProperty(this, "overviewSession", {value:s, configurable:true,enumerable:true})
	createOverviewSession: function(){
		delete this.overviewSession
		var s = Firebug.Ace.win2.createSession(this.toLongString(), "overview.js")
		s.on("change", onChange)
		return this.overviewSession = s
	},	
	sessions: {},
	fullCode: "",
	defaultName: "",
	//sessionNames: [],
	shortNameMap: null,
	updateSessions: function(txt){
		if(!txt)
			txt = this.overviewSession.getValue()

		var oldSessions = this.sessions || {}
		this.shortNameMap = {}
		this.sessions = {}
		var a = txt.split(/!@!===/)
		this.defaultName = ""
		
		for(var i = 1; i < a.length; i++){
			var s = a[i]
			if(!s)
				continue;
			var i1 = s.indexOf('{')
			var i2 = s.lastIndexOf('}')
			
			var body = s.substring(i1 + 1, i2).trim()
			var name = s.substring(0, i1).trim()
			
			if(!name)
				continue
			var i1 = name.lastIndexOf(".")
			var shortName = i1 < 0 ? name : name.substring(0, i1)
			this.shortNameMap[shortName] = name

			if(!this.defaultName)
				this.defaultName = name
			
			var	os = oldSessions[name]
			if(typeof os == "object"){
				if(os.getValue() != body)
					os.doc.setValue(body)
				this.sessions[name] = os
			}else
				this.sessions[name] = body
		}
		if(!this.sessionName || !this.sessions[this.sessionName])
			this.sessionName = this.defaultName
	},
	updateOverview: function(){
		var txt = this.toLongString()
		if(txt!=this.overviewSession.getValue())
			this.overviewSession.doc.setValue(txt)
	},
	addSession: function(){
		
	},
	getSession: function(name){
		if(typeof this.sessions[name] == 'string'){
			this.sessions[name] = Firebug.Ace.win2.createSession(this.sessions[name], name)
			this.sessions[name].on("change", onChange)
		}
		return this.sessions[name]
	},
	displayName: function(){
		
	},
	isModified: function(){
		return this.toLongString() != this.fullCode
	},
	toLongString: function(nameModifier){
		var str = "!>>!\t" + this.name + (nameModifier||'') + "\n"
		for(var s in this.sessions){
			str += "!@!=== " + s + "{\n\n" +
				this.sessions[s]
				+ "\n\n\n}\n"
		}
		return str
	},
	toSaveString: function(){
		return "\n!>>===================>*-*<====================<<!" +this.fullCode
	}
}

templateList = {
	init: function(){
		this.tabList = $("tablist")
		
		var href = location.href
		href = href.slice(0, href.lastIndexOf('/') + 1) + "templates.json"
		var txt = makeReq(href)
		
		var a = txt.split(/^!>>!/m)
		for(var i = 1; i < a.length; i++){
			var s = a[i]
			if(s){
				var t = new Template(s)
				this._defaultList[t.name] = t
			}
		}
		gTemplateName = "template1"
		
		var file = Firebug.Ace.getUserFile("foxiMirror")
		file.append("xulMirrorTemplate.json")
		var txt = file.exists()?readEntireFile(file):""
		
		if(txt){
			gTemplateName = txt.substring(0, txt.indexOf("\n")).trim()
			var a = txt.split(/^!>>!/m)
			for(var i = 1; i < a.length; i++){
				var s = a[i]
				if(s){
					var t = new Template(s)
					this._userList[t.name] = t
				}
			}
		}
		
		this.set(gTemplateName)
	},
	_defaultList: {},
	_userList: {},
	updateTabs: function(){
		var t = this.currentTemplate
		var ch = this.tabList.children
		
		var i = 1
		for(var s in t.sessions){
			var tab = ch[i] || this.tabList.appendChild(document.createElement("tab"))
			i++
			if(tab.name == s)
				continue

			tab.name = s
			tab.setAttribute("id", s)
			tab.setAttribute("label", s)
		}
		for(var j = ch.length-1; j >= i; j--){
			this.tabList.removeChild(ch[j])
		}
	},
	set: function(name){
		gTemplateName = name
		codeCache = {}
		
		this.currentTemplate = this._defaultList[name]
			||this._userList[name] || new Template("", "")
		
		var name = this.currentTemplate.sessionName
		
		this.updateTabs()
		this.tabList.selectedItem = this.tabList.querySelector("#" + name.replace(".","\\."))
		this.selectTab(name)
	},
	selectTab: function(name){
		if(!name)
			name = "overview"

		if(name == "overview"){
			this.currentTemplate.updateOverview()
			codebox.setSession(this.currentTemplate.overviewSession)			
		}else{
			if(gSessionId == "overview"){
				this.currentTemplate.updateSessions()
				//this.updateTabs()
			}
			codebox.setSession(this.currentTemplate.getSession(name))
		}
		this.currentTemplate.sessionName = name
		
		gSessionId = name
	},
	changed: false
}
	


currentTemplateChanged = function(){
	var t = Templates[gTemplateName]
	if(!t)
		return true
	
	for(var i in sessions){
		if(t[i] != sessions[i].getValue())
			return true		
	}
	return false
}

loadTemplate =  function(name){
	gTemplate = Templates[name]
	gTemplateName = name
	
	winTitle.update(name)
	for(var i in sessions){
		codeCache[i] = gTemplate[i] || ""
		sessions[i].setValue(codeCache[i])
		winTitle.track(sessions[i])
	}
}
saveTemplates = function(){
	var str = gTemplateName + "\n"
	for each(var t in templateList._defaultList){
		if(t.isModified())
			str += t.toLongString('-edited')		
	}
	dump(str)
	for each(var t in templateList._userList){		
		str += t.toLongString()
		if(t.isModified())
			str += t.toSaveString('*')//'\u2217'
	}
	file = Firebug.Ace.getUserFile("foxiMirror")
	file.append("xulMirrorTemplate.json")
	writeToFile(file, str)
}
cleanupDirtyState = function(){
	delete Templates[gTemplateName]
	gTemplateName = winTitle.clearName(gTemplateName)
	winTitle.update(gTemplateName)
	delete Templates[gTemplateName]
	
	for(var i in sessions){
		winTitle.track(sessions[i])
	}
}
deleteTemplete = function(name){
	name = prompt('are yo sure you want to delete', name)
	if(!name)
		return
		
	delete Templates[name]
	if(gTemplateName == name){
		for(var i in Templates)
			break				
		gTemplateName = i || 'newTemplate'
		
		loadTemplate(gTemplateName)
	}
	saveTemplates()
	
}

// save and load
Firebug.Ace.savePopupShowing = function(popup) {
	FBL.eraseNode(popup)
	FBL.createMenuItem(popup, {
		label: 'save File As',
			command: function(){
				Firebug.Ace.saveFile(codebox)
			}
		});
	FBL.createMenuItem(popup, {
		label: 'save "' + gTemplateName + '"',
			command: function(){
				cleanupDirtyState()
				saveTemplates()
			}
		});
	FBL.createMenuItem(popup, {
		label: 'save "' + gTemplateName  + '" As',
			command: function(){
				var newName = prompt('enter name')
				gTemplateName = newName.trim()
				saveTemplates()
			}
		});
	FBL.createMenuItem(popup, {
		label: 'delete "' + gTemplateName + '""',
			command: function(){
				deleteTemplete(gTemplateName)
			}
		});
}

Firebug.Ace.loadPopupShowing = function(popup) {
	FBL.eraseNode(popup)
	var load = function(){
		templateList.set(this.label)
		updatePreview()
		var a = this.parentNode.querySelectorAll("[checked]")
		for(var i = a.length; i--;){
			if(a[i] != this)
				a[i].removeAttribute("checked")
		}				
	}
	for(var i in templateList._defaultList){
		FBL.createMenuItem(popup, {
			label: i,
			command: load,
			type: 'checkbox',
			checked: i == gTemplateName
		});
	}
	FBL.createMenuItem(popup, "-")
	for(var i in templateList._userList){
		FBL.createMenuItem(popup, {
			label: i,
			command: load,
			type: 'checkbox',
			checked: i == gTemplateName
		});
	}
	FBL.createMenuItem(popup, "-")
	FBL.createMenuItem(popup, {
		label: 'new Template',
			command: function(){
				var newName = prompt('enter name')				
				gTemplateName = newName.trim()
				templateList._userList[gTemplateName] = new Template()
				loadTemplate(gTemplateName)
				saveTemplates()
			}
		});
	FBL.createMenuItem(popup, {
		label: 'load File',
			command: function(){
				Firebug.Ace.loadFile(codebox)
			}
		});
}



winTitle = {
	update: function(name){
		document.title = 'XULMirror - ' + name
	},
	clearName: function(name){
		if(name[name.length-1]=='\u2217'){
			name = name.slice(0, -1)
		}
		
		return name
	},
	track: function(session){
		var l = function(){
		
			session.removeEventListener(l)
			winTitle.update(winTitle.clearName(gTemplateName)+'\u2217')
		}
		session.on("change", l)
	},
}



