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
	if(href.substring(0,15)=='chrome://shadia'||href=='chrome://global/content/console.xul'){
		for each(var i in ["getLocalFile","makeReq","viewFileURI","npp"]){
			window[i]=this[i]
		}
	}
}

/** **************************************************************
 *    exported functions 
 ** ********************** **/
toOpenWindowByURI =function (uri, features) {
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
openWindow =function (uri, features){
	return Services.ww.openWindow(
		null, uri, "_blank",
		features||"chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar,centerscreen", null
	)
}
dump = function(){
    var aMessage="aMessage: ";
    for(var i=0,l=arguments.length; i<l; ++i){
		var a=arguments[i]
        aMessage += (a&&!a.toString?'[object call]':a) + " , ";
    }
    Services.console.logStringMessage("" + aMessage);
}
dump.trace = function(){
    var aMessage="aMessage: ";
    for(var i=0,l=arguments.length; i<l; ++i){
		var a=arguments[i]
        aMessage += (a&&!a.toString?'[object call]':a) + " , ";
    }
    Services.console.logStringMessage("" + aMessage);
}
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
	Services.wm.getMostRecentWindow(null).openDialog("chrome://global/content/viewSource.xul", "_blank", "all,dialog=no", selectedURI, null, null, lineNumber, null);
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
			var proceed = this.archivePrompt(uri, line, column)
			if(!proceed)
				return;
			file = extractRelative(uri)
		}
		
		if(!file)
			return		
		
		file.QueryInterface(Ci.nsILocalFile)
		
		if(file.isDirectory())
			return file.launch()
		
		// launch editor
		var filePath = file.path		
		var args = this.$initArgs(filePath, line, column, editor.cmdline)
		var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);	
		file.initWithPath(nppItem.executable);	
		// create an nsIProcess
		var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
		process.init(file);	
		process.run(false, args, args.length);
	},
	archivePrompt: function(uri, line, column){		
		var arr=['extract file and edit', 'show archive', 'open with view-source:', 'open with edit:']
		var sel={}
		Services.prompt.select(null, 'file is in archive', 'what do you want to do',
			arr.length, arr,
			sel
		)
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
	
	} 

}
extractRelative = function(uri){
	dump(uri.spec)
}

//compatibilty shim
npp=function(path,line){
	externalEditors.edit(path,line)	
}


//******************************************************************************************************//
reloadModule = function(href){
	var bp = Cu.import(href)
	// query needed to confuse startupcache in ff 8.0+ 
	Services.scriptloader.loadSubScript(href+'?'+Date.now(), bp);
	return bp
}

