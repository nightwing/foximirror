kCM_SRV = Components.classes["@mozilla.org/categorymanager;1"].
    		getService(Components.interfaces.nsICategoryManager);
            
f=kCM_SRV.enumerateCategories()

f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data

f=kCM_SRV.enumerateCategory('agent-style-sheets')

f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data

kCM_SRV.getCategoryEntry('agent-style-sheets', 'pluginGlue-pluginFinder')
kCM_SRV.getCategoryEntry('command-line-handler', 'b-jsconsole')
kCM_SRV.getCategoryEntry('command-line-handler', 'b-jsconsole')

// classInfo obj.QueryInterface(Ci.nsIClassInfo)
var cii=[]
cii.splice(cii.indexOf(Ci.nsISupports),1)
for each(var i in Ci) {
    cii.push(i);
}
cii.splice(cii.indexOf(Ci.nsISupports), 1)
function supportedInterfaces(element) {
    var ans = [];
    for(var i = cii.length;i--;) {
		var p = cii[i]
		try {
			if (element instanceof p) {
				ans.push(p.name);
			}
		}catch(e){
			Components.utils.reportError(e);
		}
	}
    return ans;
}


// These are needed because some Component access crash FF window.dump("get service "+this.nsIJSCID.name+"\n");
ComponentClassCrashers = ["@mozilla.org/generic-factory;1", "QueryInterface", "@mozilla.org/dom/storage;2"];
ComponentInterfaceCrashers = ["IDispatch"];


function getserviceOrCreateInstance(p){
	if(ComponentClassCrashers.indexOf(p.name) != -1)
		return "crasher";
	try{
		var obj = Cc[p.name].getService(Ci.nsISupports);
	}catch(e){
		try{
			obj = Cc[p.name].createInstance(Ci.nsISupports);
		}catch(e){
			return "not a service or object";
		}
	}
    return obj;
}


var comp2iface = {}
buildComponentMap = function(){
	var nsIJSCID = Ci.nsIJSCID
	comp2iface = {}
	for(var i in Cc){
		if(i.indexOf('intl/unicode')>0)
			continue
		if(Cc[i] instanceof nsIJSCID)
			comp2iface[i] = supportedInterfaces(getserviceOrCreateInstance(Cc[i]))
		else
			dump(i)
	}
	var a=[]
	for (i in comp2iface){
		a.push({name: i, ob:comp2iface[i]})
	}
	a=a.sort(function(a,b){
		var x = a.ob.length-b.ob.length
		return x
	})

	var c={}
	for(i in a){
		p=a[i]
		c[p.name]=p.ob
	}

	return JSON.stringify(c,null,4)
}

buildComponentMap()






iname = 'nsIUpdateChecker'
t=makeReq('http://mxr.mozilla.org/mozilla-central/ident?i='+iname+'&tree=mozilla-central&filter=.idl')

href = t.match(/href="([^"]*.idl)"/)[1]

makeReq('http://mxr.mozilla.org/'+href+'?raw=1')












comp2iface = {
    "@mozilla.org/intl/unicharcategory;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=ukprob": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=image/svg+xml": [],
    "@mozilla.org/intl/charsetdetect;1?type=ruprob": [],
    "@mozilla.org/intl/charsetalias;1": [],
    "@mozilla.org/startupcache/cache;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=ko_parallel_state_machine": [],
    "@mozilla.org/intl/platformcharset;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=cjk_parallel_state_machine": [],
    "@mozilla.org/content/post-content-iterator;1": [],
    "@mozilla.org/jsctypes;1": [],
    "@mozilla.org/network/auth-module;1?name=ntlm": [],
    "@mozilla.org/byte-buffer;1": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/html": [],
    "@mozilla.org/network/auth-module;1?name=sasl-gssapi": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zhcn_parallel_state_machine": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=cjk_parallel_state_machine": [],
    "@mozilla.org/gfx/devicecontextspec;1": [],
    "@mozilla.org/network/auth-module;1?name=negotiate-sspi": [],
    "@mozilla.org/security/script/nameset;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=zhcn_parallel_state_machine": [],
    "@mozilla.org/widgets/window/win;1": [],
    "@mozilla.org/network/auth-module;1?name=kerb-gss": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/xhtml+xml": [],
    "@mozilla.org/intl/unicharutil;1": [],
    "@mozilla.org/intl/datetimeformat;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=zh_parallel_state_machine": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/plain": [],
    "@mozilla.org/intl/charsetdetect;1?type=zhtw_parallel_state_machine": [],
    "@mozilla.org/jsreflect;1": [],
    "@mozilla.org/nsCMSDecoder;1": [],
    "@mozilla.org/intl/charsetdetect;1?type=ja_parallel_state_machine": [],
    "@mozilla.org/intl/nslanguageatomservice;1": [],
    "@mozilla.org/dom/storage;2": [],
    "@mozilla.org/parser/parser-service;1": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ukprob": [],
    "@mozilla.org/js/xpc/ContextStackIterator;1": [],
    "@mozilla.org/network/auth-module;1?name=kerb-sspi": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zhtw_parallel_state_machine": [],
    "@mozilla.org/content/range-utils;1": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/xml": [],
    "@mozilla.org/childprocessmessagemanager;1": [],
    "@mozilla.org/layout/htmlsanitizer;1": [],
    "@mozilla.org/intl/wbrk;1": [],
    "@mozilla.org/intl/lbrk;1": [],
    "@mozilla.org/content/namespacemanager;1": [],
    "@mozilla.org/xtf/xtf-service;1": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ruprob": [],
    "@mozilla.org/widgets/child_window/win;1": [],
    "@mozilla.org/content/subtree-content-iterator;1": [],
    "@mozilla.org/content/pre-content-iterator;1": [],
    "@mozilla.org/view-manager;1": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ko_parallel_state_machine": [],
    "@mozilla.org/nsCMSEncoder;1": [],
    "@mozilla.org/spellchecker;1": [],
    "@mozilla.org/url-classifier/jslib;1": [],
    "@mozilla.org/jsperf;1": [],
    "@mozilla.org/layout/form-processor;1": [],
    "@mozilla.org/intl/stringbundle/text-override;1": [],
    "@mozilla.org/widget/toolkit/win;1": [],
    "@mozilla.org/network/auth-module;1?name=sys-ntlm": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/vnd.mozilla.xul+xml": [],
    "@mozilla.org/nsCMSMessage;1": [],
    "@mozilla.org/network/auth-module;1?name=negotiate-gss": [],
    "@mozilla.org/gfx/init;1": [],
    "@mozilla.org/layout/plaintextsink;1": [],
    "@mozilla.org/security/entropy;1": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ja_parallel_state_machine": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=universal_charset_detector": [],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/xml": [],
    "@mozilla.org/intl/charsetdetect;1?type=universal_charset_detector": [],
    "@mozilla.org/xpti/interfaceinfomanager-service;1": [],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zh_parallel_state_machine": [],
    "@mozilla.org/timer;1": [
        "nsITimer"
    ],
    "@mozilla.org/image/tools;1": [
        "imgITools"
    ],
    "@mozilla.org/inspector/dom-utils;1": [
        "inIDOMUtils"
    ],
    "@mozilla.org/xtf/xml-contentbuilder;1": [
        "nsIXMLContentBuilder"
    ],
    "@mozilla.org/toolkit/command-line;1": [
        "nsICommandLine"
    ],
    "@mozilla.org/network/protocol/about;1?what=rights": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/mime-hdrparam;1": [
        "nsIMIMEHeaderParam"
    ],
    "@mozilla.org/network/protocol/about;1?what=config": [
        "nsIAboutModule"
    ],
    "@mozilla.org/download-manager-ui;1": [
        "nsIDownloadManagerUI"
    ],
    "@mozilla.org/content/document-loader-factory;1": [
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/widget/clipboardhelper;1": [
        "nsIClipboardHelper"
    ],
    "@mozilla.org/network/server-socket;1": [
        "nsIServerSocket"
    ],
    "@mozilla.org/intl/saveascharset;1": [
        "nsISaveAsCharset"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=basic": [
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/webnavigation-info;1": [
        "nsIWebNavigationInfo"
    ],
    "@mozilla.org/storage/statement-wrapper;1": [
        "mozIStorageStatementWrapper"
    ],
    "@mozilla.org/system-proxy-settings;1": [
        "nsISystemProxySettings"
    ],
    "@mozilla.org/embedcomp/rangefind;1": [
        "nsIFind"
    ],
    "@mozilla.org/network/protocol;1?name=moz-filedata": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/dom/storage;1": [
        "nsIDOMStorageObsolete"
    ],
    "@mozilla.org/thirdpartyutil;1": [
        "mozIThirdPartyUtil"
    ],
    "@mozilla.org/widget/bidikeyboard;1": [
        "nsIBidiKeyboard"
    ],
    "@mozilla.org/thread-manager;1": [
        "nsIThreadManager"
    ],
    "@mozilla.org/network/protocol/about;1?what=newaddon": [
        "nsIAboutModule"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=application/xml": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/intl/texttosuburi;1": [
        "nsITextToSubURI"
    ],
    "@mozilla.org/network/protocol/about;1?what=buildconfig": [
        "nsIAboutModule"
    ],
    "@mozilla.org/widget/htmlformatconverter;1": [
        "nsIFormatConverter"
    ],
    "@mozilla.org/network/protocol/about;1?what=addons": [
        "nsIAboutModule"
    ],
    "@mozilla.org/updates/update-service-stub;1": [
        "nsIObserver"
    ],
    "@mozilla.org/content/plugin/document-loader-factory;1": [
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/storage/vacuum;1": [
        "nsIObserver"
    ],
    "@mozilla.org/embedcomp/controller-command-group;1": [
        "nsIControllerCommandGroup"
    ],
    "@mozilla.org/network/socket;2?type=starttls": [
        "nsISocketProvider"
    ],
    "@mozilla.org/intl/scriptabledateformat;1": [
        "nsIScriptableDateFormat"
    ],
    "@mozilla.org/network/application-cache-service;1": [
        "nsIApplicationCacheService"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=ntlm": [
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/memory-reporter-manager;1": [
        "nsIMemoryReporterManager"
    ],
    "@mozilla.org/network/socket;2?type=socks": [
        "nsISocketProvider"
    ],
    "@mozilla.org/security/nsscertcache;1": [
        "nsINSSCertCache"
    ],
    "@mozilla.org/url-classifier/utils;1": [
        "nsIUrlClassifierUtils"
    ],
    "@mozilla.org/network/protocol/about;1?what=home": [
        "nsIAboutModule"
    ],
    "@mozilla.org/editor/txtsrvfilter;1": [
        "nsITextServicesFilter"
    ],
    "@mozilla.org/windows-jumplistitem;1": [
        "nsIJumpListItem"
    ],
    "@mozilla.org/network/url-parser;1?auth=yes": [
        "nsIURLParser"
    ],
    "@mozilla.org/network/protocol/about;1?what=sync-tabs": [
        "nsIAboutModule"
    ],
    "@mozilla.org/updates/update-checker;1": [
        "nsIUpdateChecker"
    ],
    "@mozilla.org/widget/lookandfeel;1": [
        "nsIObserver"
    ],
    "@mozilla.org/network/socket;2?type=udp": [
        "nsISocketProvider"
    ],
    "@mozilla.org/widget/idleservice;1": [
        "nsIIdleService"
    ],
    "@mozilla.org/content/dropped-link-handler;1": [
        "nsIDroppedLinkHandler"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=application/xhtml+xml": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/intl/semanticunitscanner;1": [
        "nsISemanticUnitScanner"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=2d": [
        "nsIDOMCanvasRenderingContext2D"
    ],
    "@mozilla.org/scriptableinputstream;1": [
        "nsIScriptableInputStream"
    ],
    "@mozilla.org/network/socket;2?type=ssl": [
        "nsISocketProvider"
    ],
    "@mozilla.org/security/hash;1": [
        "nsICryptoHash"
    ],
    "@mozilla.org/inspector/flasher;1": [
        "inIFlasher"
    ],
    "@mozilla.org/security/crypto;1": [
        "nsIDOMCrypto"
    ],
    "@mozilla.org/cycle-collector-logger;1": [
        "nsICycleCollectorListener"
    ],
    "@mozilla.org/content-pref/hostname-grouper;1": [
        "nsIContentURIGrouper"
    ],
    "@mozilla.org/embedcomp/cookieprompt-service;1": [
        "nsICookiePromptService"
    ],
    "@mozilla.org/network/url-parser;1?auth=maybe": [
        "nsIURLParser"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=image/svg+xml": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/base/telemetry;1": [
        "nsITelemetry"
    ],
    "@mozilla.org/network/application-cache-namespace;1": [
        "nsIApplicationCacheNamespace"
    ],
    "@mozilla.org/js/jsd/debugger-service;1": [
        "jsdIDebuggerService"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=seamonkey": [
        "nsIBrowserProfileMigrator"
    ],
    "@mozilla.org/network/protocol;1?name=place": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/process/environment;1": [
        "nsIEnvironment"
    ],
    "@mozilla.org/security/recentbadcerts;1": [
        "nsIRecentBadCertsService"
    ],
    "@mozilla.org/xmlextras/xmlserializer;1": [
        "nsIDOMSerializer"
    ],
    "@mozilla.org/network/protocol/about;1?what=mozilla": [
        "nsIAboutModule"
    ],
    "@mozilla.org/uuid-generator;1": [
        "nsIUUIDGenerator"
    ],
    "@mozilla.org/js/jsd/app-start-observer;2": [
        "nsIObserver"
    ],
    "@mozilla.org/network/protocol/about;1?what=plugins": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/serialization-helper;1": [
        "nsISerializationHelper"
    ],
    "@mozilla.org/pipe;1": [
        "nsIPipe"
    ],
    "@mozilla.org/network/protocol/about;1?what=logo": [
        "nsIAboutModule"
    ],
    "@mozilla.org/embedcomp/appstartup-notifier;1": [
        "nsIObserver"
    ],
    "@mozilla.org/console-api;1": [
        "nsIDOMGlobalPropertyInitializer"
    ],
    "@mozilla.org/intl/collation-factory;1": [
        "nsICollationFactory"
    ],
    "@mozilla.org/geolocation;1": [
        "nsIDOMGeoGeolocation"
    ],
    "@mozilla.org/network/protocol;1?name=wyciwyg": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/xpcom/version-comparator;1": [
        "nsIVersionComparator"
    ],
    "@mozilla.org/network/protocol/about;1?what=credits": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/protocol;1?name=about": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/content/style-sheet-service;1": [
        "nsIStyleSheetService"
    ],
    "@mozilla.org/properties;1": [
        "nsIProperties"
    ],
    "@mozilla.org/xpcom/ini-processor-factory;1": [
        "nsIINIParserFactory"
    ],
    "@mozilla.org/data-document-content-policy;1": [
        "nsIContentPolicy"
    ],
    "@mozilla.org/toolkit/URLFormatterService;1": [
        "nsIURLFormatter"
    ],
    "@mozilla.org/feed-textconstruct;1": [
        "nsIFeedTextConstruct"
    ],
    "@mozilla.org/base/telemetry-ping;1": [
        "nsIObserver"
    ],
    "@mozilla.org/security/keyobjectfactory;1": [
        "nsIKeyObjectFactory"
    ],
    "@mozilla.org/toolkit/console-clh;1": [
        "nsICommandLineHandler"
    ],
    "@mozilla.org/updates/update-prompt;1": [
        "nsIUpdatePrompt"
    ],
    "@mozilla.org/intl/nslocaleservice;1": [
        "nsILocaleService"
    ],
    "@mozilla.org/rdf/content-sink;1": [
        "nsIExpatSink"
    ],
    "@mozilla.org/network/protocol/about;1?what=permissions": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/protocol;1?name=data": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/js/xpc/ID;1": [
        "nsIJSID"
    ],
    "@mozilla.org/network/protocol/about;1?what=blocked": [
        "nsIAboutModule"
    ],
    "@mozilla.org/atom-service;1": [
        "nsIAtomService"
    ],
    "@mozilla.org/feed-result;1": [
        "nsIFeedResult"
    ],
    "@mozilla.org/userinfo;1": [
        "nsIUserInfo"
    ],
    "@mozilla.org/security/crlmanager;1": [
        "nsICRLManager"
    ],
    "@mozilla.org/xpfe/http-index-format-factory-constructor": [
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/nsFormSigningDialog;1": [
        "nsIFormSigningDialog"
    ],
    "@mozilla.org/security/hmac;1": [
        "nsICryptoHMAC"
    ],
    "@mozilla.org/rdf/serializer;1?format=ntriples": [
        "rdfISerializer"
    ],
    "@mozilla.org/nsCMSSecureMessage;1": [
        "nsICMSSecureMessage"
    ],
    "@mozilla.org/user_cert_picker;1": [
        "nsIUserCertPicker"
    ],
    "@mozilla.org/browser/final-clh;1": [
        "nsICommandLineHandler"
    ],
    "@mozilla.org/intl/entityconverter;1": [
        "nsIEntityConverter"
    ],
    "@mozilla.org/network/socket-provider-service;1": [
        "nsISocketProviderService"
    ],
    "@mozilla.org/find/find_service;1": [
        "nsIFindService"
    ],
    "@mozilla.org/windows-registry-key;1": [
        "nsIWindowsRegKey"
    ],
    "@mozilla.org/intl/scriptableunicodeconverter": [
        "nsIScriptableUnicodeConverter"
    ],
    "@mozilla.org/login-manager/crypto/SDR;1": [
        "nsILoginManagerCrypto"
    ],
    "@mozilla.org/editor/txtsrvfiltermail;1": [
        "nsITextServicesFilter"
    ],
    "@mozilla.org/pref-relativefile;1": [
        "nsIRelativeFilePref"
    ],
    "@mozilla.org/gfx/printsession;1": [
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/protocol;1?name=moz-anno": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/network/protocol;1?name=edit": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/charset-converter-manager;1": [
        "nsICharsetConverterManager"
    ],
    "@mozilla.org/security/streamcipher;1": [
        "nsIStreamCipher"
    ],
    "@mozilla.org/eventlistenerservice;1": [
        "nsIEventListenerService"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/html": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/layout/content-policy;1": [
        "nsIContentPolicy"
    ],
    "@mozilla.org/embedcomp/command-params;1": [
        "nsICommandParams"
    ],
    "@mozilla.org/uriloader;1": [
        "nsIURILoader"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/plain": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/filepicker;1": [
        "nsIFilePicker"
    ],
    "@mozilla.org/network/protocol/about;1?what=sessionrestore": [
        "nsIAboutModule"
    ],
    "@mozilla.org/addons/web-install-listener;1": [
        "amIWebInstallListener"
    ],
    "@mozilla.org/xpcomproxy;1": [
        "nsIProxyObjectManager"
    ],
    "@mozilla.org/network/proxy-auto-config;1": [
        "nsIProxyAutoConfig"
    ],
    "@mozilla.org/network/protocol/about;1?what=neterror": [
        "nsIAboutModule"
    ],
    "@mozilla.org/xpcom/memory-service;1": [
        "nsIMemory"
    ],
    "@mozilla.org/parental-controls-service;1": [
        "nsIParentalControlsService"
    ],
    "@mozilla.org/no-data-protocol-content-policy;1": [
        "nsIContentPolicy"
    ],
    "@mozilla.org/libjar/zip-reader;1": [
        "nsIZipReader"
    ],
    "@mozilla.org/document-charset-info;1": [
        "nsIDocumentCharsetInfo"
    ],
    "@mozilla.org/network/protocol/about;1?what=privatebrowsing": [
        "nsIAboutModule"
    ],
    "@mozilla.org/readconfig;1": [
        "nsIObserver"
    ],
    "@mozilla.org/network/protocol/about;1?what=memory": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=negotiate": [
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/xpcom/error-service;1": [
        "nsIErrorService"
    ],
    "@mozilla.org/windows-taskbar;1": [
        "nsIWinTaskbar"
    ],
    "@mozilla.org/moz/jssubscript-loader;1": [
        "mozIJSSubScriptLoader"
    ],
    "@mozilla.org/spellchecker/i18nmanager;1": [
        "mozISpellI18NManager"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=moz-webgl": [
        "nsIDOMWebGLRenderingContext"
    ],
    "@mozilla.org/dirIndex;1": [
        "nsIDirIndex"
    ],
    "@mozilla.org/categorymanager;1": [
        "nsICategoryManager"
    ],
    "@mozilla.org/security/datasignatureverifier;1": [
        "nsIDataSignatureVerifier"
    ],
    "@mozilla.org/network/protocol/about;1?what=robots": [
        "nsIAboutModule"
    ],
    "@mozilla.org/browser/default-browser-clh;1": [
        "nsICommandLineHandler"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/xml": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/widget/clipboard;1": [
        "nsIClipboard"
    ],
    "@mozilla.org/io-util;1": [
        "nsIIOUtil"
    ],
    "@mozilla.org/textservices/textservicesdocument;1": [
        "nsIEditActionListener"
    ],
    "@mozilla.org/network/protocol;1?name=javascript": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/browser/annotation-service;1": [
        "nsIAnnotationService"
    ],
    "@mozilla.org/content/2dthebes-canvas-rendering-context;1": [
        "nsIDOMCanvasRenderingContext2D"
    ],
    "@mozilla.org/security/pkcs11;1": [
        "nsIPKCS11"
    ],
    "@mozilla.org/network/protocol/about;1?what=support": [
        "nsIAboutModule"
    ],
    "@mozilla.org/parentprocessmessagemanager;1": [
        "nsIFrameMessageManager"
    ],
    "@mozilla.org/exslt/regexp;1": [
        "txIEXSLTRegExFunctions"
    ],
    "@mozilla.org/network/http-auth-manager;1": [
        "nsIHttpAuthManager"
    ],
    "@mozilla.org/contentsecuritypolicy;1": [
        "nsIContentSecurityPolicy"
    ],
    "@mozilla.org/content-permission/prompt;1": [
        "nsIContentPermissionPrompt"
    ],
    "@mozilla.org/browser/session-history-transaction;1": [
        "nsISHTransaction"
    ],
    "@mozilla.org/security/random-generator;1": [
        "nsIRandomGenerator"
    ],
    "@mozilla.org/rdf/xml-parser;1": [
        "nsIRDFXMLParser"
    ],
    "@mozilla.org/toolkit/default-clh;1": [
        "nsICommandLineHandler"
    ],
    "@mozilla.org/gfx/fontenumerator;1": [
        "nsIFontEnumerator"
    ],
    "@mozilla.org/toolkit/profile-service;1": [
        "nsIToolkitProfileService"
    ],
    "@mozilla.org/observer-service;1": [
        "nsIObserverService"
    ],
    "@mozilla.org/security/keyobject;1": [
        "nsIKeyObject"
    ],
    "@mozilla.org/gfx/printerenumerator;1": [
        "nsIPrinterEnumerator"
    ],
    "@mozilla.org/network/protocol/about;1?what=": [
        "nsIAboutModule"
    ],
    "@mozilla.org/nsSecurityWarningDialogs;1": [
        "nsISecurityWarningDialogs"
    ],
    "@mozilla.org/nschannelpolicy;1": [
        "nsIChannelPolicy"
    ],
    "@mozilla.org/embedcomp/dialogparam;1": [
        "nsIDialogParamBlock"
    ],
    "@mozilla.org/layout/xul-boxobject;1": [
        "nsIBoxObject"
    ],
    "@mozilla.org/gfx/screenmanager;1": [
        "nsIScreenManager"
    ],
    "@mozilla.org/rdf/container;1": [
        "nsIRDFContainer"
    ],
    "@mozilla.org/network/protocol/about;1?what=feeds": [
        "nsIAboutModule"
    ],
    "@mozilla.org/streamConverters;1": [
        "nsIStreamConverterService"
    ],
    "@mozilla.org/network/socket;2?type=socks4": [
        "nsISocketProvider"
    ],
    "@mozilla.org/editor/editorspellchecker;1": [
        "nsIEditorSpellCheck"
    ],
    "@mozilla.org/redirectchannelregistrar;1": [
        "nsIRedirectChannelRegistrar"
    ],
    "@mozilla.org/intl/collation;1": [
        "nsICollation"
    ],
    "@mozilla.org/widget/transferable;1": [
        "nsITransferable"
    ],
    "@mozilla.org/windows-jumplistbuilder;1": [
        "nsIJumpListBuilder"
    ],
    "@mozilla.org/docshell/structured-clone-container;1": [
        "nsIStructuredCloneContainer"
    ],
    "@mozilla.org/files/formdata;1": [
        "nsIDOMFormData"
    ],
    "@mozilla.org/rdf/container-utils;1": [
        "nsIRDFContainerUtils"
    ],
    "@mozilla.org/network/protocol;1?name=feed": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/chrome/chrome-native-theme;1": [
        "nsITimerCallback"
    ],
    "@mozilla.org/network/protocol/about;1?what=crashes": [
        "nsIAboutModule"
    ],
    "@mozilla.org/satchel/inputlist-autocomplete;1": [
        "nsIInputListAutoComplete"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=opera": [
        "nsIBrowserProfileMigrator"
    ],
    "@mozilla.org/devicemotion;1": [
        "nsIDeviceMotion"
    ],
    "@mozilla.org/places/categoriesStarter;1": [
        "nsIObserver"
    ],
    "@mozilla.org/xul/xul-prototype-cache;1": [
        "nsIObserver"
    ],
    "@mozilla.org/toolkit/profile-migrator;1": [
        "nsIProfileMigrator"
    ],
    "@mozilla.org/embedding/browser/content-policy;1": [
        "nsIContentPolicy"
    ],
    "@mozilla.org/network/protocol/about;1?what=certerror": [
        "nsIAboutModule"
    ],
    "@mozilla.org/network/url-parser;1?auth=no": [
        "nsIURLParser"
    ],
    "@mozilla.org/network/protocol/about;1?what=license": [
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/utf8converterservice;1": [
        "nsIUTF8ConverterService"
    ],
    "@mozilla.org/nss_errors_service;1": [
        "nsINSSErrorsService"
    ],
    "@mozilla.org/network/effective-tld-service;1": [
        "nsIEffectiveTLDService"
    ],
    "@mozilla.org/content-dispatch-chooser;1": [
        "nsIContentDispatchChooser"
    ],
    "@mozilla.org/network/authprompt-adapter-factory;1": [
        "nsIAuthPromptAdapterFactory"
    ],
    "@mozilla.org/gfx/region;1": [
        "nsIScriptableRegion"
    ],
    "@mozilla.org/geolocation/gpsd/provider;1": [
        "nsIGeolocationProvider"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=digest": [
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/network/cache-service;1": [
        "nsICacheService"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=experimental-webgl": [
        "nsIDOMWebGLRenderingContext"
    ],
    "@mozilla.org/network/protocol/about;1?what=blank": [
        "nsIAboutModule"
    ],
    "@mozilla.org/autocomplete/search;1?name=places-tag-autocomplete": [
        "nsIAutoCompleteSearch"
    ],
    "@mozilla.org/security/pk11tokendb;1": [
        "nsIPK11TokenDB"
    ],
    "@mozilla.org/network/protocol;1?name=view-source": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/rdf/datasource;1?name=files": [
        "nsIRDFDataSource"
    ],
    "@mozilla.org/feed-unescapehtml;1": [
        "nsIScriptableUnescapeHTML"
    ],
    "@mozilla.org/dom/xpath-evaluator;1": [
        "nsIDOMXPathEvaluator"
    ],
    "@mozilla.org/network/protocol/about;1?what=about": [
        "nsIAboutModule"
    ],
    "@mozilla.org/scriptablebase64encoder;1": [
        "nsIScriptableBase64Encoder"
    ],
    "@mozilla.org/dom/json;1": [
        "nsIJSON"
    ],
    "@mozilla.org/consoleservice;1": [
        "nsIConsoleService"
    ],
    "@mozilla.org/network/protocol;1?name=pcast": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/x-xpinstall": [
        "nsIContentHandler"
    ],
    "@mozilla.org/docshell/urifixup;1": [
        "nsIURIFixup"
    ],
    "@mozilla.org/services-crypto/sync-jpake;1": [
        "nsISyncJPAKE"
    ],
    "@mozilla.org/network/protocol;1?name=moz-safe-about": [
        "nsIProtocolHandler"
    ],
    "@mozilla.org/xul/xul-sort-service;1": [
        "nsIXULSortService"
    ],
    "@mozilla.org/layout/htmlCopyEncoder;1": [
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=ie": [
        "nsIBrowserProfileMigrator",
        "nsINavHistoryBatchCallback"
    ],
    "@mozilla.org/persistent-properties;1": [
        "nsIPersistentProperties",
        "nsIProperties"
    ],
    "@mozilla.org/xmlextras/domparser;1": [
        "nsIDOMParserJS",
        "nsIDOMParser"
    ],
    "@mozilla.org/supports-PRUint64;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRUint64"
    ],
    "@mozilla.org/principal;1": [
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/uriloader/web-handler-app;1": [
        "nsIHandlerApp",
        "nsIWebHandlerApp"
    ],
    "@mozilla.org/sidebar;1": [
        "nsISidebar",
        "nsISidebarExternal"
    ],
    "@mozilla.org/windows-jumplistshortcut;1": [
        "nsIJumpListItem",
        "nsIJumpListShortcut"
    ],
    "@mozilla.org/windows-jumplistseparator;1": [
        "nsIJumpListItem",
        "nsIJumpListSeparator"
    ],
    "@mozilla.org/process/util;1": [
        "nsIObserver",
        "nsIProcess"
    ],
    "@mozilla.org/login-manager/storage/mozStorage;1": [
        "nsIInterfaceRequestor",
        "nsILoginManagerStorage"
    ],
    "@mozilla.org/embedding/browser/nsCommandHandler;1": [
        "nsICommandHandlerInit",
        "nsICommandHandler"
    ],
    "@mozilla.org/sound;1": [
        "nsISound",
        "nsIStreamLoaderObserver"
    ],
    "@mozilla.org/supports-PRUint8;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRUint8"
    ],
    "@mozilla.org/security/nsASN1Tree;1": [
        "nsITreeView",
        "nsIASN1Tree"
    ],
    "@mozilla.org/network/http-activity-distributor;1": [
        "nsIHttpActivityDistributor",
        "nsIHttpActivityObserver"
    ],
    "@mozilla.org/browser/favicon-service;1": [
        "mozIAsyncFavicons",
        "nsIFaviconService"
    ],
    "@mozilla.org/feed-person;1": [
        "nsIFeedElementBase",
        "nsIFeedPerson"
    ],
    "@mozilla.org/network/request-observer-proxy;1": [
        "nsIRequestObserverProxy",
        "nsIRequestObserver"
    ],
    "@mozilla.org/supports-cstring;1": [
        "nsISupportsPrimitive",
        "nsISupportsCString"
    ],
    "@mozilla.org/security/psmdownload;1": [
        "nsIURIContentListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/embedcomp/find;1": [
        "nsIWebBrowserFind",
        "nsIWebBrowserFindInFrames"
    ],
    "@mozilla.org/supports-double;1": [
        "nsISupportsPrimitive",
        "nsISupportsDouble"
    ],
    "@mozilla.org/supports-string;1": [
        "nsISupportsPrimitive",
        "nsISupportsString"
    ],
    "@mozilla.org/pref-localizedstring;1": [
        "nsISupportsString",
        "nsIPrefLocalizedString"
    ],
    "@mozilla.org/geolocation/service;1": [
        "nsIGeolocationUpdate",
        "nsIObserver"
    ],
    "@mozilla.org/updates/update-manager;1": [
        "nsIObserver",
        "nsIUpdateManager"
    ],
    "@mozilla.org/url-classifier/listmanager;1": [
        "nsITimerCallback",
        "nsIUrlListManager"
    ],
    "@mozilla.org/dom/storagemanager;1": [
        "nsIObserver",
        "nsIDOMStorageManager"
    ],
    "@mozilla.org/network/protocol/about;1?what=cache": [
        "nsICacheVisitor",
        "nsIAboutModule"
    ],
    "@mozilla.org/xpcom/ini-parser-factory;1": [
        "nsIFactory",
        "nsIINIParserFactory"
    ],
    "@mozilla.org/gfx/printsettings-service;1": [
        "nsIPrintOptions",
        "nsIPrintSettingsService"
    ],
    "@mozilla.org/security/nsCertTree;1": [
        "nsITreeView",
        "nsICertTree"
    ],
    "@mozilla.org/xul/xul-template-builder;1": [
        "nsIObserver",
        "nsIXULTemplateBuilder"
    ],
    "@mozilla.org/intl/converter-output-stream;1": [
        "nsIConverterOutputStream",
        "nsIUnicharOutputStream"
    ],
    "@mozilla.org/xbl;1": [
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/safebrowsing/application;1": [
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/cookie/permission;1": [
        "nsIObserver",
        "nsICookiePermission"
    ],
    "@mozilla.org/supports-id;1": [
        "nsISupportsPrimitive",
        "nsISupportsID"
    ],
    "@mozilla.org/uriloader/psm-external-content-listener;1": [
        "nsIURIContentListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/globalmessagemanager;1": [
        "nsIChromeFrameMessageManager",
        "nsIFrameMessageManager"
    ],
    "@mozilla.org/appshell/appShellService;1": [
        "nsIObserver",
        "nsIAppShellService"
    ],
    "@mozilla.org/eventsource;1": [
        "nsIDOMEventTarget",
        "nsIEventSource"
    ],
    "@mozilla.org/network/application-cache;1": [
        "nsIApplicationCache",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/login-manager/loginInfo;1": [
        "nsILoginMetaInfo",
        "nsILoginInfo"
    ],
    "@mozilla.org/nullprincipal;1": [
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/inspector/deep-tree-walker;1": [
        "nsIDOMTreeWalker",
        "inIDeepTreeWalker"
    ],
    "@mozilla.org/inspector/dom-view;1": [
        "nsITreeView",
        "inIDOMView"
    ],
    "@mozilla.org/offlinecacheupdate;1": [
        "nsIOfflineCacheUpdate",
        "nsIOfflineCacheUpdateObserver"
    ],
    "@mozilla.org/embedcomp/controller-command-table;1": [
        "nsIControllerCommandTable",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/supports-PRInt32;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRInt32"
    ],
    "@mozilla.org/browser/directory-provider;1": [
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/network/protocol;1?name=chrome": [
        "nsIProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/layout/xul-boxobject-scrollbox;1": [
        "nsIBoxObject",
        "nsIScrollBoxObject"
    ],
    "@mozilla.org/layout/xul-boxobject-tree;1": [
        "nsIBoxObject",
        "nsITreeBoxObject"
    ],
    "@mozilla.org/alerts-service;1": [
        "nsIAlertsProgressListener",
        "nsIAlertsService"
    ],
    "@mozilla.org/browser/shell-service;1": [
        "nsIShellService",
        "nsIWindowsShellService"
    ],
    "@mozilla.org/supports-PRInt64;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRInt64"
    ],
    "@mozilla.org/crypto/fips-info-service;1": [
        "nsICryptoFIPSInfo",
        "nsIPKCS11ModuleDB"
    ],
    "@mozilla.org/network/protocol;1?name=moz-icon": [
        "nsIProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/handler-service;1": [
        "nsIHandlerService",
        "nsIObserver"
    ],
    "@mozilla.org/security/pkcs11moduledb;1": [
        "nsICryptoFIPSInfo",
        "nsIPKCS11ModuleDB"
    ],
    "@mozilla.org/browser/places/import-export-service;1": [
        "nsIPlacesImportExportService",
        "nsINavHistoryBatchCallback"
    ],
    "@adblockplus.org/abp/startup;1": [
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/transformiix-nodeset;1": [
        "txINodeSet",
        "txIXPathObject"
    ],
    "@mozilla.org/dom/indexeddb/manager;1": [
        "nsIIndexedDatabaseManager",
        "nsIObserver"
    ],
    "@mozilla.org/security/x509certdb;1": [
        "nsIX509CertDB2",
        "nsIX509CertDB"
    ],
    "@mozilla.org/windows-jumplistlink;1": [
        "nsIJumpListItem",
        "nsIJumpListLink"
    ],
    "@mozilla.org/websocket;1": [
        "nsIDOMEventTarget",
        "nsIMozWebSocket"
    ],
    "@mozilla.org/appshell/trytoclose;1": [
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/weave/service;1": [
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/widget/appshell/win;1": [
        "nsIObserver",
        "nsIThreadObserver"
    ],
    "@mozilla.org/zipwriter;1": [
        "nsIZipWriter",
        "nsIRequestObserver"
    ],
    "@mozilla.org/supports-float;1": [
        "nsISupportsPrimitive",
        "nsISupportsFloat"
    ],
    "@mozilla.org/network/protocol/about;1?what=sync-log": [
        "nsISupportsWeakReference",
        "nsIAboutModule"
    ],
    "@mozilla.org/embedcomp/printingprompt-service;1": [
        "nsIPrintingPromptService",
        "nsIWebProgressListener"
    ],
    "@mozilla.org/supports-PRInt16;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRInt16"
    ],
    "@mozilla.org/rdf/rdf-service;1": [
        "nsIRDFService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/widget/dragservice;1": [
        "nsIDragSession",
        "nsIDragService"
    ],
    "@mozilla.org/layout/xul-boxobject-menu;1": [
        "nsIBoxObject",
        "nsIMenuBoxObject"
    ],
    "@mozilla.org/layout/xul-boxobject-listbox;1": [
        "nsIBoxObject",
        "nsIListBoxObject"
    ],
    "@mozilla.org/feed-generator;1": [
        "nsIFeedElementBase",
        "nsIFeedGenerator"
    ],
    "@mozilla.org/uriloader/local-handler-app;1": [
        "nsILocalHandlerApp",
        "nsIHandlerApp"
    ],
    "@mozilla.org/js/xpc/Exception;1": [
        "nsIXPCException",
        "nsIException"
    ],
    "@mozilla.org/systemprincipal;1": [
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/login-manager/storage/legacy;1": [
        "nsILoginManagerIEMigrationHelper",
        "nsILoginManagerStorage"
    ],
    "@mozilla.org/cspservice;1": [
        "nsIChannelEventSink",
        "nsIContentPolicy"
    ],
    "@mozilla.org/rdf/resource-factory;1": [
        "nsIRDFResource",
        "nsIRDFNode"
    ],
    "@mozilla.org/supports-PRTime;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRTime"
    ],
    "@mozilla.org/rdf/datasource;1?name=charset-menu": [
        "nsICurrentCharsetListener",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/supports-interface-pointer;1": [
        "nsISupportsPrimitive",
        "nsISupportsInterfacePointer"
    ],
    "@mozilla.org/security/sdr;1": [
        "nsISecretDecoderRing",
        "nsISecretDecoderRingConfig"
    ],
    "@mozilla.org/stsservice;1": [
        "nsIObserver",
        "nsIStrictTransportSecurityService"
    ],
    "@mozilla.org/content/range;1": [
        "nsIDOMNSRange",
        "nsIDOMRange"
    ],
    "@mozilla.org/network/protocol/about;1?what=abp-elemhidehit": [
        "nsIFactory",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/async-stream-copier;1": [
        "nsIRequest",
        "nsIAsyncStreamCopier"
    ],
    "@mozilla.org/spellcheck/dir-provider;1": [
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/supports-PRUint32;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRUint32"
    ],
    "@mozilla.org/supports-PRBool;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRBool"
    ],
    "@mozilla.org/document-transformer;1?type=xslt": [
        "nsIXSLTProcessorPrivate",
        "nsIXSLTProcessor"
    ],
    "@mozilla.org/saxparser/attributes;1": [
        "nsISAXAttributes",
        "nsISAXMutableAttributes"
    ],
    "@mozilla.org/autocomplete/simple-result;1": [
        "nsIAutoCompleteSimpleResult",
        "nsIAutoCompleteResult"
    ],
    "@mozilla.org/array;1": [
        "nsIArray",
        "nsIMutableArray"
    ],
    "@mozilla.org/browser/feeds/result-service;1": [
        "nsIFeedResultService",
        "nsIFactory"
    ],
    "@mozilla.org/recycling-allocator;1": [
        "nsIRecyclingAllocator",
        "nsIMemory"
    ],
    "@mozilla.org/layout/xul-boxobject-popup;1": [
        "nsIBoxObject",
        "nsIPopupBoxObject"
    ],
    "@mozilla.org/xul/xul-controllers;1": [
        "nsIControllers",
        "nsISecurityCheckedComponent"
    ],
    "@mozilla.org/moz/jsloader;1": [
        "nsIObserver",
        "xpcIJSModuleLoader"
    ],
    "@mozilla.org/rdf/xml-serializer;1": [
        "nsIRDFXMLSerializer",
        "nsIRDFXMLSource"
    ],
    "@mozilla.org/helperapplauncherdialog;1": [
        "nsITimerCallback",
        "nsIHelperAppLauncherDialog"
    ],
    "@mozilla.org/satchel/form-autocomplete;1": [
        "nsISupportsWeakReference",
        "nsIFormAutoComplete"
    ],
    "@mozilla.org/xpcom/debug;1": [
        "nsIDebug",
        "nsIDebug2"
    ],
    "@mozilla.org/privatebrowsing-wrapper;1": [
        "nsIObserver",
        "nsIPrivateBrowsingService"
    ],
    "@mozilla.org/embedcomp/window-watcher;1": [
        "nsIPromptFactory",
        "nsIWindowWatcher"
    ],
    "@mozilla.org/security/pkiparamblock;1": [
        "nsIDialogParamBlock",
        "nsIPKIParamBlock"
    ],
    "@mozilla.org/browser/history;1": [
        "nsIObserver",
        "mozIAsyncHistory"
    ],
    "@mozilla.org/transactionmanager;1": [
        "nsITransactionManager",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/variant;1": [
        "nsIVariant",
        "nsIWritableVariant"
    ],
    "@mozilla.org/supports-PRUint16;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRUint16"
    ],
    "@mozilla.org/network/protocol/about;1?what=cache-entry": [
        "nsIAboutModule",
        "nsICacheMetaDataVisitor"
    ],
    "@mozilla.org/supports-char;1": [
        "nsISupportsPrimitive",
        "nsISupportsChar"
    ],
    "@mozilla.org/storagestream;1": [
        "nsIOutputStream",
        "nsIStorageStream"
    ],
    "@mozilla.org/toolkit/native-app-support;1": [
        "nsIObserver",
        "nsINativeAppSupport"
    ],
    "@mozilla.org/supports-void;1": [
        "nsISupportsPrimitive",
        "nsISupportsVoid"
    ],
    "@mozilla.org/inspector/search;1?type=cssvalue": [
        "inISearchProcess",
        "inICSSValueSearch"
    ],
    "": [
        "nsIControllerCommandTable",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/prompter;1": [
        "nsIPromptService2",
        "nsIPromptFactory",
        "nsIPromptService"
    ],
    "@mozilla.org/streamconv;1?from=x-compress&to=uncompressed": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/protocol-proxy-service;1": [
        "nsIObserver",
        "nsIProtocolProxyService",
        "nsIProtocolProxyService2"
    ],
    "@mozilla.org/storage/service;1": [
        "nsIObserver",
        "mozIStorageServiceQuotaManagement",
        "mozIStorageService"
    ],
    "@mozilla.org/network/mime-input-stream;1": [
        "nsIInputStream",
        "nsISeekableStream",
        "nsIMIMEInputStream"
    ],
    "@mozilla.org/passwordmanager/authpromptfactory;1": [
        "nsIObserver",
        "nsIPromptFactory",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/extensions/blocklist;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsIBlocklistService"
    ],
    "@mozilla.org/permissions/contentblocker;1": [
        "nsIObserver",
        "nsIContentPolicy",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/stream-transport-service;1": [
        "nsIObserver",
        "nsIStreamTransportService",
        "nsIEventTarget"
    ],
    "@mozilla.org/js/xpc/RuntimeService;1": [
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/browser/tagging-service;1": [
        "nsIObserver",
        "nsITaggingService",
        "nsINavBookmarkObserver"
    ],
    "@mozilla.org/xul/xul-popup-manager;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsIDOMEventListener"
    ],
    "@mozilla.org/scriptsecuritymanager;1": [
        "nsIScriptSecurityManager",
        "nsIChannelEventSink",
        "nsIObserver"
    ],
    "@mozilla.org/browser/browserglue;1": [
        "nsIObserver",
        "nsIBrowserGlue",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/js/xpc/XPConnect;1": [
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/network/unichar-stream-loader;1": [
        "nsIStreamListener",
        "nsIUnicharStreamLoader",
        "nsIRequestObserver"
    ],
    "@mozilla.org/geolocation/provider;1": [
        "nsITimerCallback",
        "nsIWifiListener",
        "nsIGeolocationProvider"
    ],
    "@mozilla.org/js/xpc/ContextStack;1": [
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/libjar/zip-reader-cache;1": [
        "nsIZipReaderCache",
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/io/multiplex-input-stream;1": [
        "nsIInputStream",
        "nsIMultiplexInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/network/protocol;1?name=resource": [
        "nsIProtocolHandler",
        "nsIResProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/idn-service;1": [
        "nsIObserver",
        "nsIIDNService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/spellchecker/personaldictionary;1": [
        "nsIObserver",
        "nsISupportsWeakReference",
        "mozIPersonalDictionary"
    ],
    "@mozilla.org/streamconv;1?from=compress&to=uncompressed": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/stream-loader;1": [
        "nsIStreamListener",
        "nsIStreamLoader",
        "nsIRequestObserver"
    ],
    "@mozilla.org/psm;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/streamconv;1?from=application/mac-binhex40&to=*/*": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/fuel/application;1": [
        "nsIObserver",
        "extIApplication",
        "fuelIApplication"
    ],
    "@mozilla.org/editor/editingsession;1": [
        "nsIWebProgressListener",
        "nsIEditingSession",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/converter-input-stream;1": [
        "nsIConverterInputStream",
        "nsIUnicharInputStream",
        "nsIUnicharLineInputStream"
    ],
    "@mozilla.org/netwerk/global-channel-event-sink;1": [
        "nsIScriptSecurityManager",
        "nsIChannelEventSink",
        "nsIObserver"
    ],
    "@mozilla.org/permissionmanager;1": [
        "nsIPermissionManager",
        "nsIObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/image/encoder;2?type=image/png": [
        "nsIInputStream",
        "nsIAsyncInputStream",
        "imgIEncoder"
    ],
    "@mozilla.org/login-manager/prompter;1": [
        "nsIAuthPrompt2",
        "nsIAuthPrompt",
        "nsILoginManagerPrompter"
    ],
    "@mozilla.org/streamconv;1?from=multipart/mixed&to=*/*": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/browser/search-service;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsIBrowserSearchService"
    ],
    "@mozilla.org/browser/feeds/sniffer;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIContentSniffer"
    ],
    "@mozilla.org/rdf/datasource;1?name=composite-datasource": [
        "nsIRDFCompositeDataSource",
        "nsIRDFObserver",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/satchel/form-history;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsIFormHistory2"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=deflate": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/simple-stream-listener;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsISimpleStreamListener"
    ],
    "@mozilla.org/network/file-output-stream;1": [
        "nsISeekableStream",
        "nsIFileOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/feed;1": [
        "nsIFeedContainer",
        "nsIFeedElementBase",
        "nsIFeed"
    ],
    "@mozilla.org/binaryoutputstream;1": [
        "nsIObjectOutputStream",
        "nsIBinaryOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/PopupWindowManager;1": [
        "nsIObserver",
        "nsIPopupWindowManager",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/buffered-input-stream;1": [
        "nsIInputStream",
        "nsIBufferedInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=gzip": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/content/dom-selection;1": [
        "nsISelection",
        "nsISupportsWeakReference",
        "nsISelectionPrivate"
    ],
    "@mozilla.org/browser/livemark-service;2": [
        "nsIObserver",
        "nsILivemarkService",
        "nsINavBookmarkObserver"
    ],
    "@mozilla.org/intl/stringbundle;1": [
        "nsIObserver",
        "nsIStringBundleService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/browser/shistory;1": [
        "nsISHistory",
        "nsISHistoryInternal",
        "nsIWebNavigation"
    ],
    "@mozilla.org/network/input-stream-pump;1": [
        "nsIRequest",
        "nsIInputStreamPump",
        "nsIInputStreamCallback"
    ],
    "@mozilla.org/embedcomp/prompt-service;1": [
        "nsIPromptService2",
        "nsIPromptFactory",
        "nsIPromptService"
    ],
    "@mozilla.org/typeaheadfind;1": [
        "nsIObserver",
        "nsITypeAheadFind",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/supports-array;1": [
        "nsICollection",
        "nsISupportsArray",
        "nsISerializable"
    ],
    "@mozilla.org/streamconv;1?from=gzip&to=uncompressed": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/protocol;1?name=jar": [
        "nsIProtocolHandler",
        "nsIJARProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/streamconv;1?from=deflate&to=uncompressed": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/autocomplete/search;1?name=search-autocomplete": [
        "nsIObserver",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteObserver"
    ],
    "@mozilla.org/image/encoder;2?type=image/jpeg": [
        "nsIInputStream",
        "nsIAsyncInputStream",
        "imgIEncoder"
    ],
    "@mozilla.org/network/network-link-service;1": [
        "nsIObserver",
        "nsINetworkLinkService",
        "nsIRunnable"
    ],
    "@mozilla.org/security/certoverride;1": [
        "nsIObserver",
        "nsICertOverrideService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/wifi/monitor;1": [
        "nsIWifiMonitor",
        "nsIObserver",
        "nsIRunnable"
    ],
    "@mozilla.org/content/xmlhttprequest-bad-cert-handler;1": [
        "nsIInterfaceRequestor",
        "nsIBadCertListener2",
        "nsISSLErrorListener"
    ],
    "@mozilla.org/transfer;1": [
        "nsIWebProgressListener2",
        "nsITransfer",
        "nsIWebProgressListener"
    ],
    "@mozilla.org/feed-entry;1": [
        "nsIFeedContainer",
        "nsIFeedEntry",
        "nsIFeedElementBase"
    ],
    "@mozilla.org/streamconv;1?from=x-gzip&to=uncompressed": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/binaryinputstream;1": [
        "nsIInputStream",
        "nsIBinaryInputStream",
        "nsIObjectInputStream"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=x-gzip": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/thread-pool;1": [
        "nsIEventTarget",
        "nsIThreadPool",
        "nsIRunnable"
    ],
    "@mozilla.org/embedcomp/command-manager;1": [
        "nsICommandManager",
        "nsISupportsWeakReference",
        "nsPICommandUpdater"
    ],
    "@mozilla.org/download-manager;1": [
        "nsIObserver",
        "nsIDownloadManager",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/network/protocol;1?name=file": [
        "nsIProtocolHandler",
        "nsIFileProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/offlinecacheupdate-service;1": [
        "nsIObserver",
        "nsIOfflineCacheUpdateService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/http-channel-auth-provider;1": [
        "nsIAuthPromptCallback",
        "nsIHttpChannelAuthProvider",
        "nsICancelable"
    ],
    "@mozilla.org/appshell/window-mediator;1": [
        "nsIObserver",
        "nsIWindowMediator",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/updates/timer-manager;1": [
        "nsIObserver",
        "nsIUpdateTimerManager",
        "nsITimerCallback"
    ],
    "@mozilla.org/scripterror;1": [
        "nsIConsoleMessage",
        "nsIScriptError2",
        "nsIScriptError"
    ],
    "@mozilla.org/uriclassifierservice": [
        "nsIObserver",
        "nsIURIClassifier",
        "nsIUrlClassifierDBService"
    ],
    "@mozilla.org/login-manager;1": [
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsILoginManager"
    ],
    "@mozilla.org/streamconv;1?from=multipart/byteranges&to=*/*": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/content-pref/service;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsIContentPrefService"
    ],
    "@mozilla.org/url-classifier/dbservice;1": [
        "nsIObserver",
        "nsIURIClassifier",
        "nsIUrlClassifierDBService"
    ],
    "@mozilla.org/exceptionservice;1": [
        "nsIObserver",
        "nsIExceptionManager",
        "nsIExceptionService"
    ],
    "@mozilla.org/focus-manager;1": [
        "nsIObserver",
        "nsIFocusManager",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/gfx/info;1": [
        "nsIObserver",
        "nsIGfxInfo",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/protocol;1?name=default": [
        "nsIProtocolHandler",
        "nsIExternalProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/stream-listener-tee;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamListenerTee"
    ],
    "@mozilla.org/network/dns-service;1": [
        "nsIDNSService",
        "nsIObserver",
        "nsPIDNSService"
    ],
    "@mozilla.org/browser/shistory-internal;1": [
        "nsISHistory",
        "nsISHistoryInternal",
        "nsIWebNavigation"
    ],
    "@mozilla.org/network/buffered-output-stream;1": [
        "nsIBufferedOutputStream",
        "nsISeekableStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/updates/update-service;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsIApplicationUpdateService"
    ],
    "@mozilla.org/streamconv;1?from=multipart/x-mixed-replace&to=*/*": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/streamconv;1?from=text/ftp-dir&to=application/http-index-format": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/spellchecker/engine;1": [
        "nsIObserver",
        "mozISpellCheckingEngine",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=rawdeflate": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/browser/sessionstartup;1": [
        "nsIObserver",
        "nsISessionStartup",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/dirIndexParser;1": [
        "nsIDirIndexParser",
        "nsIStreamListener",
        "nsIRequestObserver"
    ],
    "@mozilla.org/network/downloader;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIDownloader"
    ],
    "@mozilla.org/file/local;1": [
        "nsIHashable",
        "nsILocalFileWin",
        "nsIFile",
        "nsILocalFile"
    ],
    "@mozilla.org/network/sync-stream-listener;1": [
        "nsIInputStream",
        "nsIStreamListener",
        "nsISyncStreamListener",
        "nsIRequestObserver"
    ],
    "@mozilla.org/streamconv;1?from=text/plain&to=text/html": [
        "nsIStreamListener",
        "nsITXTToHTMLConv",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/appshell/component/browser-status-filter;1": [
        "nsIWebProgressListener2",
        "nsIWebProgress",
        "nsIWebProgressListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/rdf/datasource;1?name=window-mediator": [
        "nsIObserver",
        "nsIWindowMediatorListener",
        "nsIWindowDataSource",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/css": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/editor/editorcontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/streamconv;1?from=application/http-index-format&to=text/html": [
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/places/expiration;1": [
        "mozIStorageStatementCallback",
        "nsIObserver",
        "nsITimerCallback",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/network/binary-detector;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/network/protocol;1?name=https": [
        "nsIProtocolHandler",
        "nsIHttpProtocolHandler",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/plain": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/protocol;1?name=ftp": [
        "nsIProtocolHandler",
        "nsIObserver",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/autocomplete/controller;1": [
        "nsITreeView",
        "nsITimerCallback",
        "nsIAutoCompleteObserver",
        "nsIAutoCompleteController"
    ],
    "@mozilla.org/system-info;1": [
        "nsIWritablePropertyBag2",
        "nsIPropertyBag",
        "nsIWritablePropertyBag",
        "nsIPropertyBag2"
    ],
    "@mozilla.org/hash-property-bag;1": [
        "nsIWritablePropertyBag2",
        "nsIPropertyBag",
        "nsIWritablePropertyBag",
        "nsIPropertyBag2"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/html": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/url-classifier/hashcompleter;1": [
        "nsIObserver",
        "nsIUrlClassifierHashCompleter",
        "nsISupportsWeakReference",
        "nsIRunnable"
    ],
    "@mozilla.org/embeddor.implemented/web-content-handler-registrar;1": [
        "nsIObserver",
        "nsIWebContentConverterService",
        "nsIFactory",
        "nsIWebContentHandlerRegistrar"
    ],
    "@mozilla.org/toolkit/crash-reporter;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsICrashReporter"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/x-icon": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/bmp": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/partial-file-input-stream;1": [
        "nsIInputStream",
        "nsIPartialFileInputStream",
        "nsILineInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/vnd.microsoft.icon": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/file/directory_service;1": [
        "nsIProperties",
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryService",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/dom/window-controller;1": [
        "nsIController",
        "nsICommandController",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/http-index-format": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/load-group;1": [
        "nsILoadGroup",
        "nsISupportsPriority",
        "nsIRequest",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/png": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/autocomplete/search;1?name=form-history": [
        "nsIDOMEventListener",
        "nsIFormFillController",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteInput"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/xhtml+xml": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/spellchecker-inline;1": [
        "nsIEditActionListener",
        "nsIDOMEventListener",
        "nsIInlineSpellChecker",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/safe-file-output-stream;1": [
        "nsISafeOutputStream",
        "nsISeekableStream",
        "nsIFileOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/svg+xml": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/vnd.mozilla.xul+xml": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/jpg": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/image/request;1": [
        "nsISupportsPriority",
        "nsIRequest",
        "nsISecurityInfoProvider",
        "imgIRequest"
    ],
    "@mozilla.org/browser/session-history-entry;1": [
        "nsIHistoryEntry",
        "nsISHEntryInternal",
        "nsISHEntry",
        "nsISHContainer"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/gif": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/prefetch-service;1": [
        "nsIObserver",
        "nsIPrefetchService",
        "nsIWebProgressListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/rdf/datasource;1?name=local-store": [
        "nsIObserver",
        "nsIRDFRemoteDataSource",
        "nsISupportsWeakReference",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/browser/history-entry;1": [
        "nsIHistoryEntry",
        "nsISHEntryInternal",
        "nsISHEntry",
        "nsISHContainer"
    ],
    "@mozilla.org/embedcomp/base-command-controller;1": [
        "nsIController",
        "nsICommandController",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/plugin/host;1": [
        "nsIObserver",
        "nsITimerCallback",
        "nsIPluginHost",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/xml": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/browser/clh;1": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/io/string-input-stream;1": [
        "nsIInputStream",
        "nsISupportsCString",
        "nsIStringInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/jpeg": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/image/rasterimage;1": [
        "nsIProperties",
        "nsITimerCallback",
        "imgIContainer",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/file-input-stream;1": [
        "nsIInputStream",
        "nsIFileInputStream",
        "nsILineInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/addons/integration;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsITimerCallback",
        "amIWebInstaller"
    ],
    "@mozilla.org/xre/runtime;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsICrashReporter"
    ],
    "@mozilla.org/browser/nav-bookmarks-service;1": [
        "nsIObserver",
        "nsIAnnotationObserver",
        "nsINavBookmarksService",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/txttohtmlconv;1": [
        "mozITXTToHTMLConv",
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/streamconv;1?from=application/x-unknown-content-type&to=*/*": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/network/simple-uri;1": [
        "nsIClassInfo",
        "nsIURI",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.feed&to=*/*": [
        "nsIStreamListener",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/rdf": [
        "nsIBrowserHandler",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/editor/editordocstatecontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/browser/sessionstore;1": [
        "nsIObserver",
        "nsISessionStore",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/content-sniffer;1": [
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.video.feed&to=*/*": [
        "nsIStreamListener",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/satchel/form-fill-controller;1": [
        "nsIDOMEventListener",
        "nsIFormFillController",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteInput"
    ],
    "@mozilla.org/editor/htmleditorcontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/xre/app-info;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsICrashReporter"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.audio.feed&to=*/*": [
        "nsIStreamListener",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/files/filereader;1": [
        "nsIDOMEventTarget",
        "nsIXMLHttpRequestEventTarget",
        "nsIInterfaceRequestor",
        "nsIDOMFileReader"
    ],
    "@mozilla.org/browser/feeds/result-writer;1": [
        "nsIObserver",
        "nsIDOMEventListener",
        "nsINavHistoryObserver",
        "nsIFeedWriter"
    ],
    "@mozilla.org/xul/xul-tree-builder;1": [
        "nsIObserver",
        "nsITreeView",
        "nsIXULTreeBuilder",
        "nsIXULTemplateBuilder"
    ],
    "@mozilla.org/privatebrowsing;1": [
        "nsIObserver",
        "nsICommandLineHandler",
        "nsISupportsWeakReference",
        "nsIPrivateBrowsingService"
    ],
    "@mozilla.org/autocomplete/search;1?name=history": [
        "mozIStorageStatementCallback",
        "nsIObserver",
        "mozIPlacesAutoComplete",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteSimpleResultListener"
    ],
    "@mozilla.org/toolkit/app-startup;1": [
        "nsIObserver",
        "nsIWindowCreator2",
        "nsIWindowCreator",
        "nsISupportsWeakReference",
        "nsIAppStartup"
    ],
    "@mozilla.org/network/protocol;1?name=http": [
        "nsIProtocolHandler",
        "nsIObserver",
        "nsIHttpProtocolHandler",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/rdf/datasource;1?name=in-memory-datasource": [
        "rdfIDataSource",
        "nsIRDFPropagatableDataSource",
        "nsIRDFPurgeableDataSource",
        "nsIRDFInMemoryDataSource",
        "nsIRDFDataSource"
    ],
    "@adblockplus.org/abp/policy;1": [
        "nsIChannelEventSink",
        "nsIObserver",
        "nsIFactory",
        "nsIContentPolicy",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/util;1": [
        "nsIObserver",
        "nsINetUtil",
        "nsIIOService",
        "nsIIOService2",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/accessibleRetrieval;1": [
        "nsIAccessibleRetrieval",
        "nsIObserver",
        "nsIWebProgressListener",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/image/loader;1": [
        "nsIObserver",
        "imgICache",
        "imgILoader",
        "nsISupportsWeakReference",
        "nsIContentSniffer"
    ],
    "@mozilla.org/feed-processor;1": [
        "nsIStreamListener",
        "nsIFeedProcessor",
        "nsISAXContentHandler",
        "nsIRequestObserver",
        "nsISAXErrorHandler"
    ],
    "@mozilla.org/layout/xul-boxobject-container;1": [
        "nsIBrowserBoxObject",
        "nsIBoxObject",
        "nsIIFrameBoxObject",
        "nsIEditorBoxObject",
        "nsIContainerBoxObject"
    ],
    "@mozilla.org/autoconfiguration;1": [
        "nsIObserver",
        "nsIStreamListener",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/cookieService;1": [
        "nsIObserver",
        "nsICookieService",
        "nsICookieManager2",
        "nsISupportsWeakReference",
        "nsICookieManager"
    ],
    "@mozilla.org/xmlextras/xmlhttprequest;1": [
        "nsIDOMEventTarget",
        "nsIJSXMLHttpRequest",
        "nsIXMLHttpRequest",
        "nsIXMLHttpRequestEventTarget",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/cookiemanager;1": [
        "nsIObserver",
        "nsICookieService",
        "nsICookieManager2",
        "nsISupportsWeakReference",
        "nsICookieManager"
    ],
    "@mozilla.org/accessibilityService;1": [
        "nsIAccessibleRetrieval",
        "nsIObserver",
        "nsIWebProgressListener",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/image/cache;1": [
        "nsIObserver",
        "imgICache",
        "imgILoader",
        "nsISupportsWeakReference",
        "nsIContentSniffer"
    ],
    "@mozilla.org/saxparser/xmlreader;1": [
        "nsIStreamListener",
        "nsISAXXMLReader",
        "nsIExpatSink",
        "nsIRequestObserver",
        "nsIExtendedExpatSink"
    ],
    "@mozilla.org/network/io-service;1": [
        "nsIObserver",
        "nsINetUtil",
        "nsIIOService",
        "nsIIOService2",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/external-helper-app-service;1": [
        "nsIObserver",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/network/standard-url;1": [
        "nsIStandardURL",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/chrome/chrome-registry;1": [
        "nsIObserver",
        "nsIXULChromeRegistry",
        "nsIXULOverlayProvider",
        "nsIToolkitChromeRegistry",
        "nsIChromeRegistry",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/urichecker;1": [
        "nsIURIChecker",
        "nsIChannelEventSink",
        "nsIStreamListener",
        "nsIRequest",
        "nsIRequestObserver",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/mime;1": [
        "nsIObserver",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/secure_browser_ui;1": [
        "nsIObserver",
        "nsIFormSubmitObserver",
        "nsIWebProgressListener",
        "nsISSLStatusProvider",
        "nsISupportsWeakReference",
        "nsISecureBrowserUI"
    ],
    "@adblockplus.org/abp/public;1": [
        "nsIStandardURL",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/uriloader/external-protocol-service;1": [
        "nsIObserver",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/network/socket-transport-service;1": [
        "nsIObserver",
        "nsISocketTransportService",
        "nsPISocketTransportService",
        "nsIThreadObserver",
        "nsIEventTarget",
        "nsIRunnable"
    ],
    "@adblockplus.org/abp/private;1": [
        "nsIStandardURL",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/editor/texteditor;1": [
        "nsIEditorIMESupport",
        "nsIPhonetic",
        "nsIEditor",
        "nsIEditorMailSupport",
        "nsISupportsWeakReference",
        "nsIPlaintextEditor"
    ],
    "@mozilla.org/svg/svg-document;1": [
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsIDOMDocumentXBL",
        "nsIDOMSVGDocument",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMDocument"
    ],
    "@mozilla.org/xml/xml-document;1": [
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsIDOMDocumentXBL",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMXMLDocument",
        "nsIDOMDocument"
    ],
    "@mozilla.org/preferences;1": [
        "nsIPrefBranchInternal",
        "nsIObserver",
        "nsIPrefService",
        "nsIPrefBranch2",
        "nsIPrefBranch",
        "nsIPrefServiceInternal",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/browser/httpindex-service;1": [
        "nsIHTTPIndex",
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsIFTPEventSink",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/embedding/browser/nsWebBrowserPersist;1": [
        "nsIProgressEventSink",
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsIWebBrowserPersist",
        "nsICancelable"
    ],
    "@mozilla.org/preferences-service;1": [
        "nsIPrefBranchInternal",
        "nsIObserver",
        "nsIPrefService",
        "nsIPrefBranch2",
        "nsIPrefBranch",
        "nsIPrefServiceInternal",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/xul/xul-document;1": [
        "nsIDOMXULDocument",
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsIDOMDocumentXBL",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMDocument"
    ],
    "@mozilla.org/rdf/datasource;1?name=httpindex": [
        "nsIHTTPIndex",
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsIFTPEventSink",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/nsCertificateDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsTokenDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsDOMCryptoDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsGeneratingKeypairInfoDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsClientAuthDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsTokenPasswordDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsSSLCertErrorDialog;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/nsCertPickDialogs;1": [
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/url-classifier/streamupdater;1": [
        "nsIObserver",
        "nsIStreamListener",
        "nsITimerCallback",
        "nsIUrlClassifierStreamUpdater",
        "nsIUrlClassifierUpdateObserver",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIBadCertListener2",
        "nsISSLErrorListener"
    ],
    "@mozilla.org/docloaderservice;1": [
        "nsIChannelEventSink",
        "nsIProgressEventSink",
        "nsIWebProgress",
        "nsISupportsPriority",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsISecurityEventSink",
        "nsIDocumentLoader"
    ],
    "@mozilla.org/rdf/datasource;1?name=xml-datasource": [
        "rdfIDataSource",
        "nsIChannelEventSink",
        "nsIStreamListener",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFXMLSource",
        "nsIRDFXMLSink",
        "nsIRDFRemoteDataSource",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/network/incremental-download;1": [
        "nsIAsyncVerifyRedirectCallback",
        "nsIChannelEventSink",
        "nsIObserver",
        "nsIStreamListener",
        "nsIIncrementalDownload",
        "nsIRequest",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/protocol;1?name=ws": [
        "nsIChannelEventSink",
        "nsIProtocolHandler",
        "nsIOutputStreamCallback",
        "nsIStreamListener",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIInputStreamCallback",
        "nsIHttpUpgradeListener",
        "nsIDNSListener"
    ],
    "@mozilla.org/network/protocol;1?name=wss": [
        "nsIChannelEventSink",
        "nsIProtocolHandler",
        "nsIOutputStreamCallback",
        "nsIStreamListener",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIInputStreamCallback",
        "nsIHttpUpgradeListener",
        "nsIDNSListener"
    ],
    "@mozilla.org/embeddor.implemented/bookmark-charset-resolver;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/browser/nav-history-service;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/browser/global-history;2": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/content/element/html;1?name=option": [
        "nsIDOMEventTarget",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsIDOMNSHTMLElement",
        "nsIDOMXPathNSResolver",
        "nsIDOMHTMLElement",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsISupportsWeakReference",
        "nsIDOMElement",
        "nsIDOMHTMLOptionElement"
    ],
    "@mozilla.org/browser/download-history;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/input-stream-channel;1": [
        "nsIWritablePropertyBag2",
        "nsIAsyncVerifyRedirectCallback",
        "nsIStreamListener",
        "nsIRequest",
        "nsIInputStreamChannel",
        "nsIPropertyBag",
        "nsIWritablePropertyBag",
        "nsIPropertyBag2",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsITransportEventSink",
        "nsIChannel"
    ],
    "@mozilla.org/editor/htmleditor;1": [
        "nsIEditorStyleSheets",
        "nsIEditorIMESupport",
        "nsIPhonetic",
        "nsIEditor",
        "nsIHTMLAbsPosEditor",
        "nsIEditorMailSupport",
        "nsIHTMLInlineTableEditor",
        "nsIHTMLObjectResizer",
        "nsISupportsWeakReference",
        "nsIPlaintextEditor",
        "nsIHTMLEditor",
        "nsITableEditor"
    ],
    "@mozilla.org/content/element/html;1?name=audio": [
        "nsIDOMEventTarget",
        "nsIObserver",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsIDOMNSHTMLElement",
        "nsIDOMXPathNSResolver",
        "nsIDOMHTMLElement",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMHTMLMediaElement",
        "nsISupportsWeakReference",
        "nsIDOMElement",
        "nsIDOMHTMLAudioElement"
    ],
    "@mozilla.org/content/element/html;1?name=img": [
        "nsIDOMHTMLImageElement",
        "nsIDOMEventTarget",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsIDOMNSHTMLElement",
        "nsIDOMXPathNSResolver",
        "nsIDOMHTMLElement",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsISupportsWeakReference",
        "nsIDOMElement",
        "nsIImageLoadingContent",
        "imgIDecoderObserver",
        "imgIContainerObserver"
    ],
    "@mozilla.org/embedding/browser/nsWebBrowser;1": [
        "nsIWebBrowserStream",
        "nsIWebProgressListener",
        "nsIWebBrowserSetup",
        "nsIDocShellTreeNode",
        "nsIBaseWindow",
        "nsIWebNavigation",
        "nsIDocShellTreeItem",
        "nsITextScroll",
        "nsIInterfaceRequestor",
        "nsIWebBrowser",
        "nsIWebBrowserFocus",
        "nsISupportsWeakReference",
        "nsIWebBrowserPersist",
        "nsIScrollable",
        "nsICancelable"
    ],
    "@mozilla.org/docshell;1": [
        "nsIChannelEventSink",
        "nsIObserver",
        "nsIProgressEventSink",
        "nsIRefreshURI",
        "nsIAuthPromptProvider",
        "nsIWebProgress",
        "nsIDocShellHistory",
        "nsILoadContext",
        "nsIDocShell",
        "nsISupportsPriority",
        "nsIWebPageDescriptor",
        "nsIEditorDocShell",
        "nsIClipboardCommands",
        "nsIWebProgressListener",
        "nsIDocShellTreeNode",
        "nsIBaseWindow",
        "nsIWebNavigation",
        "nsIDocShellTreeItem",
        "nsITextScroll",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIDocCharset",
        "nsISupportsWeakReference",
        "nsIScrollable",
        "nsIContentViewerContainer",
        "nsISecurityEventSink",
        "nsIDocumentLoader"
    ]
}