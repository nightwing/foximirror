var Cc	= Components.classes;
var Ci	= Components.interfaces;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://shadia/main.js");
Components.utils.import("resource://gre/modules/Services.jsm");

$shadia.editGlue = {
	data: {},
	setDataSource: function(flag, data){
		flag = flag.toLowerCase()
		this.data[flag] = data		
	},
	getData: function(flag){
		flag = flag.toLowerCase()
		this.contentType = ''
		var content = this.data[flag]
		
		if (typeof content == 'function') {			
			try{
				content = content(flag, this)
			}catch(e){
				content = this.reloadMessage +'<br>' +e
				this.contentType = ''
			}
		}
		
		if(typeof content != 'string' || !content){
			content = this.reloadMessage
			this.contentType = ''
		}
		return content
	},
	removeDataSource: function(flag){
		flag = flag.toLowerCase()
		delete this.data[flag]
	},
	reloadMessage: '<html>=== data is not avaliable yet===<br><button onclick=window.location.reload()>reload'
}
function editProtocolHandler(){}

editProtocolHandler.prototype = {
	scheme: 'edit',
	classDescription: "edit anything",
	classID: Components.ID("01234567-1234-1234-1234-123456789ABC"),
	contractID: "@mozilla.org/network/protocol;1?name=edit",
	editorURI: 'chrome://shadia/content/ace++/edit-protocol-editor.html',
	defaultPort: -1,
	
	protocolFlags: Ci.nsIProtocolHandler.URI_NORELATIVE
				 | Ci.nsIProtocolHandler.URI_IS_UI_RESOURCE    //URI_DANGEROUS_TO_LOAD
				 | Ci.nsIProtocolHandler.URI_NON_PERSISTABLE,
	allowPort: function(port, scheme) false,
	
	get chromePrincipal() {
		delete editProtocolHandler.prototype.chromePrincipal
		return editProtocolHandler.prototype.chromePrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal)
	},
	
	editRe: /e(dit)?:\/*#*/i,
  
	newURI : function (spec, charset, baseURI){
		//dump('********',spec, charset, baseURI)
		if (spec.indexOf(':') == -1 && baseURI){
			//dump(spec, charset, baseURI.spec)
			if (baseURI.spec[5] == '#')
				return Services.io.newURI(spec, null, 
					Services.io.newURI(this.editorURI ,null,null)
				);
			spec = baseURI.spec.replace(/#\.*$/, '') + spec
			//spec = 'edit:@' + spec
		}

		var a = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI)
		spec = spec.replace(this.editRe, '')
		if (spec[0] == '@'){
			spec = 'edit:@' + spec.substr(1)
		} else {
			spec = 'edit:#' + spec
		}
		
		a.spec = spec
		return a
	},
  
	newChannel : function(uri){
		//dump('---------------------',uri.spec)
		try {
			var uriString = uri.spec.toLowerCase();
			if (uriString.substring(0, 5) != 'edit:'){
				throw Components.results.NS_ERROR_FAILURE;
			}
			var flag = uriString[5]
			if (flag == '#') {           
				var extUri = Services.io.newURI(this.editorURI, null, null);
				var extChannel = Services.io.newChannelFromURI(extUri);
				extChannel.originalURI = uri;
				return extChannel;
			}
			uriString = uriString.substr(6)
			//var i = uriString.indexOf('!@!')
			
			if (flag == '@') {
    			let stream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream)
				var content = $shadia.editGlue.getData(uriString)
				 
				
				stream.setData(content, content.length)
				let channel = Cc["@mozilla.org/network/input-stream-channel;1"].createInstance(Ci.nsIInputStreamChannel)
								
				channel.contentStream = stream
				channel.QueryInterface(Ci.nsIChannel)
				channel.setURI(uri)
				channel.originalURI = uri
                channel.owner = this.chromePrincipal
				
				// set this at the very end otherwise error is thrown
				let ct = $shadia.editGlue.contentType
				if (ct)
					channel.contentType = ct

                return channel;
			}
			throw Components.results.NS_ERROR_FAILURE;
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

dump = $shadia.dump