let EXPORTED_SYMBOLS = ["Services", "shadia"];

var Ci = Components.interfaces;
var Cc = Components.classes;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

try{
	Components.utils.import("resource://gre/modules/Services.jsm");
}catch(e){
	// shim for v<4
	Components.utils.import("resource://shadia/Services.jsm");
}
XPCOMUtils.defineLazyServiceGetter(Services, "jsd", "@mozilla.org/js/jsd/debugger-service;1", "jsdIDebuggerService");
XPCOMUtils.defineLazyServiceGetter(Services, "chromeReg", "@mozilla.org/chrome/chrome-registry;1", "nsIXULOverlayProvider");
XPCOMUtils.defineLazyServiceGetter(Services, "domUtils", "@mozilla.org/inspector/dom-utils;1", "inIDOMUtils");
XPCOMUtils.defineLazyServiceGetter(Services, "sss", "@mozilla.org/content/style-sheet-service;1", "nsIStyleSheetService");
XPCOMUtils.defineLazyServiceGetter(Services, "atom", "@mozilla.org/atom-service;1", "nsIAtomService");


var addDevelopmentUtils = function(window){
	//window.toOpenWindowByType = toOpenWindowByType;
	window.toOpenWindowByURI = toOpenWindowByURI;
	window.dump = dump
	if(!('Cc' in window))
		window.Cc=Components.classes
	if(!('Ci' in window))
		window.Ci=Components.interfaces
	if(!('Cu' in window))
		window.Cu=Components.utils
}

/****************************************************************
 * exported functions
 *
 *****************/
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
	Services.ww.openWindow(
		null, uri, "_blank",
		features||"chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar,centerscreen", null
	).focus();
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