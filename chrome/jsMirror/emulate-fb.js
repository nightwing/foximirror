function $(id){
	return document.getElementById(id);
}

FBL = {}
if(Function.bind)
	FBL.bind = function (x, y) x.bind(y)
else
	FBL.bind = function (fn, object) {
		return function bound() fn.apply(object, arguments);
	}
FBL.extend = function (l, r) {
    var newOb = {};
    for (var n in l) {
        newOb[n] = l[n];
    }
    for (var n in r) {
        newOb[n] = r[n];
    }
    return newOb;
}
FBL.eraseNode = function (node) {
    while (node.lastChild)
        node.removeChild(node.lastChild);
}
FBL.createMenuItem = MenuUtils.createMenuItem
Firebug = {Ace: {}}
var Cc = Components.classes;
var Ci = Components.interfaces;



Firebug.Ace = {
	initialize: function(config) {		
		for(var i in config){
			dump(i, config[i].deps)
			var browser = $(config[i].id);
			var winWrapped = browser.contentWindow;
			//set Firebug.Ace on wrapped window so that Firebug.getElementPanel can access it
			winWrapped.document.getElementById('editor').ownerPanel = this;
			
			this[i] = winWrapped.wrappedJSObject;
			this[i].startAcebugAutocompleter = this.startAutocompleter;
			
			this[i].aceManager = this
			this[i].onclose = FBL.bind(this.shutdown, this)
			
			this[i].startAce(config[i].starter, null, config[i].deps);
			dump(config[i].starter)
		}
	},

	shutdown: function(e) {
		dump(e)
		//this.win1.aceManager = this.win2.aceManager = null
		//this.win1 = this.win2 = null
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

		var sessionOwner = editor.session.owner;
		if(sessionOwner && this.sessionOwners) {
			sessionOwner = this.sessionOwners[sessionOwner]
			sessionOwner && sessionOwner.addContextMenuItems(items, editor, editorText);
		}

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