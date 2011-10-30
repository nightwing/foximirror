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
FBL.createMenuItem = FBL.bind(MenuUtils.createMenuItem, MenuUtils)
Firebug = {Ace: {}}
var Cc = Components.classes;
var Ci = Components.interfaces;



Firebug.Ace = {
	initialize: function(config) {		
		for(var i in config){
			var browser = $(config[i].id);
			var winWrapped = browser.contentWindow;
			//set Firebug.Ace on wrapped window so that Firebug.getElementPanel can access it
			winWrapped.document.getElementById('editor').ownerPanel = this;
			
			this[i] = winWrapped.wrappedJSObject;
			this[i].startAcebugAutocompleter = this.startAutocompleter;
			
			this[i].aceManager = this
			this[i].onclose = FBL.bind(this.shutdown, this)
			
			this[i].startAce(config[i].starter, null, config[i].deps);
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
    initFilePicker: function(mode, path, ext) {
        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker),
            ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
        if (mode == 'save')
            fp.init(window, "save as", Ci.nsIFilePicker.modeSave);
        else
            fp.init(window, "select a file", Ci.nsIFilePicker.modeOpen);

        // try to set initial file
        if (path) {
            try{
                var file = ios.newURI(path, null, null);
                file = file.QueryInterface(Ci.nsIFileURL).file;
                fp.displayDirectory = file.parent;
                var name = file.leafName;
            } catch(e) {}
			
			if (!name) {
				var match = path.match(/(?:\/|^)([\w\d\s\.\-\+]*?)(?:\?|\#|$)/)
				if (match)
					name = match[1]
			}
			if (name)
			   fp.defaultString = name;
        }
			
        fp.appendFilters(Ci.nsIFilePicker.filterAll);
        // check we are not filtering wrong extension
        // if (name && name.slice(-ext.length) == ext)
            fp.appendFilter(ext, "*." + ext);

        return fp;
    },

    $pickFile: function(session, mode, path) {
		var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
		var file, result;
		if ((path == undefined && mode == 'save') ||
		    (path == false && mode == 'open'))
			path = session.filePath;
		
		if (path) {
			try {
				file = ios.newURI(path, null, null).QueryInterface(Ci.nsIFileURL).file;
				if (file.exists())
					result = {status: Ci.nsIFilePicker.returnOK, file: file};
			} catch(e){}
		}
		
		if (!result) {
			path = session.filePath || session.href || path;
			var fp = this.initFilePicker(mode, path, session.extension);
			result = {};
			result.status = fp.show();
			result.file = fp.file;
		}
		if (result.file)
			result.path = ios.newFileURI(result.file).spec
		return result
	},
	
	loadFile: function(editor, usePath, keepOldPath) {
		var session = editor.session, ext = session.extension			
		var fpResult = this.$pickFile(session, 'open', usePath);

		if (fpResult.status == Ci.nsIFilePicker.returnOK) {
			session.doc.setValue(readEntireFile(fpResult.file));
			keepOldPath || session.setFileInfo(fpResult.path);
		}
	},

	saveFile: function(editor, usePath, keepOldPath) {
		var session = editor.session, ext = session.extension;
		var fpResult = this.$pickFile(session, 'save', usePath);
		
		var file = fpResult.file;
		if (fpResult.status == Ci.nsIFilePicker.returnOK) {
			name = file.leafName;

			if (name.indexOf('.') < 0 && session.extension) {
				file = file.parent;
				file.append(name + '.' + session.extension);
			}

			writeToFile(file, session.getValue());
			keepOldPath || session.setFileInfo(fpResult.path);
		}
		else if (fpResult.status == Ci.nsIFilePicker.returnReplace) {
			writeToFile(file, session.getValue());
			keepOldPath || session.setFileInfo(fpResult.path);
		}
	},

	savePopupShowing: function(popup) {
		FBL.eraseNode(popup)
		FBL.createMenuItem(popup, {label: 'save As'});
	},

	loadPopupShowing: function(popup) {
		FBL.eraseNode(popup)
		FBL.createMenuItem(popup, {label: 'ace auto save'});
	},

	getUserFile: function(id, dir){
		var file = Services.dirsvc.get(dir || "ProfD", Ci.nsIFile);
		id && file.append(id)
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