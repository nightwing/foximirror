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


var addDevelopmentUtils = function(window){
	//window.toOpenWindowByType = toOpenWindowByType;
	//window.toOpenWindowByURI = toOpenWindowByURI;
	
}
//***********************exported functions
function toOpenWindowByType(inType, uri, features) {
    var windowManager = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
    var topWindow = windowManager.getMostRecentWindow(inType);
	if(topWindow&&(topWindow!=window)){
        topWindow.focus();
    }else if(features){
        window.open(uri, "_blank", features);
    }else{
        window.open(uri, "_blank", "modal=no,chrome,extrachrome,menubar,resizable=yes,scrollbars,status,toolbar");
    }
}
toOpenWindowByURI =function (uri) {
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
    window.open(uri, "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
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