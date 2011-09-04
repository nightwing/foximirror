//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

//Form elements
var codebox = null;


function $(id){
	return document.getElementById(id);
}
function doOnload(){
	wrap = $("wrap")
	gBrowser = $("content")
	content = gBrowser.contentWindow

	Firebug.Ace.initialize()
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
aceManager = Firebug.Ace = {
	initialize: function() {
		var browser = $("code");
		var win2Wrapped = browser.contentWindow;
		this.win2 = win2Wrapped.wrappedJSObject;

		this.win2.startAcebugAutocompleter = this.startAutocompleter;

		//set Firebug.Ace on wrapped window so that Firebug.getElementPanel can access it
		win2Wrapped.document.getElementById('editor').ownerPanel = this;

		this.win2.aceManager = this
		this.win2.onclose = FBL.bind(this.shutdown, this)

		var starter = FBL.bind(xulMirror.initialize, xulMirror)

		Firebug.Ace.win2.startAce(starter, null, []);
	},

	shutdown: function() {
		if(!this.win1)
			return
		this.win1.aceManager = this.win2.aceManager = null
		this.win1 = this.win2 = null
	},

	// context menu
	getContextMenuItems: function(nada, target) {
		var env = target.ownerDocument.defaultView.wrappedJSObject;

		var items = [],
			editor = env.editor,
			clipBoardText = gClipboardHelper.getData(),
			editorText = editor.getCopyText(),
			self = this;
		// important: make sure editor is focused
		editor.focus()

		items.push(
			{
				label: "copy",
				command: function() {
					gClipboardHelper.copyString(editorText);
				},
				disabled: !editorText
			},
			{
				label: ("cut"),
				command: function() {
					gClipboardHelper.copyString(editorText);
					editor.onCut();
				},
				disabled: !editorText
			},
			{
				label: ("paste"),
				command: function() {
					editor.onTextInput(clipBoardText);
				},
				disabled: !clipBoardText
			},
			"-",
			{
				label: "help",
				command: function() {
					var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
					mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab("https://github.com/MikeRatcliffe/Acebug/issues");
				}
			}
		);

		var sessionOwner;
		switch(editor.session.owner) {
			case 'console': sessionOwner = xulMirror; break;
			case 'stylesheetEditor': sessionOwner = StyleSheetEditor.prototype; break;
			case 'htmlEditor': sessionOwner = null; break;
		}
		sessionOwner && sessionOwner.addContextMenuItems(items, editor, editorText);

		return items;
	},

	getSourceLink: function(target, object) {
		var env = target.ownerDocument.defaultView.wrappedJSObject;
		var session = env.editor.session;
		if (!session.href)
			return;
		var cursor = Firebug.Ace.win1.editor.session.selection.selectionLead;
		var link = new FBL.SourceLink(session.href, cursor.row);
		link.column = cursor.column;
		return link
	},

	getPopupObject: function(target) {
		return null;
	},

	getTooltipObject: function(target) {
		return null;
	},

	// save and load
	initFilePicker: function(session, mode) {
		var ext = session.extension,
			fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker),
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
		if (mode == 'save')
			fp.init(window, ("saveas"), Ci.nsIFilePicker.modeSave);
		else
			fp.init(window, ("selectafile"), Ci.nsIFilePicker.modeOpen);

		// try to set initial file
		if (session.filePath) {
			try{
				var file = ios.newURI(session.filePath, null, null);
				file = file.QueryInterface(Ci.nsIFileURL).file;
				fp.displayDirectory = file.parent;
				var name = file.leafName;
				fp.defaultString = file.leafName;
			} catch(e) {}
		}
		// session.extension not always is the same as real extension; for now
		if (name && name.slice(-ext.length) != ext)
			fp.appendFilters(Ci.nsIFilePicker.filterAll);

		if (ext)
			fp.appendFilter(ext, "*." + ext);
		fp.appendFilters(Ci.nsIFilePicker.filterAll);

		return fp;
	},

	loadFile: function(editor) {
		var result, name, result,
			session = editor.session, ext = session.extension,
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
		var fp = this.initFilePicker(session, 'open');

		result = fp.show();

		if (result == Ci.nsIFilePicker.returnOK) {
			session.setValue(readEntireFile(fp.file));
			session.setFileInfo(ios.newFileURI(fp.file).spec);
		}
	},

	saveFile: function(editor, doNotUseFilePicker) {
		var file, name, result, session = editor.session,
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService),
			fp = this.initFilePicker(session, 'save');

		if (doNotUseFilePicker && session.href) {
			try {
				file = ios.newURI(session.href, null, null)
					.QueryInterface(Ci.nsIFileURL).file;
				if (file.exists()) {
					result = Ci.nsIFilePicker.returnOK;
					fp = {file: file};
				}
			} catch(e){}
		}

		if (!fp.file)
			result = fp.show();
		if (result == Ci.nsIFilePicker.returnOK) {
			file = fp.file;
			name = file.leafName;

			if (name.indexOf('.')<0) {
				file = file.parent;
				file.append(name + '.' + session.extension);
			}

			writeFile(file, session.getValue());
			if (!session.filePath)
				session.setFileInfo(ios.newFileURI(file).spec);
		}
		else if (result == Ci.nsIFilePicker.returnReplace) {
			writeFile(fp.file, session.getValue());
			if (!session.filePath)
				session.setFileInfo(ios.newFileURI(file).spec);
		}
	},

	savePopupShowing: function(popup) {
		FBL.eraseNode(popup)
		FBL.createMenuItem(popup, {label: 'save As', nol10n: true });
	},

	loadPopupShowing: function(popup) {
		FBL.eraseNode(popup)
		FBL.createMenuItem(popup, {label: 'ace auto save', nol10n: true });
	},

	getUserFile: function(id){
		var file = Services.dirsvc.get(dir||"ProfD", Ci.nsIFile);
		file.append('acebug')
		file.append('autosave-'+id)
		return file
	},


	// search
	search: function(text, reverse) {
		var e = this.editor;
		e.$search.set({
			needle: text,
			backwards: reverse,
			caseSensitive: false,
			//regExp: Firebug.searchUseRegularExpression,
		});

		var range = e.$search.find(e.session);
		if (!range) {
			range = e.selection.getRange();
			if (!range.isEmpty()) {
				range.end = range.start;
				e.selection.setSelectionRange(range);
				range = e.$search.find(e.session);
			}
		}

		if (range) {
			e.gotoLine(range.end.row + 1, range.end.column);
			e.selection.setSelectionRange(range);
		}
		return range&&!range.isEmpty();
	}
};


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









