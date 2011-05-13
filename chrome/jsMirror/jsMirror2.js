$=function(x)document.getElementById(x)

aceManager = {
    initializeUI: function() {
        var browser = $("jsCode");
        this.win2Wrapped = browser.contentWindow;
        this.win2 = this.win2Wrapped.wrappedJSObject;

        var browser = FBL.$("fbAceBrowser1");
        this.win1Wrapped = browser.contentWindow;
        this.win1 = this.win1Wrapped.wrappedJSObject;

        this.win1.startAcebugAutocompleter =
        this.win2.startAcebugAutocompleter = this.startAutocompleter;  
		
		var editor = this.win2.editor;
        editor.session.owner = 'console';
        editor.session.href = '';
        editor.session.autocompletionType = 'js';
		editor.addCommands({
            execute: aceManager.execute
        });
		
		var editor = this.win2.editor;
        editor.session.owner = 'console';
        editor.session.href = '';
        editor.session.autocompletionType = 'js';
		editor.addCommands({
            execute: Firebug.largeCommandLineEditor.enter
        });
    },

    // save and load

    initFilePicker: function(session, mode) {
        var ext = session.extension,
            fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker),
            ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
        if (mode == 'save')
            fp.init(window, $ACESTR("acebug.saveas"), Ci.nsIFilePicker.modeSave);
        else
            fp.init(window, $ACESTR("acebug.selectafile"), Ci.nsIFilePicker.modeOpen);

        if (ext)
            fp.appendFilter(ext, "*." + ext);
        fp.appendFilters(Ci.nsIFilePicker.filterAll);

        // try to set initial file
        if (session.filePath) {
            try{
                file = ios.newURI(session.filePath, null, null);
                file = file.QueryInterface(Ci.nsIFileURL).file;
                fp.displayDirectory = file.parent;
                fp.defaultString = file.leafName;
            } catch(e) {}
        }
        return fp;
    },

    loadFile: function(editor) {
        var result, file, name, result,
            session = editor.session, ext = session.extension,
            ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
        var fp = this.initFilePicker(session, 'open');

        result = fp.show();

        if (result == Ci.nsIFilePicker.returnOK) {
            session.setValue(readEntireFile(fp.file));
            session.setFileInfo(ios.newFileURI(fp.file).spec);
        }
    },

    saveFile: function(editor) {
        var file, name, result, session = editor.session,
            ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService),
            fp = this.initFilePicker(session, 'save');

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

};
/**======================-==-======================*/


/**======================-==-======================*/
jsExplore={}
jsExplore.qi=function(){
	autocompleter.start(jn.qi(autocompleter.object),autocompleter.filterText)
}

jsExplore._p=function(){
	var protoList=[autocompleter.object]
	var p=protoList[0]
	while(p=p.__proto__)
		protoList.push(p)
	jn.say(protoList.join('\n'))
}
jsExplore.si=function(){
	autocompleter.sayInBubble(
		'interfaces supported by\n'+
		autocompleter.object+'\n'+
		supportedInterfaces(autocompleter.object).join('\n')
	
	
	)
}
jsExplore.gs=function(){
	jn.say(setget(autocompleter.object,autocompleter.selectedText()))
}
jsExplore.all=function(){
	autocompleter.toggleMode()
}
/*****************
 *  end of code completion utils
 ****************************************************************/









