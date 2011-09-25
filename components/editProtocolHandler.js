//  edit:@key`flag!`contentType?query#index
//  edit:@key`flag.ext?query#index
//  edit:anything  -> edit:#anything

var Cc = Components.classes;
var Ci = Components.interfaces;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://shadia/main.js");


$shadia.editGlue = {
	// https://developer.mozilla.org/en/Sample_.htaccess_file
	// Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService).getTypeFromExtension('xhtml')
	contentTypes: {
		xul: 'application/vnd.mozilla.xul+xml',
		xhtml: 'application/xhtml+xml',
		xslt: 'application/xml',
		html: 'text/html',
		htm: 'text/html',
		xml: 'text/xml',
		svg: 'image/svg+xml',
		css: 'text/css',
		js: 'text/javascript',
	},
	data: {},
    servers: {},
	setDataSource: function(flag, data){
		flag = flag.toLowerCase()
		this.data[flag] = data
	},
	
	getData: function(flag){
		this.contentType = ''
		// remove index
		flag = flag.toLowerCase().replace(indexRe, '')
		// get query
		var i = flag.indexOf('?')
		if(i!=-1){			 
			var query = flag.substr(i + 1)
			flag = flag.substring(0, i)
		}
		// get key
		i = flag.indexOf('`')
		if(i != -1){
			var key = flag.substring(0, i)
			flag = flag.substr(i + 1)
			
			//get contentType
			i = flag.lastIndexOf('!`')
			if(i != -1){			 
				var c = flag.substr(i + 2)
				this.contentType = c				
				flag = flag.substring(0, i)
			}else{
				// or extension
				i = flag.lastIndexOf('.')
				if(i != -1){
					var c = flag.substr(i + 1)
					this.contentType = this.contentTypes[c] || ''
					flag = flag.substring(0, i)
				}
			}
		}

		
		var content = this.data[key || flag]
		
		if (typeof content == 'function') {			
			try{
				content = content(flag, query, this)
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
	reloadMessage: '<html>=== no data is avaliable yet===<br><button onclick=window.location.reload()>reload',
	
	getServer: function(flag){
		var i = flag.indexOf('`')
		if(i==-1){
			var serverName = flag
			var q
		}else{
			var serverName = flag.substring(0, i)
			var q =  flag.substr(i+1)
		}
		var server = this.servers[serverName]
		if(!server){
			return 'chrome://shadia/content/edit-protocol-server.html'            
		}
		return server + q
	}
}

$shadia.editGlue.servers[1]="file:///D:/ffaddons/orion.client/bundles/org.eclipse.orion.client.editor/web"

indexRe = /#\.*$/
qRe = /\?.*$/
fRe = /[^\/`]*$/
bRe = /[\/#?].*$/
editRe = /e(dit)?:\/*#*/i

function editProtocolHandler(){}

editProtocolHandler.prototype = {
	scheme: 'edit',
	classDescription: "edit anything",
	classID: Components.ID("01234567-1234-1234-1234-123456789ABC"),
	contractID: "@mozilla.org/network/protocol;1?name=edit",
	editorURI: 'chrome://shadia/content/ace++/edit-protocol-editor.html',
	defaultPort: -1,
	
	protocolFlags: Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE    //URI_DANGEROUS_TO_LOAD
				 | Ci.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE
				 | Ci.nsIProtocolHandler.URI_NON_PERSISTABLE,
	allowPort: function(port, scheme) false,
	
	get chromePrincipal() {
		delete editProtocolHandler.prototype.chromePrincipal
		return editProtocolHandler.prototype.chromePrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal)
	},
	get nullPrincipal() {
		delete editProtocolHandler.prototype.nullPrincipal
		//return editProtocolHandler.prototype.nullPrincipal = Cc["@mozilla.org/nullprincipal;1"].createInstance(Ci.nsIPrincipal)

		delete editProtocolHandler.prototype.nullPrincipal
		return editProtocolHandler.prototype.nullPrincipal = Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal) 
		// Cc["@mozilla.org/scriptsecuritymanager;1"].getService(Ci.nsIScriptSecurityManager).getCodebasePrincipal(makeURI('edit:~'))
	},	
  
	newURI : function (spec, charset, baseURI){
		dump('********',spec, charset, baseURI)
		if (spec.indexOf(':') == -1 && baseURI){
			var base = baseURI.spec
					dump('********--',spec, base)

			if (base[5] == '#')
				return Services.io.newURI(spec, null, 
					Services.io.newURI(this.editorURI ,null,null)
				);
			if (spec[0] == '#')
				spec = base.replace(indexRe, '') + spec
			else if (spec[0] == '?')
				spec = base.replace(qRe, '') + spec
			else if (spec[0] == '/')
				spec = base.replace(bRe, '') + spec
			else
				spec = base.replace(qRe, '').replace(fRe, '') + spec
		}

		var a = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI)
		spec = spec.replace(editRe, '')
		if (spec[0] == '@' || spec[0] == '~') {
			spec = 'edit:' + spec
		} else {
			spec = 'edit:#' + spec
		}
		
		a.spec = spec
		return a
	},
  
	newChannel : function(uri){
        dump(1)
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
			if (flag == '~') {
				uriString = $shadia.editGlue.getServer(uriString)
				// check for self reference
				if(uriString[0] == 'e')
					uriString = 'about:blank'
				var extUri = Services.io.newURI(uriString, null, null);
				var extChannel = Services.io.newChannelFromURI(extUri);
				extChannel.originalURI = uri;
                extChannel.owner = this.nullPrincipal
				return extChannel;
			}
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

/**** reload ****
;(function(){
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
/*
$shadia.editGlue.getServer('1`/io')

u=Services.io.newURI('edit:~1', null, null)
//u=Services.io.newURI('edit:', null, null)

u.resolve('#as')
*/
dump = $shadia.dump