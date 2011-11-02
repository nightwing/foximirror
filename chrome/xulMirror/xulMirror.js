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
		saveTemplates()
	},

};
//-----------------------------------------------------------------------------
updatePreview_inBrowser = function(){
	content.location = 'edit:@xulMirror`'+templateList.currentTemplate.defaultTabName
}
var dWin
updatePreview_detached = function(){
	if(!dWin || dWin.closed){
		dWin = $shadia.openWindow('edit:@xulMirror`'+templateList.currentTemplate.defaultTabName)
	}else
		dWin.location = 'edit:@xulMirror`'+templateList.currentTemplate.defaultTabName
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
updateTitle = function(isClean) {
	var tpl = templateList.currentTemplate
	isClean = !tpl.isModified()
	document.title = 'XULMirror - ' + (isClean ? tpl.name : tpl.name + '*' )
	gCleanTitle = isClean
}
updateTitle.schedule = function(t){
	clearTimeout(updateTitle.timeout)
	updateTitle.timeout = setTimeout(updateTitle, t||200)	
}

var changeTimeout = null, tabChangeTimeout = null, gSessionId = null, gAutoUpdate = true, gCleanTitle = true
onChange = function() {
	if (gCleanTitle == true) {
		updateTitle.schedule()
	}
	if (gSessionId == "overview") {
		codeCache = {}
		clearTimeout(tabChangeTimeout)
		tabChangeTimeout = setTimeout(function(){
			templateList.currentTemplate.updateSessions()
			templateList.updateTabs()
		}, 10, null)		
	} else
		codeCache[gSessionId] = ''
	
	if (!gAutoUpdate)
		return
	clearTimeout(changeTimeout)
	changeTimeout = setTimeout(updatePreview, 700, null)	
}


function Template(txt) {
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
	createOverviewSession: function() {
		delete this.overviewSession
		var s = Firebug.Ace.win2.createSession(this.toLongString(), "overview.js")
		s.on("change", onChange)
		return this.overviewSession = s
	},	
	sessions: {},
	fullCode: "",
	defaultTabName: "",
	//sessionNames: [],
	shortNameMap: null,
	updateSessions: function(txt) {
		if(!txt)
			txt = this.overviewSession.getValue()

		var oldSessions = this.sessions || {}
		this.shortNameMap = {}
		this.sessions = {}
		var a = txt.split(/!@!===/)
		
		var m = a[0].match(/\!\s+(.*?)\s*/)
		if (m && this.name != m[1]){
			dump(m[1],a[0])
			this.name = m[1]
			updateTitle.schedule()
		}
		this.defaultTabName = ""
		
		for(var i = 1; i < a.length; i++){
			var s = a[i]
			if(!s)
				continue;
			var i1 = s.indexOf('{')
			var i2 = s.lastIndexOf('}')
			
			var body = s.substring(i1 + 1, i2).trim()
			var tabName = s.substring(0, i1).trim()
			
			if(!tabName)
				continue
			var i1 = tabName.lastIndexOf(".")
			var shortName = i1 < 0 ? tabName : tabName.substring(0, i1)
			this.shortNameMap[shortName] = tabName

			if(!this.defaultTabName)
				this.defaultTabName = tabName
			
			var	os = oldSessions[tabName]
			if(typeof os == "object") {
				if(os.getValue() != body)
					os.doc.setValue(body)
				this.sessions[tabName] = os
			}else
				this.sessions[tabName] = body
		}
		if(!this.sessionName || !this.sessions[this.sessionName])
			this.sessionName = this.defaultTabName
	},
	updateOverview: function() {
		var txt = this.toLongString()
		if(txt != this.overviewSession.toString()){
			if(this.overviewSession.doc)
				this.overviewSession.doc.setValue(txt)
			else
				this.overviewSession = txt
		}
	},
	getSession: function(name) {
		if(typeof this.sessions[name] == 'string'){
			this.sessions[name] = Firebug.Ace.win2.createSession(this.sessions[name], name)
			this.sessions[name].on("change", onChange)
		}
		return this.sessions[name]
	},
	displayName: function() {
		return this.isModified()?this.name+'*':this.name
	},
	setName: function(name) {
		this.name = name.trim()||this.name
		this.updateOverview()
		updateTitle()
	},
	isModified: function() {
		return this.toLongString() != this.fullCode
	},
	clearDirtyState: function() {
		this.fullCode = this.toLongString()
	},
	toLongString: function(nameModifier) {
		var str = "!>>!\t" + this.name + (nameModifier||'') + "\n"
		for(var s in this.sessions){
			str += "!@!=== " + s + "{\n\n" +
				this.sessions[s]
				+ "\n\n\n}\n"
		}
		return str
	},
	toSaveString: function() {
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
		
		if (txt) {
			gTemplateName = txt.substring(0, txt.indexOf("\n")).trim()
			var a = txt.split(/^!>>!/m)
			for(var i = 1; i < a.length; i++){
				var s = a[i]
				if(s){
					this._userList.push(new Template(s))
				}
			}
		}
		
		this.setUserTemplate(gTemplateName)
	},
	addNewTemplate: function(name, newName) {
		name = name.trim()
		var tpl = this._defaultList[name];
		if (tpl){
			tpl = new Template(tpl.toLongString())
			name = name.replace('new_', '')
		}else
			tpl = new Template('')
		
		newName = name || newName
			

		var names = this._userList.map(function(x)x.name)
		
		var i = 0
		name = newName
		while (names.indexOf(newName)!=-1) {
			newName = name + '_' + i
			i++
		}
		
		tpl.name = newName
		this._userList.push(tpl)
		this.setUserTemplate(newName)
		return tpl
	},
	_defaultList: {},
	_userList: [],
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
	setUserTemplate: function(name) {
		gTemplateName = name
		codeCache = {}
		
		this.currentTemplate = this.getUserTemplate(name) || new Template('')
		updateTitle()
		
		var tabName = this.currentTemplate.sessionName
		
		this.updateTabs()
		this.tabList.selectedItem = this.tabList.querySelector("#" + tabName.replace(".","\\."))
		this.selectTab(tabName)
	},
	getUserTemplate: function(name){
		return this._userList[this.getIndex(name)]
	},
	getIndex: function(name){
		for(var i in this._userList){
			if(this._userList[i].name == name)
				return i
		}
		return -1
	},
	remove: function(name){
		var i = this.getIndex(name)
		if(i==-1)
			return false
		this._userList.splice(i, 1)
		return true		
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
	



saveTemplates = function(){
	var str = gTemplateName + "\n"
	
	for each(var t in templateList._userList){		
		str += t.toLongString()
		if(t.isModified())
			str += t.toSaveString('*')//'\u2217'
	}
	
	file = Firebug.Ace.getUserFile("foxiMirror")
	file.append("xulMirrorTemplate.json")
	writeToFile(file, str)
}

deleteTemplete = function(name){
	name = prompt('are yo sure you want to delete', name)
	if(!name)
		return
		
	templateList.remove(name)
	if (gTemplateName == name) {
		var i = templateList._userList[0]
		gTemplateName = i? i.name : '_'		
		templateList.setUserTemplate(gTemplateName)
	}
	saveTemplates()
}

cleanupDirtyState = function(){
	templateList.currentTemplate.clearDirtyState()
	updateTitle()
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
	FBL.createMenuItem(popup, "-");
	FBL.createMenuItem(popup, {
		label: 'save "' + gTemplateName + '"',
			command: function(){
				cleanupDirtyState()
				saveTemplates()
			}
		});
	/* FBL.createMenuItem(popup, {
		label: 'save "' + gTemplateName  + '" As',
			command: function(){
				var newName = prompt('enter name')
				gTemplateName = newName.trim()
				saveTemplates()
			}
		}); */
	FBL.createMenuItem(popup, {
		label: 'delete "' + gTemplateName + '""',
			command: function(){
				deleteTemplete(gTemplateName)
			}
		});
}

Firebug.Ace.loadPopupShowing = function(popup) {
	popup = popup || $("load-button").firstChild
	FBL.eraseNode(popup)
	popup.ownerPanel = templateLoader
	var load = function(){
		templateList.setUserTemplate(this.label)
		updatePreview()
		var a = this.parentNode.querySelectorAll("[checked]")
		for(var i = a.length; i--;){
			if(a[i] != this)
				a[i].removeAttribute("checked")
		}				
	}
	
	FBL.createMenuItem(popup, "-")
	for each(var t in templateList._userList){
		FBL.createMenuItem(popup, {
			label: t.name,
			command: load,
			type: 'checkbox',
			checked: t.name == gTemplateName,
			option: 'context'
		});
	}
	FBL.createMenuItem(popup, "-")
	
	var add = function(){
		templateList.addNewTemplate(this.label)
		updatePreview()
		
		Firebug.Ace.loadPopupShowing(this.parentNode)
	}
	for(var i in templateList._defaultList){
		FBL.createMenuItem(popup, {
			label: i,
			command: add,
			closemenu: 'none'		
		});
	}

	FBL.createMenuItem(popup, "-")
	FBL.createMenuItem(popup, {
		label: 'load a File',
		command: function(){
			Firebug.Ace.loadFile(codebox)
		}
	});
}

templateLoader = {
	getContextMenuItems: function(_, target){
		if (!target.getAttribute('option'))
			return
		
		return [{
			label: 'rename ' + target.label,
			option: target.label,
			command: function() {
				var origName = this.getAttribute('option')
				var name = prompt('are yo sure you want to delete', origName)
				
				name = name&&name.trim()
				
				if(!name || name == this.label)
					return
				if(templateList.getIndex(name)!=-1){
					var name2 = prompt('are yo sure you want to delete', name).trim()
					name2 = name2&&name2.trim()
					if(!name2 || name2 == this.label)
						return
					if(name2 == name)
						templateList.remove(name)
				}

				templateList.getUserTemplate(origName).setName(name)
				
				Firebug.Ace.loadPopupShowing()
			},
			closemenu: 'none'
		},{
			label: 'delete ' + target.label,
			option: target.label,
			command: function(){
				var name = this.getAttribute('option')
				deleteTemplete(name)
				Firebug.Ace.loadPopupShowing()
			},
			closemenu: 'none'
		}]
	}
	
}


