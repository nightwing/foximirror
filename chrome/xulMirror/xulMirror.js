//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

//Form elements
var codebox = null;


function doOnload(){
	wrap = $("wrap")
	gBrowser = $("content")
	content = gBrowser.contentWindow

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

var codeCache = {}, sessions = {}, Templates = {}, gTemplate
var contentTypes = {
	xul: 'application/vnd.mozilla.xul+xml',
	overlay: 'application/vnd.mozilla.xul+xml',
	xbl: 'text/xml',
	
	getContextMenuItems: function(_, target){
		var id = target.id
		var selectedContentType = 'text/html'
		
	}
}




xulMirrorDataSource = function(a, b){
	a = a.slice(0, -6)
	dump(a, contentTypes[a])
	b.contentType = contentTypes[a]
	return codeCache[a] || (codeCache[a] = sessions[a].getValue())
}

xulMirror = {
	initialize: function(aceWindow) {
		// fixme
		codebox = Firebug.Ace.win2.editor


		var href = window.location.href
		href = href.slice(0, href.lastIndexOf('/') + 1) + "templates.json"
		var txt = makeReq(href)
		
		var a = txt.split(/!@!===/)
		dump(a)
		for(var i = 1; i < a.length; i++){
			var s = a[i]
			if(!s)
				continue;
			var i1 = s.indexOf('{')
			var i2 = s.lastIndexOf('}')
			
			var body = s.substring(i1 + 1, i2).trim()
			var name = s.substring(0, i1).trim()
			
			i1 = name.lastIndexOf('.')
			var type = name.substr(i1 + 1)
			name = s.substring(0, i1)
			dump(name)
			dump(type)
			if(!Templates[name])
				Templates[name] = {}
			Templates[name][type] = body
		}
		gTemplate = Templates.template1

		for each(var i in ["xbl", "xul", "overlay"]) {
			codeCache[i] = gTemplate[i]
			sessions[i] = aceWindow.createSession(codeCache[i], href, "text/xml")
			sessions[i].autocompletionType = 'xul';
			sessions[i].on("change", onChange)
		}
		
		$shadia.editGlue.setDataSource("xulMirror", xulMirrorDataSource)
		$shadia.editGlue.setDataSource("BindingURL", xulMirrorDataSource)
		$shadia.editGlue.setDataSource("overlayURL", xulMirrorDataSource)

		tabSelect('xul')
		updatePreview()
		codebox.focus()
		content.location = 'edit:@xulMirror'
	},
	//* * * * * * * * * * * * * * * * * * * * * * * * *

	shutdown: function() {
		$shadia.editGlue.removeDataSource("xulMirror")
		$shadia.editGlue.removeDataSource("BindingURL")
		$shadia.editGlue.removeDataSource("overlayURL")
	},

};
function tabSelect(id){
	dump(id, sessions[id])
	codebox.setSession(sessions[id])
	gSessionId = id
}

var changeTimeout = null, gSessionId = null 
onChange = function(){
	codeCache[gSessionId] = ''

	clearTimeout(changeTimeout)
	changeTimeout = setTimeout(updatePreview, 500, null)
	return
}
updatePreview = function(){
	content.location = 'edit:@xulMirror'
}









