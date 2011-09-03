var Cc	= Components.classes;
var Ci	= Components.interfaces;
var Cu	= Components.utils;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
var ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)

function editProtocolHandler(){}

editProtocolHandler.prototype = {
	scheme: 'edit',
	classDescription: "edit anything",
	classID: Components.ID("01234567-1234-1234-1234-123456789ABC"),
	contractID: "@mozilla.org/network/protocol;1?name=edit",
	editorURI: 'chrome://shadia/content/ace++/edit-protocol-editor.html',
	defaultPort: -1,
	protocolFlags: Ci.nsIProtocolHandler.URI_NORELATIVE | Ci.nsIProtocolHandler.URI_IS_UI_RESOURCE,
	allowPort: function(port, scheme) false,
	get chromePrincipal() {
		delete editProtocolHandler.prototype.chromePrincipal
		return editProtocolHandler.prototype.chromePrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal)
	},
  
	newURI : function (spec, charset, baseURI){
		dump('********',spec, charset, baseURI)
		if(spec.indexOf(':')==-1&& baseURI){
			dump(spec, charset, baseURI.spec)
			return ios.newURI(spec, null, 
				ios.newURI(this.editorURI ,null,null)
			);
		}
		//var a = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL)
		var a = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI)
		a.spec = 'edit:#'+(spec.match(/edit:\/*#*(.*)/)||[,''])[1]
		return a   
	},
  
	newChannel : function(uri){
		dump('---------------------',uri.spec)
		try {
			var uriString = uri.spec.toLowerCase();
			if(uriString == 'edit:#alert'){
    			let stream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream)
				let content = '<script>alert(Components.utils.reportError("asas"))</script>response.content'
				stream.setData(content, content.length)
				let channel = Cc["@mozilla.org/network/input-stream-channel;1"].createInstance(Ci.nsIInputStreamChannel)
				channel.contentStream = stream
				channel.QueryInterface(Ci.nsIChannel)
				channel.setURI(uri)
				channel.originalURI = uri
                channel.owner = this.chromePrincipal
                return channel;
			}
			if (uriString.indexOf(this.scheme) == 0) {           
				var extUri = ios.newURI(this.editorURI, null, null);
				var extChannel = ios.newChannelFromURI(extUri);
				extChannel.originalURI = uri;
				return extChannel;
			}
		}catch(e){
			throw Components.results.NS_ERROR_FAILURE;
		}
	},
  
	QueryInterface : function(iid) {
		if (!iid.equals(Ci.nsIProtocolHandler) && !iid.equals(Ci.nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	}
};
if (XPCOMUtils.generateNSGetFactory)
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([editProtocolHandler]);
else
	var NSGetModule = NSGetFactory = XPCOMUtils.generateNSGetModule([editProtocolHandler]);

/*;(function(){
	var reg = Components.manager.QueryInterface(Ci.nsIComponentRegistrar)
	var CONTRACT_ID = editProtocolHandler.prototype.contractID
	try{
		reg.unregisterFactory(
			reg.contractIDToCID(CONTRACT_ID),
			reg.getClassObjectByContractID(CONTRACT_ID, Ci.nsISupports)
		)
	}catch(e){}
	var o = editProtocolHandler.prototype
	var factory = NSGetFactory(o.classID)
	reg.registerFactory(o.classID, o.classDescription, o.contractID, factory);
})();*/

function dump() {
    var aMessage = "aMessage: ";
    for (var i = 0; i < arguments.length; ++i) {
        var a = arguments[i];
        aMessage += (a && !a.toString ? "[object call]" : a) + " , ";
    }
    var consoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);
    consoleService.logStringMessage("" + aMessage);
}

dump(NSGetFactory)


/*

let stream = inputStream.createInstance(Ci.nsIStringInputStream)
    let content = '<script>alert(1)</script>response.content'
    stream.setData(content, content.length)
    channel = streamChannel.createInstance(Ci.nsIInputStreamChannel)
    channel.contentStream = stream
    channel.QueryInterface(Ci.nsIChannel)

    channel.setURI(uri)
channel.originalURI

*/