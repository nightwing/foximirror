let EXPORTED_SYMBOLS = ["Services", "$shadia"];

var $shadia = this

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cu = Components.utils;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

try{
	Components.utils.import("resource://gre/modules/Services.jsm");
}catch(e){
	// shim for v<4
	Components.utils.import("resource://shadia/Services.jsm");
}
XPCOMUtils.defineLazyServiceGetter(Services, "jsd", "@mozilla.org/js/jsd/debugger-service;1", "jsdIDebuggerService");
/*XPCOMUtils.defineLazyGetter(Services, "jsd", function () {
	try{
		var jsd = Cu.import('resource://firebug/firebug-service.js', {}).jsd
	}catch(e){
		var jsd = Cc["@mozilla.org/js/jsd/debugger-service;1"].getService(Ci.jsdIDebuggerService)
	}
	return jsd
});*/
XPCOMUtils.defineLazyGetter(Services, "chromeReg", function () {
  return Cc["@mozilla.org/chrome/chrome-registry;1"]
		.getService(Ci.nsIChromeRegistry)
		.QueryInterface(Ci.nsIXULOverlayProvider)
		.QueryInterface(Ci.nsIXULChromeRegistry);
});
XPCOMUtils.defineLazyServiceGetter(Services, "domUtils", "@mozilla.org/inspector/dom-utils;1", "inIDOMUtils");
XPCOMUtils.defineLazyServiceGetter(Services, "sss", "@mozilla.org/content/style-sheet-service;1", "nsIStyleSheetService");
XPCOMUtils.defineLazyServiceGetter(Services, "atom", "@mozilla.org/atom-service;1", "nsIAtomService");


var addDevelopmentUtils = function(window){
	//window.toOpenWindowByType = toOpenWindowByType;
	//window.toOpenWindowByURI = toOpenWindowByURI;
	window.dump = dump
	if(!('Cc' in window))
		window.Cc=Components.classes
	if(!('Ci' in window))
		window.Ci=Components.interfaces
	if(!('Cu' in window))
		window.Cu=Components.utils
	var href = window.location.href
	if(href.substring(0,15)=='chrome://shadia'||href=='chrome://console2/content/console2.xul'){
		for each(var i in ["getLocalFile","makeReq","viewFileURI","npp"]){
			window[i]=this[i]
		}
	}
}

/** **************************************************************
 *    exported functions
 ** ********************** **/
toOpenWindowByURI = function (uri, features) {
    var winEnum = Services.wm.getEnumerator("");
    while (winEnum.hasMoreElements()) {
        let win = winEnum.getNext();
        if (win.closed || win == window) {
            continue;
        }
        if (win.location.href == uri) {
            win.focus();
            return true;
        }
    }
	openWindow(uri, features).focus();
}
openWindow = function (uri, features){
    var array = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    for (var i=2; i<arguments.length; i++) {
        var variant = Cc["@mozilla.org/variant;1"].createInstance(Ci.nsIWritableVariant);
        variant.setFromVariant(arguments[i]);
        array.appendElement(variant, false);
    }
	return Services.ww.openWindow(
		null, uri, "_blank",
		features || "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar,centerscreen",
		array
	)
}
/***loging**/
dump = function(){
	var aMessage="#>: ";
    for(var i=0,l=arguments.length; i<l; ++i){
		var a=arguments[i]
        aMessage += (a&&!a.toString?'[object call]':a) + " , ";
    }
	var stack = Components.stack.caller
	var consoleMessage = Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
	consoleMessage.init(aMessage, stack.filename, null, stack.lineNumber, 0, 9, "component javascript");
	Services.console.logMessage(consoleMessage);
}
dump.log = function(){
    var aMessage="aMessage: ";
    for(var i=0,l=arguments.length; i<l; ++i){
		var a=arguments[i]
        aMessage += (a&&!a.toString?'[object call]':a) + " , ";
    }
    Services.console.logStringMessage("" + aMessage);
}
dump.trace = function dumpComponentsStack(from){
    var msg = [];
    for (var frame = Components.stack; frame; frame = frame.caller)
        msg.push(frame.filename + "#@" + frame.lineNumber +": "+frame.sourceLine  );
    dump(from+" has stack size:" +msg.length, msg.join('\n'));
}
dump.clear = function(){
	Services.console.reset()
	Services.console.logStringMessage("");
}
/*

    XPConnect JavaScript
    component javascript
    chrome javascript
    chrome registration
    XBL
    XBL Prototype Handler
    XBL Content Sink
    xbl javascript
    FrameConstructor

    HUDConsole
    CSS Parser
    CSS Loader
    content javascript
    DOM Events
    DOM:HTML
    DOM Window
    SVG
    ImageMap
    HTML
    Canvas
    DOM3 Load
    DOM
    malformed-xml
    DOM Worker javascript

/***loging**/

getLocalFile=function getLocalFile(mPath){
	var uri = Services.io.newURI(mPath, null, null),file;
	if(uri.schemeIs('resource')){//about?
		var ph = Services.io.getProtocolHandler('resource').QueryInterface(Ci.nsIResProtocolHandler)
		abspath = ph.getSubstitution(uri.host)
		uri = Services.io.newURI(uri.path.substr(1), null, abspath)
	}
	while(uri.schemeIs('chrome'))
		uri=Services.chromeReg.convertChromeURL(uri);
	while(uri.schemeIs('jar'))
		uri=uri.QueryInterface(Ci.nsIJARURI).JARFile;
	if(uri.schemeIs('file'))
		file=uri.QueryInterface(Ci.nsIFileURL).file;

	return file&&file.QueryInterface(Ci.nsILocalFile)
}

makeReq=function makeReq(href){
	var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();//new XMLHttpRequest;
	req.overrideMimeType('text/plain')
	req.open("GET", href, false);
	try{
		req.send(null);
	}catch(e){}
	return req.responseText;
}
makeReqAsync=function makeReqAsync(href,callback){
    req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();//new XMLHttpRequest();
    req.open('GET', href, true);
	req.overrideMimeType('text/plain')

    req.onload = function() {
        req.onload=null
        callback(req.responseText);
    };
    req.send(null);
}
/** **************************************************************
 *    exported functions
 ** ********************** **/
function setPref(prefName,val,type){
	var prefBranch = Services.prefs
	try{
        switch (type||typeof(val)||prefBranch.getPrefType(prefName)){
			case 'string':  case prefBranch.PREF_STRING:
				return prefBranch.setCharPref(prefName,val);
			case 'number':  case 'int':  case 'float': case prefBranch.PREF_INT:
				return prefBranch.setIntPref (prefName,val);
			case 'boolean': case 'bool': case prefBranch.PREF_BOOL:
				return prefBranch.setBoolPref(prefName,val);
			default:
				return 'failed';
        }
    }catch(e){}
}
function clearPref(prefName){
	try{
		//gPrefBranch.prefHasUserValue(prefName)
		Services.prefs.clearUserPref(prefName)
	}catch(e){}
}
function getPref(prefName,type){
	var prefBranch = Services.prefs
	try{
        switch (type||prefBranch.getPrefType(prefName)){
			case 'string':  case prefBranch.PREF_STRING:
				return prefBranch.getCharPref(prefName);
			case 'int':     case prefBranch.PREF_INT:
				return prefBranch.getIntPref(prefName);
			case 'bool':    case prefBranch.PREF_BOOL:
				return prefBranch.getBoolPref(prefName);
        }
    }catch(e){}
}
  //**********************************************************
 //* npp
//****/
viewFileURI=function viewFileURI(selectedURI,lineNumber){
	//Services.wm.getMostRecentWindow(null).openDialog("chrome://global/content/viewSource.xul", "_blank", "all,dialog=no", selectedURI, null, null, lineNumber, null);
	openWindow("chrome://global/content/viewSource.xul", "all,dialog=no", selectedURI, null, null, lineNumber, null);
}
var externalEditors = {
	guessEditorPath: function (){
		//todo: look into registry
		if(this.$guessedPath)
			return this.$guessedPath;
		try{
			var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			var path="C:\\Program Files\\Notepad++\\notepad++.exe"
			file.initWithPath(path);
			if(file.exists())
				return this.$guessedPath=path
			var path="C:\\Program Files (x86)\\Notepad++\\notepad++.exe"
			file.initWithPath(path);
			if(file.exists())
				return this.$guessedPath=path
		}catch(e){}
	},
	guessEditor: function(){try{
		var path = this.guessEditorPath()
		if(!path)
			return;
		return {
			label:'notepad++',
			executable: path,
			cmdline: '-n%line %file'
		}
		}catch(e){}
	},
	getItem: function(){
		var a=$shadia.getPref('extensions.shadia.editor')
		if(a && (a=a.split(','))[1])
			return {label:a[0], executable: a[1], cmdline: a[2]}

		if(a = this.guessEditor())
			return a


	},
	edit: function(path, line, column, id){
		var editor = this.getItem()

		if(!editor || !editor.executable){
			openWindow('chrome://shadia/content/utils/prefSetters/changeeditor.xul')
			return
		}

		// resolve internal uris
		var uri = Services.io.newURI(path, null, null);
		if(uri.schemeIs('resource')){//about?
			var ph = Services.io.getProtocolHandler('resource').QueryInterface(Ci.nsIResProtocolHandler)
			abspath = ph.getSubstitution(uri.host)
			uri = Services.io.newURI(uri.path.substr(1), null, abspath)
		}
		while(uri.schemeIs('chrome'))
			uri=Services.chromeReg.convertChromeURL(uri);

		if(uri.schemeIs('file'))
			var file=uri.QueryInterface(Ci.nsIFileURL).file;

		// check for archives
		if(uri.schemeIs('jar')){
			file = extractRelative(uri, false)
			if(!file.exists()){
				var proceed = this.archivePrompt(uri, line, column)
				if(!proceed)
					return;
				file = extractRelative(uri, true)
			}
		}

		if(!file || !file.exists())
			return

		file.QueryInterface(Ci.nsILocalFile)

		if(file.isDirectory())
			return file.launch()

		// launch editor
		var filePath = file.path
		var args = this.$initArgs(filePath, line, column, editor.cmdline)
		var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithPath(editor.executable);
		// create an nsIProcess
		var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
		process.init(file);
		process.run(false, args, args.length);
	},
	archivePrompt: function(uri, line, column){
		var arr=['extract file and edit', 'show archive', 'open with view-source:', 'open with edit:']
		var sel={}
		var proceed = Services.prompt.select(null, 'file is in archive', 'this file is in archive,\n what do you want to do?',
			arr.length, arr,
			sel
		)
		if(!proceed)
			return false
		if(sel.value==0){
			return true
		}else if(sel.value==1){
			getLocalFile(uri.spec).reveal()
		}else if(sel.value==2){
			viewFileURI(uri.spec, line)
		}else if(sel.value==3){
			openWindow('edit:#'+uri.spec + '##'+line+':'+column)
		}
	},
	$initArgs: function(path,line, column, cmdline){
		var args = [];
		var targetAdded = false;
		if (cmdline){
			cmdline = cmdline.replace(' ', '\x00', 'g')

			line = parseInt(line);
			if(typeof line == 'number' && !isNaN(line)){
				cmdline = cmdline.replace('%line', line, 'g');
			}else{//don't send argument with bogus line number
				var i = cmdline.indexOf("%line");
				var i2 = cmdline.indexOf("\x00", i);
				if(i2 == -1)
					i2 = cmdline.length;
				var i1 = cmdline.lastIndexOf("\x00", i);
				if(i1 == -1)
					i1 = 0;
				cmdline = cmdline.substring(0, i1) + cmdline.substr(i2);
			}

			if (cmdline.indexOf("%file")>-1 ){
				cmdline = cmdline.replace('%file', path, 'g');
				targetAdded = true;
			}
			cmdline.split(/\x00+/).forEach(function(x){ if(x) args.push(x) })
		}
		if (!targetAdded)
			args.push(path);
		return args
	}
}


extractRelative = function(uri, doExtract){
	function getTargetFile(aDir, entry) {
		let target = aDir.clone();
		entry.split("/").forEach(function(aPart) {
			target.append(aPart);
		});
		return target;
	}
	function extract(jar, entryName){
		var name = jar.leafName.replace(/\.\w*$/, '')
		var dir = jar.parent
		dir.append(name)
		if(dir.exists()&&!dir.isDirectory)
			dir.createUnique(Ci.nsIFile.DIRECTORY_TYPE, PERMS_DIRECTORY)

		var target = getTargetFile(dir, entryName)
		if(!doExtract)
			return target

		// really extract file if user wants
		var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
		zipReader.open(jar);
		try {
			let parent = target.parent
			if (!parent.exists())
				target.parent.create(Ci.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
			//if (target.exists())
			//	continue;
			zipReader.extract(entryName, target); 
			target.permissions |= PERMS_FILE;
		} finally {
			zipReader.close();
		}
		return target
	}
	var jarLevels = []
	while(uri.schemeIs('jar')){
		uri.QueryInterface(Ci.nsIJARURI)
		jarLevels.unshift(uri.filePath.substr(1))
		uri = uri.JARFile
	}

	var jar = uri.QueryInterface(Ci.nsIFileURL).file

	jarLevels.forEach(function(name){
		jar = extract(jar, name)
	})
	return jar
}


//compatibilty shim
npp=function(path,line){
	externalEditors.edit(path,line)
}

//*******************************************
//* 
//******

/**zr constants*/
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;
var PERMS_DIRECTORY = 0755;
var PERMS_FILE      = 0644;


function getCssMirrorJarPath(){
	var cssMirrorDir = Services.dirsvc.get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	
	var fileHandler = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
	var uri = fileHandler.getURLSpecFromFile(getCssMirrorDir());
		
	return 'jar:'+uri+'!/'
}

function getCssMirrorDir(){
	var cssMirrorDir=Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	if(!cssMirrorDir.exists()){
		cssMirrorDir.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
		var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
		var zipW = new zipWriter();
		zipW.open(cssMirrorDir, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
		try{
			let istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
			var data='shadiaglue{-moz-binding:url("chrome://shadia/content/bindings/debug.xml#shadiaGlue")!important}\n'+
				'parseerror{-moz-binding:url("chrome://shadia/content/bindings/debug.xml#parseerror")!important}\n'+
				'*{-moz-tab-size:4!important}\n'
			var entryPath='debug.css'
			istream.setData(data, data.length);
			if (zipW.hasEntry(entryPath))
				zipW.removeEntry(entryPath,false)
			zipW.addEntryStream(entryPath,null,Ci.nsIZipWriter.COMPRESSION_NONE,istream,false)
		}finally{
			zipW.close();
		}		
	}

	return cssMirrorDir
}

//register enabled styles
function registerStyles(){
	var ios = Services.io, sss = Services.sss;
	var cssMirrorJarPath = getCssMirrorJarPath()

	if(Services.prefs.prefHasUserValue('extensions.shadia.enabledStyles'))
		var enabledStyles = Services.prefs.getCharPref('extensions.shadia.enabledStyles')
	else
		var enabledStyles = 'debug.css'

	enabledStyles.split(',').forEach(function(name){
		if(name)try{
			var uri = cssMirrorJarPath + name;
			uri = ios.newURI(uri, null, null);
			sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
		}catch(e){Components.utils.reportError(e)}
	})
}

registerStyles()


//******************************************************************************************************//
reloadModule = function(href){
	var bp = Cu.import(href)
	// query needed to confuse startupcache in ff 8.0+
	Services.scriptloader.loadSubScript(href+'?'+Date.now(), bp);
	return bp
}
reloadModule = function(href){
	try{
		this.shutdown()
	}catch(e){
		Cu.reportError(e)
	}

	var bp = Cu.import(href)
	// query needed to confuse startupcache in ff 8.0+
	Services.scriptloader.loadSubScript(href+'?'+Date.now(), bp);
	return bp
}


/**************************************************************************
 * bootstrap.js API
 *****************/
lightStarter ={
	startKey1: 19,//DOM_VK_PAUSE,
	startKey2: 112,//DOM_VK_F1,

	handleEvent: function(e){	
		if(e.keyCode==this.startKey1||e.keyCode==this.startKey2){
			var win = this.getTopWindow(e.view)
			dump(win.location, ('shadia' in win))
			if(!('shadia' in win))
				this.loadScript(win)
			win.shadia.toggle()
			e.stopPropagation()
			e.preventDefault()
		}
	},
	loadScript: function(mWindow){
		Services.scriptloader.loadSubScript('chrome://shadia/content/shadia.js', mWindow);
	},
	init: function(domWindow){
		domWindow.addEventListener("keydown", lightStarter, true); 
	},
	uninit: function(domWindow){
		domWindow.removeEventListener("keydown", lightStarter, true); 
	},
	getTopWindow: function(mWindow){
		let domUtils = Services.domUtils 
		var rt=mWindow,pw=mWindow
		while(rt){
			rt=domUtils.getParentForNode(rt.document,false)
			rt=rt&&rt.ownerDocument.defaultView
			if(rt)
				pw=rt
		}
		return pw
	}
}

WindowListener={
	onOpenWindow: function(aWindow){
		// Wait for the window to finish loading
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal||Ci.nsIDOMWindow).window;
		lightStarter.init(domWindow)
		dump(domWindow)
	},
	onCloseWindow: function(aWindow){ },
	onWindowTitleChange: function(aWindow, aTitle){ }
}
startup()

function startup(aData, aReason) {
	// Load into any existing windows
	let enumerator = Services.wm.getEnumerator("navigator:browser");
	while(enumerator.hasMoreElements()) {
		let win = enumerator.getNext();
		lightStarter.init(win)
	}
	// Load into all new windows
	Services.wm.addListener(WindowListener);
}

function shutdown(aData, aReason) {
	//if (aReason == APP_SHUTDOWN)return;
		
	let wm = Services.wm;	
	// Unload from any existing windows
	let enumerator = Services.wm.getEnumerator("navigator:browser");
	while(enumerator.hasMoreElements()) {
		let win = enumerator.getNext();
	}
	Services.wm.removeListener(WindowListener);
}

