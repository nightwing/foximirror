// classInfo obj.QueryInterface(Ci.nsIClassInfo)
var cii=[]
for each(var i in Ci) {
    cii.push(i);
}
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
	for(var i in Cc)
		if(Cc[i] instanceof nsIJSCID)
			comp2iface[i] = supportedInterfaces(getserviceOrCreateInstance(Cc[i]))
		else
			dump(i)
}

buildComponentMap()



JSON.stringify(comp2iface ,null, 4)


















comp2iface = {
    "@mozilla.org/intl/unicode/encoder;1?charset=Big5": [
        "nsISupports"
    ],
    "@mozilla.org/timer;1": [
        "nsISupports",
        "nsITimer"
    ],
    "@mozilla.org/image/tools;1": [
        "imgITools",
        "nsISupports"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=ie": [
        "nsIBrowserProfileMigrator",
        "nsISupports",
        "nsINavHistoryBatchCallback"
    ],
    "@mozilla.org/prompter;1": [
        "nsIPromptService2",
        "nsISupports",
        "nsIPromptFactory",
        "nsIPromptService"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-greek": [
        "nsISupports"
    ],
    "@mozilla.org/inspector/dom-utils;1": [
        "nsISupports",
        "inIDOMUtils"
    ],
    "@mozilla.org/xtf/xml-contentbuilder;1": [
        "nsISupports",
        "nsIXMLContentBuilder"
    ],
    "@mozilla.org/persistent-properties;1": [
        "nsIPersistentProperties",
        "nsIProperties",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicharcategory;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-windows-949": [
        "nsISupports"
    ],
    "@mozilla.org/file/local;1": [
        "nsISupports",
        "nsIHashable",
        "nsILocalFileWin",
        "nsIFile",
        "nsILocalFile"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-6": [
        "nsISupports"
    ],
    "@mozilla.org/toolkit/command-line;1": [
        "nsISupports",
        "nsICommandLine"
    ],
    "@mozilla.org/network/protocol/about;1?what=rights": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/mime-hdrparam;1": [
        "nsISupports",
        "nsIMIMEHeaderParam"
    ],
    "@mozilla.org/network/protocol/about;1?what=config": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/sync-stream-listener;1": [
        "nsIInputStream",
        "nsIStreamListener",
        "nsISupports",
        "nsISyncStreamListener",
        "nsIRequestObserver"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-viet-tcvn5712": [
        "nsISupports"
    ],
    "@mozilla.org/download-manager-ui;1": [
        "nsIDownloadManagerUI",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-arabic": [
        "nsISupports"
    ],
    "@mozilla.org/url-classifier/streamupdater;1": [
        "nsIObserver",
        "nsIStreamListener",
        "nsISupports",
        "nsITimerCallback",
        "nsIUrlClassifierStreamUpdater",
        "nsIUrlClassifierUpdateObserver",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIBadCertListener2",
        "nsISSLErrorListener"
    ],
    "@mozilla.org/xmlextras/domparser;1": [
        "nsISupports",
        "nsIDOMParserJS",
        "nsIDOMParser"
    ],
    "@mozilla.org/content/document-loader-factory;1": [
        "nsISupports",
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/streamconv;1?from=x-compress&to=uncompressed": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/supports-PRUint64;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRUint64"
    ],
    "@mozilla.org/network/protocol-proxy-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIProtocolProxyService",
        "nsIProtocolProxyService2"
    ],
    "@mozilla.org/storage/service;1": [
        "nsIObserver",
        "nsISupports",
        "mozIStorageServiceQuotaManagement",
        "mozIStorageService"
    ],
    "@mozilla.org/principal;1": [
        "nsISupports",
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/widget/clipboardhelper;1": [
        "nsISupports",
        "nsIClipboardHelper"
    ],
    "@mozilla.org/network/server-socket;1": [
        "nsIServerSocket",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-14": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-turkish": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/web-handler-app;1": [
        "nsISupports",
        "nsIHandlerApp",
        "nsIWebHandlerApp"
    ],
    "@mozilla.org/intl/saveascharset;1": [
        "nsISupports",
        "nsISaveAsCharset"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=basic": [
        "nsISupports",
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/sidebar;1": [
        "nsISupports",
        "nsISidebar",
        "nsISidebarExternal"
    ],
    "@mozilla.org/streamconv;1?from=text/plain&to=text/html": [
        "nsIStreamListener",
        "nsISupports",
        "nsITXTToHTMLConv",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/webnavigation-info;1": [
        "nsIWebNavigationInfo",
        "nsISupports"
    ],
    "@mozilla.org/windows-jumplistshortcut;1": [
        "nsIJumpListItem",
        "nsIJumpListShortcut",
        "nsISupports"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=ukprob": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1251": [
        "nsISupports"
    ],
    "@mozilla.org/storage/statement-wrapper;1": [
        "nsISupports",
        "mozIStorageStatementWrapper"
    ],
    "@mozilla.org/system-proxy-settings;1": [
        "nsISupports",
        "nsISystemProxySettings"
    ],
    "@mozilla.org/embedcomp/rangefind;1": [
        "nsISupports",
        "nsIFind"
    ],
    "@mozilla.org/windows-jumplistseparator;1": [
        "nsIJumpListItem",
        "nsISupports",
        "nsIJumpListSeparator"
    ],
    "@mozilla.org/process/util;1": [
        "nsIObserver",
        "nsISupports",
        "nsIProcess"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=image/svg+xml": [
        "nsISupports"
    ],
    "@mozilla.org/login-manager/storage/mozStorage;1": [
        "nsISupports",
        "nsIInterfaceRequestor",
        "nsILoginManagerStorage"
    ],
    "@mozilla.org/network/protocol;1?name=moz-filedata": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/network/mime-input-stream;1": [
        "nsIInputStream",
        "nsISupports",
        "nsISeekableStream",
        "nsIMIMEInputStream"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=UTF-8": [
        "nsISupports"
    ],
    "@mozilla.org/dom/storage;1": [
        "nsISupports",
        "nsIDOMStorageObsolete"
    ],
    "@mozilla.org/embedding/browser/nsCommandHandler;1": [
        "nsICommandHandlerInit",
        "nsISupports",
        "nsICommandHandler"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM850": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1254": [
        "nsISupports"
    ],
    "@mozilla.org/sound;1": [
        "nsISupports",
        "nsISound",
        "nsIStreamLoaderObserver"
    ],
    "@mozilla.org/supports-PRUint8;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRUint8"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-devanagari": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-6": [
        "nsISupports"
    ],
    "@mozilla.org/thirdpartyutil;1": [
        "mozIThirdPartyUtil",
        "nsISupports"
    ],
    "@mozilla.org/passwordmanager/authpromptfactory;1": [
        "nsIObserver",
        "nsISupports",
        "nsIPromptFactory",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/extensions/blocklist;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsIBlocklistService"
    ],
    "@mozilla.org/widget/bidikeyboard;1": [
        "nsISupports",
        "nsIBidiKeyboard"
    ],
    "@mozilla.org/permissions/contentblocker;1": [
        "nsIObserver",
        "nsISupports",
        "nsIContentPolicy",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/appshell/component/browser-status-filter;1": [
        "nsIWebProgressListener2",
        "nsIWebProgress",
        "nsISupports",
        "nsIWebProgressListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-2022-CN": [
        "nsISupports"
    ],
    "@mozilla.org/security/nsASN1Tree;1": [
        "nsISupports",
        "nsITreeView",
        "nsIASN1Tree"
    ],
    "@mozilla.org/rdf/datasource;1?name=window-mediator": [
        "nsIObserver",
        "nsISupports",
        "nsIWindowMediatorListener",
        "nsIWindowDataSource",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/thread-manager;1": [
        "nsISupports",
        "nsIThreadManager"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=ruprob": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/css": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/protocol/about;1?what=newaddon": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/editor/editorcontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsISupports",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=application/xml": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/intl/texttosuburi;1": [
        "nsISupports",
        "nsITextToSubURI"
    ],
    "@mozilla.org/network/http-activity-distributor;1": [
        "nsISupports",
        "nsIHttpActivityDistributor",
        "nsIHttpActivityObserver"
    ],
    "@mozilla.org/network/protocol/about;1?what=buildconfig": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/widget/htmlformatconverter;1": [
        "nsISupports",
        "nsIFormatConverter"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=Shift_JIS": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=addons": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/nsCertificateDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/streamconv;1?from=application/http-index-format&to=text/html": [
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/stream-transport-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIStreamTransportService",
        "nsIEventTarget"
    ],
    "@mozilla.org/js/xpc/RuntimeService;1": [
        "nsISupports",
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/places/expiration;1": [
        "mozIStorageStatementCallback",
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/updates/update-service-stub;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/network/binary-detector;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/intl/charsetalias;1": [
        "nsISupports"
    ],
    "@mozilla.org/autocomplete/search;1?name=history": [
        "mozIStorageStatementCallback",
        "nsIObserver",
        "mozIPlacesAutoComplete",
        "nsISupports",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteSimpleResultListener"
    ],
    "@mozilla.org/browser/favicon-service;1": [
        "nsISupports",
        "mozIAsyncFavicons",
        "nsIFaviconService"
    ],
    "@mozilla.org/network/protocol;1?name=https": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsIHttpProtocolHandler",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/feed-person;1": [
        "nsISupports",
        "nsIFeedElementBase",
        "nsIFeedPerson"
    ],
    "@mozilla.org/browser/tagging-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsITaggingService",
        "nsINavBookmarkObserver"
    ],
    "@mozilla.org/xul/xul-popup-manager;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsIDOMEventListener"
    ],
    "@mozilla.org/content/plugin/document-loader-factory;1": [
        "nsISupports",
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/network/request-observer-proxy;1": [
        "nsISupports",
        "nsIRequestObserverProxy",
        "nsIRequestObserver"
    ],
    "@mozilla.org/storage/vacuum;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/controller-command-group;1": [
        "nsISupports",
        "nsIControllerCommandGroup"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/plain": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/startupcache/cache;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/socket;2?type=starttls": [
        "nsISupports",
        "nsISocketProvider"
    ],
    "@mozilla.org/uriloader/external-helper-app-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/scriptsecuritymanager;1": [
        "nsIScriptSecurityManager",
        "nsIChannelEventSink",
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/browser/browserglue;1": [
        "nsIObserver",
        "nsISupports",
        "nsIBrowserGlue",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/protocol;1?name=ftp": [
        "nsIProtocolHandler",
        "nsIObserver",
        "nsISupports",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/js/xpc/XPConnect;1": [
        "nsISupports",
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/supports-cstring;1": [
        "nsISupportsPrimitive",
        "nsISupportsCString",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=Big5-HKSCS": [
        "nsISupports"
    ],
    "@mozilla.org/security/psmdownload;1": [
        "nsISupports",
        "nsIURIContentListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/embedcomp/find;1": [
        "nsIWebBrowserFind",
        "nsISupports",
        "nsIWebBrowserFindInFrames"
    ],
    "@mozilla.org/autocomplete/controller;1": [
        "nsISupports",
        "nsITreeView",
        "nsITimerCallback",
        "nsIAutoCompleteObserver",
        "nsIAutoCompleteController"
    ],
    "@mozilla.org/network/unichar-stream-loader;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIUnicharStreamLoader",
        "nsIRequestObserver"
    ],
    "@mozilla.org/nsTokenDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/intl/scriptabledateformat;1": [
        "nsISupports",
        "nsIScriptableDateFormat"
    ],
    "@mozilla.org/network/application-cache-service;1": [
        "nsISupports",
        "nsIApplicationCacheService"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=ntlm": [
        "nsISupports",
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=gb18030": [
        "nsISupports"
    ],
    "@mozilla.org/geolocation/provider;1": [
        "nsISupports",
        "nsITimerCallback",
        "nsIWifiListener",
        "nsIGeolocationProvider"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=ko_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/memory-reporter-manager;1": [
        "nsISupports",
        "nsIMemoryReporterManager"
    ],
    "@mozilla.org/js/xpc/ContextStack;1": [
        "nsISupports",
        "nsIThreadObserver",
        "nsISupportsWeakReference",
        "nsIJSEngineTelemetryStats"
    ],
    "@mozilla.org/network/socket;2?type=socks": [
        "nsISupports",
        "nsISocketProvider"
    ],
    "@mozilla.org/intl/platformcharset;1": [
        "nsISupports"
    ],
    "@mozilla.org/supports-double;1": [
        "nsISupportsPrimitive",
        "nsISupportsDouble",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-arabic": [
        "nsISupports"
    ],
    "@mozilla.org/system-info;1": [
        "nsIWritablePropertyBag2",
        "nsISupports",
        "nsIPropertyBag",
        "nsIWritablePropertyBag",
        "nsIPropertyBag2"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=cjk_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=KOI8-U": [
        "nsISupports"
    ],
    "@mozilla.org/content/post-content-iterator;1": [
        "nsISupports"
    ],
    "@mozilla.org/supports-string;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsString"
    ],
    "@mozilla.org/pref-localizedstring;1": [
        "nsISupports",
        "nsISupportsString",
        "nsIPrefLocalizedString"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-6-E": [
        "nsISupports"
    ],
    "@mozilla.org/security/nsscertcache;1": [
        "nsINSSCertCache",
        "nsISupports"
    ],
    "@mozilla.org/libjar/zip-reader-cache;1": [
        "nsIZipReaderCache",
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/geolocation/service;1": [
        "nsIGeolocationUpdate",
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/url-classifier/utils;1": [
        "nsISupports",
        "nsIUrlClassifierUtils"
    ],
    "@mozilla.org/network/protocol/about;1?what=home": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/editor/txtsrvfilter;1": [
        "nsISupports",
        "nsITextServicesFilter"
    ],
    "@mozilla.org/windows-jumplistitem;1": [
        "nsIJumpListItem",
        "nsISupports"
    ],
    "@mozilla.org/io/multiplex-input-stream;1": [
        "nsIInputStream",
        "nsISupports",
        "nsIMultiplexInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/nsDOMCryptoDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=armscii-8": [
        "nsISupports"
    ],
    "@mozilla.org/jsctypes;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-874": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=resource": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsIResProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/updates/update-manager;1": [
        "nsIObserver",
        "nsISupports",
        "nsIUpdateManager"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-3": [
        "nsISupports"
    ],
    "@mozilla.org/network/url-parser;1?auth=yes": [
        "nsISupports",
        "nsIURLParser"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-8-I": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=sync-tabs": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-zapf-dingbats": [
        "nsISupports"
    ],
    "@mozilla.org/network/idn-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIIDNService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/updates/update-checker;1": [
        "nsISupports",
        "nsIUpdateChecker"
    ],
    "@mozilla.org/network/input-stream-channel;1": [
        "nsIWritablePropertyBag2",
        "nsIAsyncVerifyRedirectCallback",
        "nsIStreamListener",
        "nsISupports",
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
    "@mozilla.org/toolkit/app-startup;1": [
        "nsIObserver",
        "nsISupports",
        "nsIWindowCreator2",
        "nsIWindowCreator",
        "nsISupportsWeakReference",
        "nsIAppStartup"
    ],
    "@mozilla.org/url-classifier/listmanager;1": [
        "nsISupports",
        "nsITimerCallback",
        "nsIUrlListManager"
    ],
    "@mozilla.org/network/auth-module;1?name=ntlm": [
        "nsISupports"
    ],
    "@mozilla.org/widget/lookandfeel;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/network/socket;2?type=udp": [
        "nsISupports",
        "nsISocketProvider"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-johab": [
        "nsISupports"
    ],
    "@mozilla.org/spellchecker/personaldictionary;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference",
        "mozIPersonalDictionary"
    ],
    "@mozilla.org/byte-buffer;1": [
        "nsISupports"
    ],
    "@mozilla.org/widget/idleservice;1": [
        "nsIIdleService",
        "nsISupports"
    ],
    "@mozilla.org/content/dropped-link-handler;1": [
        "nsIDroppedLinkHandler",
        "nsISupports"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=application/xhtml+xml": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/network/protocol;1?name=http": [
        "nsIProtocolHandler",
        "nsIObserver",
        "nsISupports",
        "nsIHttpProtocolHandler",
        "nsIProxiedProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1252": [
        "nsISupports"
    ],
    "@mozilla.org/intl/semanticunitscanner;1": [
        "nsISupports",
        "nsISemanticUnitScanner"
    ],
    "@mozilla.org/rdf/datasource;1?name=in-memory-datasource": [
        "rdfIDataSource",
        "nsISupports",
        "nsIRDFPropagatableDataSource",
        "nsIRDFPurgeableDataSource",
        "nsIRDFInMemoryDataSource",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=UTF-16LE": [
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=compress&to=uncompressed": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=us-ascii": [
        "nsISupports"
    ],
    "@mozilla.org/network/stream-loader;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIStreamLoader",
        "nsIRequestObserver"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=2d": [
        "nsISupports",
        "nsIDOMCanvasRenderingContext2D"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/html": [
        "nsISupports"
    ],
    "@mozilla.org/scriptableinputstream;1": [
        "nsIScriptableInputStream",
        "nsISupports"
    ],
    "@mozilla.org/network/socket;2?type=ssl": [
        "nsISupports",
        "nsISocketProvider"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-windows-949": [
        "nsISupports"
    ],
    "@mozilla.org/security/hash;1": [
        "nsICryptoHash",
        "nsISupports"
    ],
    "@mozilla.org/hash-property-bag;1": [
        "nsIWritablePropertyBag2",
        "nsISupports",
        "nsIPropertyBag",
        "nsIWritablePropertyBag",
        "nsIPropertyBag2"
    ],
    "@mozilla.org/network/auth-module;1?name=sasl-gssapi": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1251": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-15": [
        "nsISupports"
    ],
    "@adblockplus.org/abp/policy;1": [
        "nsIChannelEventSink",
        "nsIObserver",
        "nsISupports",
        "nsIFactory",
        "nsIContentPolicy",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-3": [
        "nsISupports"
    ],
    "@mozilla.org/dom/storagemanager;1": [
        "nsIObserver",
        "nsISupports",
        "nsIDOMStorageManager"
    ],
    "@mozilla.org/psm;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/docloaderservice;1": [
        "nsIChannelEventSink",
        "nsIProgressEventSink",
        "nsIWebProgress",
        "nsISupports",
        "nsISupportsPriority",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsISecurityEventSink",
        "nsIDocumentLoader"
    ],
    "@mozilla.org/streamconv;1?from=application/mac-binhex40&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/protocol/about;1?what=cache": [
        "nsISupports",
        "nsICacheVisitor",
        "nsIAboutModule"
    ],
    "@mozilla.org/xpcom/ini-parser-factory;1": [
        "nsISupports",
        "nsIFactory",
        "nsIINIParserFactory"
    ],
    "@mozilla.org/gfx/printsettings-service;1": [
        "nsIPrintOptions",
        "nsISupports",
        "nsIPrintSettingsService"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM866": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=us-ascii": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=TIS-620": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/html": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/security/nsCertTree;1": [
        "nsISupports",
        "nsITreeView",
        "nsICertTree"
    ],
    "@mozilla.org/xul/xul-template-builder;1": [
        "nsIObserver",
        "nsISupports",
        "nsIXULTemplateBuilder"
    ],
    "@mozilla.org/inspector/flasher;1": [
        "inIFlasher",
        "nsISupports"
    ],
    "@mozilla.org/security/crypto;1": [
        "nsISupports",
        "nsIDOMCrypto"
    ],
    "@mozilla.org/fuel/application;1": [
        "nsIObserver",
        "nsISupports",
        "extIApplication",
        "fuelIApplication"
    ],
    "@mozilla.org/url-classifier/hashcompleter;1": [
        "nsIObserver",
        "nsISupports",
        "nsIUrlClassifierHashCompleter",
        "nsISupportsWeakReference",
        "nsIRunnable"
    ],
    "@mozilla.org/intl/converter-output-stream;1": [
        "nsISupports",
        "nsIConverterOutputStream",
        "nsIUnicharOutputStream"
    ],
    "@mozilla.org/embeddor.implemented/bookmark-charset-resolver;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsISupports",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zhcn_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/cycle-collector-logger;1": [
        "nsICycleCollectorListener",
        "nsISupports"
    ],
    "@mozilla.org/editor/editingsession;1": [
        "nsISupports",
        "nsIWebProgressListener",
        "nsIEditingSession",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/xbl;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/embeddor.implemented/web-content-handler-registrar;1": [
        "nsIObserver",
        "nsIWebContentConverterService",
        "nsISupports",
        "nsIFactory",
        "nsIWebContentHandlerRegistrar"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=GEOSTD8": [
        "nsISupports"
    ],
    "@mozilla.org/content-pref/hostname-grouper;1": [
        "nsIContentURIGrouper",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-romanian": [
        "nsISupports"
    ],
    "@mozilla.org/network/util;1": [
        "nsIObserver",
        "nsISupports",
        "nsINetUtil",
        "nsIIOService",
        "nsIIOService2",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/embedcomp/cookieprompt-service;1": [
        "nsISupports",
        "nsICookiePromptService"
    ],
    "@mozilla.org/intl/converter-input-stream;1": [
        "nsIConverterInputStream",
        "nsISupports",
        "nsIUnicharInputStream",
        "nsIUnicharLineInputStream"
    ],
    "@mozilla.org/network/url-parser;1?auth=maybe": [
        "nsISupports",
        "nsIURLParser"
    ],
    "@mozilla.org/netwerk/global-channel-event-sink;1": [
        "nsIScriptSecurityManager",
        "nsIChannelEventSink",
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=image/svg+xml": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-ce": [
        "nsISupports"
    ],
    "@mozilla.org/permissionmanager;1": [
        "nsIPermissionManager",
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/toolkit/crash-reporter;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsISupports",
        "nsICrashReporter"
    ],
    "@mozilla.org/base/telemetry;1": [
        "nsISupports",
        "nsITelemetry"
    ],
    "@mozilla.org/safebrowsing/application;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/application-cache-namespace;1": [
        "nsISupports",
        "nsIApplicationCacheNamespace"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-8": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/x-icon": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/accessibleRetrieval;1": [
        "nsIAccessibleRetrieval",
        "nsIObserver",
        "nsISupports",
        "nsIWebProgressListener",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=cjk_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/js/jsd/debugger-service;1": [
        "nsISupports",
        "jsdIDebuggerService"
    ],
    "@mozilla.org/docshell;1": [
        "nsIChannelEventSink",
        "nsIObserver",
        "nsIProgressEventSink",
        "nsIRefreshURI",
        "nsIAuthPromptProvider",
        "nsIWebProgress",
        "nsISupports",
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
    ],
    "@mozilla.org/image/encoder;2?type=image/png": [
        "nsIInputStream",
        "nsISupports",
        "nsIAsyncInputStream",
        "imgIEncoder"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-cyrillic": [
        "nsISupports"
    ],
    "@mozilla.org/gfx/devicecontextspec;1": [
        "nsISupports"
    ],
    "@mozilla.org/nsGeneratingKeypairInfoDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/cookie/permission;1": [
        "nsIObserver",
        "nsISupports",
        "nsICookiePermission"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/bmp": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=GB2312": [
        "nsISupports"
    ],
    "@mozilla.org/image/loader;1": [
        "nsIObserver",
        "nsISupports",
        "imgICache",
        "imgILoader",
        "nsISupportsWeakReference",
        "nsIContentSniffer"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=seamonkey": [
        "nsIBrowserProfileMigrator",
        "nsISupports"
    ],
    "@mozilla.org/network/partial-file-input-stream;1": [
        "nsIInputStream",
        "nsIPartialFileInputStream",
        "nsISupports",
        "nsILineInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/supports-id;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsID"
    ],
    "@mozilla.org/uriloader/psm-external-content-listener;1": [
        "nsISupports",
        "nsIURIContentListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/vnd.microsoft.icon": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1257": [
        "nsISupports"
    ],
    "@mozilla.org/network/auth-module;1?name=negotiate-sspi": [
        "nsISupports"
    ],
    "@mozilla.org/security/script/nameset;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=place": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/login-manager/prompter;1": [
        "nsISupports",
        "nsIAuthPrompt2",
        "nsIAuthPrompt",
        "nsILoginManagerPrompter"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=KOI8-R": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-romanian": [
        "nsISupports"
    ],
    "@mozilla.org/network/standard-url;1": [
        "nsIStandardURL",
        "nsISupports",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=zhcn_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=ws": [
        "nsIChannelEventSink",
        "nsIProtocolHandler",
        "nsIOutputStreamCallback",
        "nsIStreamListener",
        "nsISupports",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIInputStreamCallback",
        "nsIHttpUpgradeListener",
        "nsIDNSListener"
    ],
    "@mozilla.org/widgets/window/win;1": [
        "nsISupports"
    ],
    "@mozilla.org/process/environment;1": [
        "nsISupports",
        "nsIEnvironment"
    ],
    "@mozilla.org/feed-processor;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIFeedProcessor",
        "nsISAXContentHandler",
        "nsIRequestObserver",
        "nsISAXErrorHandler"
    ],
    "@mozilla.org/globalmessagemanager;1": [
        "nsISupports",
        "nsIChromeFrameMessageManager",
        "nsIFrameMessageManager"
    ],
    "@mozilla.org/security/recentbadcerts;1": [
        "nsISupports",
        "nsIRecentBadCertsService"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-gujarati": [
        "nsISupports"
    ],
    "@mozilla.org/xmlextras/xmlserializer;1": [
        "nsISupports",
        "nsIDOMSerializer"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-8": [
        "nsISupports"
    ],
    "@mozilla.org/layout/xul-boxobject-container;1": [
        "nsIBrowserBoxObject",
        "nsIBoxObject",
        "nsISupports",
        "nsIIFrameBoxObject",
        "nsIEditorBoxObject",
        "nsIContainerBoxObject"
    ],
    "@mozilla.org/streamconv;1?from=multipart/mixed&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/auth-module;1?name=kerb-gss": [
        "nsISupports"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/xhtml+xml": [
        "nsISupports"
    ],
    "@mozilla.org/appshell/appShellService;1": [
        "nsIObserver",
        "nsISupports",
        "nsIAppShellService"
    ],
    "@mozilla.org/eventsource;1": [
        "nsIDOMEventTarget",
        "nsISupports",
        "nsIEventSource"
    ],
    "@mozilla.org/network/protocol/about;1?what=mozilla": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/uuid-generator;1": [
        "nsISupports",
        "nsIUUIDGenerator"
    ],
    "@mozilla.org/js/jsd/app-start-observer;2": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=plugins": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/serialization-helper;1": [
        "nsISupports",
        "nsISerializationHelper"
    ],
    "@mozilla.org/file/directory_service;1": [
        "nsIProperties",
        "nsISupports",
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryService",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/intl/unicharutil;1": [
        "nsISupports"
    ],
    "@mozilla.org/browser/search-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsIBrowserSearchService"
    ],
    "@mozilla.org/network/application-cache;1": [
        "nsISupports",
        "nsIApplicationCache",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=gbk": [
        "nsISupports"
    ],
    "@mozilla.org/pipe;1": [
        "nsISupports",
        "nsIPipe"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=gb18030": [
        "nsISupports"
    ],
    "@mozilla.org/browser/feeds/sniffer;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIContentSniffer"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-greek": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=logo": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=T.61-8bit": [
        "nsISupports"
    ],
    "@mozilla.org/login-manager/loginInfo;1": [
        "nsILoginMetaInfo",
        "nsISupports",
        "nsILoginInfo"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=T.61-8bit": [
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/appstartup-notifier;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM855": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-ce": [
        "nsISupports"
    ],
    "@mozilla.org/rdf/datasource;1?name=composite-datasource": [
        "nsISupports",
        "nsIRDFCompositeDataSource",
        "nsIRDFObserver",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/satchel/form-history;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsISupports",
        "nsIFormHistory2"
    ],
    "@mozilla.org/nsClientAuthDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/intl/datetimeformat;1": [
        "nsISupports"
    ],
    "@mozilla.org/console-api;1": [
        "nsISupports",
        "nsIDOMGlobalPropertyInitializer"
    ],
    "@mozilla.org/nullprincipal;1": [
        "nsISupports",
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/dom/window-controller;1": [
        "nsIController",
        "nsICommandController",
        "nsISupports",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/inspector/deep-tree-walker;1": [
        "nsISupports",
        "nsIDOMTreeWalker",
        "inIDeepTreeWalker"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=zh_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/intl/collation-factory;1": [
        "nsISupports",
        "nsICollationFactory"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/plain": [
        "nsISupports"
    ],
    "@mozilla.org/inspector/dom-view;1": [
        "nsISupports",
        "nsITreeView",
        "inIDOMView"
    ],
    "@mozilla.org/offlinecacheupdate;1": [
        "nsISupports",
        "nsIOfflineCacheUpdate",
        "nsIOfflineCacheUpdateObserver"
    ],
    "@mozilla.org/geolocation;1": [
        "nsIDOMGeoGeolocation",
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/controller-command-table;1": [
        "nsISupports",
        "nsIControllerCommandTable",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-roman": [
        "nsISupports"
    ],
    "@mozilla.org/autoconfiguration;1": [
        "nsIObserver",
        "nsIStreamListener",
        "nsISupports",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-turkish": [
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=deflate": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/supports-PRInt32;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRInt32",
        "nsISupports"
    ],
    "@mozilla.org/svg/svg-document;1": [
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsISupports",
        "nsIDOMDocumentXBL",
        "nsIDOMSVGDocument",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMDocument"
    ],
    "@mozilla.org/network/protocol;1?name=wyciwyg": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1252": [
        "nsISupports"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=zhtw_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-10": [
        "nsISupports"
    ],
    "@mozilla.org/xpcom/version-comparator;1": [
        "nsISupports",
        "nsIVersionComparator"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/http-index-format": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/simple-stream-listener;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsISimpleStreamListener"
    ],
    "@mozilla.org/browser/directory-provider;1": [
        "nsISupports",
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/network/protocol;1?name=chrome": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/layout/xul-boxobject-scrollbox;1": [
        "nsIBoxObject",
        "nsISupports",
        "nsIScrollBoxObject"
    ],
    "@mozilla.org/network/load-group;1": [
        "nsILoadGroup",
        "nsISupports",
        "nsISupportsPriority",
        "nsIRequest",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/layout/xul-boxobject-tree;1": [
        "nsIBoxObject",
        "nsISupports",
        "nsITreeBoxObject"
    ],
    "@mozilla.org/alerts-service;1": [
        "nsIAlertsProgressListener",
        "nsISupports",
        "nsIAlertsService"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-euc-tw": [
        "nsISupports"
    ],
    "@mozilla.org/browser/shell-service;1": [
        "nsISupports",
        "nsIShellService",
        "nsIWindowsShellService"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-adobe-euro": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM862": [
        "nsISupports"
    ],
    "@mozilla.org/network/file-output-stream;1": [
        "nsISupports",
        "nsISeekableStream",
        "nsIFileOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/network/protocol/about;1?what=credits": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1258": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=about": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/content/style-sheet-service;1": [
        "nsISupports",
        "nsIStyleSheetService"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/png": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/chrome/chrome-registry;1": [
        "nsIObserver",
        "nsISupports",
        "nsIXULChromeRegistry",
        "nsIXULOverlayProvider",
        "nsIToolkitChromeRegistry",
        "nsIChromeRegistry",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/properties;1": [
        "nsIProperties",
        "nsISupports"
    ],
    "@mozilla.org/feed;1": [
        "nsIFeedContainer",
        "nsISupports",
        "nsIFeedElementBase",
        "nsIFeed"
    ],
    "@mozilla.org/jsreflect;1": [
        "nsISupports"
    ],
    "@mozilla.org/cookieService;1": [
        "nsIObserver",
        "nsISupports",
        "nsICookieService",
        "nsICookieManager2",
        "nsISupportsWeakReference",
        "nsICookieManager"
    ],
    "@mozilla.org/xpcom/ini-processor-factory;1": [
        "nsISupports",
        "nsIINIParserFactory"
    ],
    "@mozilla.org/data-document-content-policy;1": [
        "nsISupports",
        "nsIContentPolicy"
    ],
    "@mozilla.org/nsCMSDecoder;1": [
        "nsISupports"
    ],
    "@mozilla.org/supports-PRInt64;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRInt64"
    ],
    "@mozilla.org/binaryoutputstream;1": [
        "nsISupports",
        "nsIObjectOutputStream",
        "nsIBinaryOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=EUC-JP": [
        "nsISupports"
    ],
    "@mozilla.org/crypto/fips-info-service;1": [
        "nsICryptoFIPSInfo",
        "nsISupports",
        "nsIPKCS11ModuleDB"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=ja_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/content/element/html;1?name=audio": [
        "nsIDOMEventTarget",
        "nsIObserver",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsISupports",
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
    "@mozilla.org/PopupWindowManager;1": [
        "nsIObserver",
        "nsIPopupWindowManager",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/protocol;1?name=moz-icon": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/handler-service;1": [
        "nsIHandlerService",
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/security/pkcs11moduledb;1": [
        "nsICryptoFIPSInfo",
        "nsISupports",
        "nsIPKCS11ModuleDB"
    ],
    "@mozilla.org/autocomplete/search;1?name=form-history": [
        "nsISupports",
        "nsIDOMEventListener",
        "nsIFormFillController",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteInput"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-5": [
        "nsISupports"
    ],
    "@mozilla.org/browser/places/import-export-service;1": [
        "nsIPlacesImportExportService",
        "nsISupports",
        "nsINavHistoryBatchCallback"
    ],
    "@mozilla.org/toolkit/URLFormatterService;1": [
        "nsISupports",
        "nsIURLFormatter"
    ],
    "@mozilla.org/xml/xml-document;1": [
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsISupports",
        "nsIDOMDocumentXBL",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMXMLDocument",
        "nsIDOMDocument"
    ],
    "@mozilla.org/nsTokenPasswordDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/network/buffered-input-stream;1": [
        "nsIInputStream",
        "nsISupports",
        "nsIBufferedInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/intl/nslanguageatomservice;1": [
        "nsISupports"
    ],
    "@mozilla.org/feed-textconstruct;1": [
        "nsISupports",
        "nsIFeedTextConstruct"
    ],
    "@adblockplus.org/abp/startup;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=Adobe-Symbol-Encoding": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/xhtml+xml": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/base/telemetry-ping;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/security/keyobjectfactory;1": [
        "nsISupports",
        "nsIKeyObjectFactory"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=UTF-16LE": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-15": [
        "nsISupports"
    ],
    "@mozilla.org/spellchecker-inline;1": [
        "nsIEditActionListener",
        "nsISupports",
        "nsIDOMEventListener",
        "nsIInlineSpellChecker",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/safe-file-output-stream;1": [
        "nsISupports",
        "nsISafeOutputStream",
        "nsISeekableStream",
        "nsIFileOutputStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=gzip": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-6-E": [
        "nsISupports"
    ],
    "@mozilla.org/content/dom-selection;1": [
        "nsISelection",
        "nsISupports",
        "nsISupportsWeakReference",
        "nsISelectionPrivate"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1250": [
        "nsISupports"
    ],
    "@mozilla.org/toolkit/console-clh;1": [
        "nsISupports",
        "nsICommandLineHandler"
    ],
    "@mozilla.org/transformiix-nodeset;1": [
        "txINodeSet",
        "nsISupports",
        "txIXPathObject"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/svg+xml": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/updates/update-prompt;1": [
        "nsISupports",
        "nsIUpdatePrompt"
    ],
    "@mozilla.org/dom/indexeddb/manager;1": [
        "nsIIndexedDatabaseManager",
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/security/x509certdb;1": [
        "nsIX509CertDB2",
        "nsIX509CertDB",
        "nsISupports"
    ],
    "@mozilla.org/intl/nslocaleservice;1": [
        "nsISupports",
        "nsILocaleService"
    ],
    "@mozilla.org/rdf/content-sink;1": [
        "nsISupports",
        "nsIExpatSink"
    ],
    "@mozilla.org/network/protocol/about;1?what=permissions": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/urichecker;1": [
        "nsIURIChecker",
        "nsIChannelEventSink",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequest",
        "nsIRequestObserver",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/dom/storage;2": [],
    "@mozilla.org/windows-jumplistlink;1": [
        "nsIJumpListItem",
        "nsISupports",
        "nsIJumpListLink"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-8-E": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/vnd.mozilla.xul+xml": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/browser/livemark-service;2": [
        "nsIObserver",
        "nsISupports",
        "nsILivemarkService",
        "nsINavBookmarkObserver"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-5": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-user-defined": [
        "nsISupports"
    ],
    "@mozilla.org/preferences;1": [
        "nsIPrefBranchInternal",
        "nsIObserver",
        "nsISupports",
        "nsIPrefService",
        "nsIPrefBranch2",
        "nsIPrefBranch",
        "nsIPrefServiceInternal",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/jpg": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/network/protocol;1?name=data": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/image/request;1": [
        "nsISupports",
        "nsISupportsPriority",
        "nsIRequest",
        "nsISecurityInfoProvider",
        "imgIRequest"
    ],
    "@mozilla.org/parser/parser-service;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-viet-tcvn5712": [
        "nsISupports"
    ],
    "@mozilla.org/browser/httpindex-service;1": [
        "nsIHTTPIndex",
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsISupports",
        "nsIFTPEventSink",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/xmlextras/xmlhttprequest;1": [
        "nsIDOMEventTarget",
        "nsIJSXMLHttpRequest",
        "nsISupports",
        "nsIXMLHttpRequest",
        "nsIXMLHttpRequestEventTarget",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ukprob": [
        "nsISupports"
    ],
    "@mozilla.org/js/xpc/ID;1": [
        "nsISupports",
        "nsIJSID"
    ],
    "@mozilla.org/websocket;1": [
        "nsIDOMEventTarget",
        "nsISupports",
        "nsIMozWebSocket"
    ],
    "@mozilla.org/network/protocol/about;1?what=blocked": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/atom-service;1": [
        "nsISupports",
        "nsIAtomService"
    ],
    "@mozilla.org/js/xpc/ContextStackIterator;1": [
        "nsISupports"
    ],
    "@mozilla.org/browser/session-history-entry;1": [
        "nsISupports",
        "nsIHistoryEntry",
        "nsISHEntryInternal",
        "nsISHEntry",
        "nsISHContainer"
    ],
    "@mozilla.org/feed-result;1": [
        "nsISupports",
        "nsIFeedResult"
    ],
    "@mozilla.org/userinfo;1": [
        "nsISupports",
        "nsIUserInfo"
    ],
    "@mozilla.org/security/crlmanager;1": [
        "nsISupports",
        "nsICRLManager"
    ],
    "@mozilla.org/xpfe/http-index-format-factory-constructor": [
        "nsISupports",
        "nsIDocumentLoaderFactory"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM852": [
        "nsISupports"
    ],
    "@mozilla.org/browser/nav-history-service;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsISupports",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/nsFormSigningDialog;1": [
        "nsISupports",
        "nsIFormSigningDialog"
    ],
    "@mozilla.org/security/hmac;1": [
        "nsISupports",
        "nsICryptoHMAC"
    ],
    "@mozilla.org/rdf/serializer;1?format=ntriples": [
        "rdfISerializer",
        "nsISupports"
    ],
    "@mozilla.org/network/auth-module;1?name=kerb-sspi": [
        "nsISupports"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zhtw_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-roman": [
        "nsISupports"
    ],
    "@mozilla.org/nsCMSSecureMessage;1": [
        "nsISupports",
        "nsICMSSecureMessage"
    ],
    "@mozilla.org/embedding/browser/nsWebBrowserPersist;1": [
        "nsIProgressEventSink",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsIWebBrowserPersist",
        "nsICancelable"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/gif": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/intl/stringbundle;1": [
        "nsIObserver",
        "nsISupports",
        "nsIStringBundleService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/user_cert_picker;1": [
        "nsIUserCertPicker",
        "nsISupports"
    ],
    "@mozilla.org/browser/shistory;1": [
        "nsISHistory",
        "nsISupports",
        "nsISHistoryInternal",
        "nsIWebNavigation"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=UTF-7": [
        "nsISupports"
    ],
    "@mozilla.org/browser/final-clh;1": [
        "nsISupports",
        "nsICommandLineHandler"
    ],
    "@mozilla.org/network/input-stream-pump;1": [
        "nsISupports",
        "nsIRequest",
        "nsIInputStreamPump",
        "nsIInputStreamCallback"
    ],
    "@mozilla.org/embedcomp/prompt-service;1": [
        "nsIPromptService2",
        "nsISupports",
        "nsIPromptFactory",
        "nsIPromptService"
    ],
    "@mozilla.org/intl/entityconverter;1": [
        "nsIEntityConverter",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-imap4-modified-utf7": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-user-defined": [
        "nsISupports"
    ],
    "@mozilla.org/typeaheadfind;1": [
        "nsIObserver",
        "nsISupports",
        "nsITypeAheadFind",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/supports-array;1": [
        "nsISupports",
        "nsICollection",
        "nsISupportsArray",
        "nsISerializable"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-13": [
        "nsISupports"
    ],
    "@mozilla.org/appshell/trytoclose;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-johab": [
        "nsISupports"
    ],
    "@mozilla.org/prefetch-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIPrefetchService",
        "nsIWebProgressListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/weave/service;1": [
        "nsIObserver",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/widget/appshell/win;1": [
        "nsIObserver",
        "nsISupports",
        "nsIThreadObserver"
    ],
    "@mozilla.org/network/socket-provider-service;1": [
        "nsISocketProviderService",
        "nsISupports"
    ],
    "@mozilla.org/zipwriter;1": [
        "nsIZipWriter",
        "nsISupports",
        "nsIRequestObserver"
    ],
    "@mozilla.org/supports-float;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsFloat"
    ],
    "@mozilla.org/rdf/datasource;1?name=local-store": [
        "nsIObserver",
        "nsISupports",
        "nsIRDFRemoteDataSource",
        "nsISupportsWeakReference",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/preferences-service;1": [
        "nsIPrefBranchInternal",
        "nsIObserver",
        "nsISupports",
        "nsIPrefService",
        "nsIPrefBranch2",
        "nsIPrefBranch",
        "nsIPrefServiceInternal",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/nsSSLCertErrorDialog;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/streamconv;1?from=gzip&to=uncompressed": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1255": [
        "nsISupports"
    ],
    "@mozilla.org/find/find_service;1": [
        "nsISupports",
        "nsIFindService"
    ],
    "@mozilla.org/windows-registry-key;1": [
        "nsISupports",
        "nsIWindowsRegKey"
    ],
    "@mozilla.org/intl/scriptableunicodeconverter": [
        "nsISupports",
        "nsIScriptableUnicodeConverter"
    ],
    "@mozilla.org/nsCertPickDialogs;1": [
        "nsISupports",
        "nsIClientAuthDialogs",
        "nsISSLCertErrorDialog",
        "nsIDOMCryptoDialogs",
        "nsICertificateDialogs",
        "nsITokenPasswordDialogs",
        "nsITokenDialogs",
        "nsICertPickDialogs",
        "nsIGeneratingKeypairInfoDialogs"
    ],
    "@mozilla.org/login-manager/crypto/SDR;1": [
        "nsISupports",
        "nsILoginManagerCrypto"
    ],
    "@mozilla.org/content/range-utils;1": [
        "nsISupports"
    ],
    "@mozilla.org/editor/txtsrvfiltermail;1": [
        "nsISupports",
        "nsITextServicesFilter"
    ],
    "@mozilla.org/network/protocol;1?name=jar": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsIJARProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/pref-relativefile;1": [
        "nsISupports",
        "nsIRelativeFilePref"
    ],
    "@mozilla.org/gfx/printsession;1": [
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/mime;1": [
        "nsIObserver",
        "nsISupports",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/browser/global-history;2": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsISupports",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1258": [
        "nsISupports"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/xml": [
        "nsISupports"
    ],
    "@mozilla.org/childprocessmessagemanager;1": [],
    "@mozilla.org/intl/unicode/encoder;1?charset=VISCII": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=Big5-HKSCS": [
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=deflate&to=uncompressed": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/layout/htmlsanitizer;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=sync-log": [
        "nsISupports",
        "nsISupportsWeakReference",
        "nsIAboutModule"
    ],
    "@mozilla.org/cookiemanager;1": [
        "nsIObserver",
        "nsISupports",
        "nsICookieService",
        "nsICookieManager2",
        "nsISupportsWeakReference",
        "nsICookieManager"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-2": [
        "nsISupports"
    ],
    "@mozilla.org/autocomplete/search;1?name=search-autocomplete": [
        "nsIObserver",
        "nsISupports",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteObserver"
    ],
    "@mozilla.org/network/protocol;1?name=moz-anno": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/printingprompt-service;1": [
        "nsIPrintingPromptService",
        "nsISupports",
        "nsIWebProgressListener"
    ],
    "@mozilla.org/image/encoder;2?type=image/jpeg": [
        "nsIInputStream",
        "nsISupports",
        "nsIAsyncInputStream",
        "imgIEncoder"
    ],
    "@mozilla.org/supports-PRInt16;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRInt16"
    ],
    "@mozilla.org/network/network-link-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsINetworkLinkService",
        "nsIRunnable"
    ],
    "@mozilla.org/network/protocol;1?name=edit": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/intl/wbrk;1": [
        "nsISupports"
    ],
    "@mozilla.org/charset-converter-manager;1": [
        "nsISupports",
        "nsICharsetConverterManager"
    ],
    "@mozilla.org/security/streamcipher;1": [
        "nsISupports",
        "nsIStreamCipher"
    ],
    "@mozilla.org/eventlistenerservice;1": [
        "nsIEventListenerService",
        "nsISupports"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/html": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/rdf/rdf-service;1": [
        "nsISupports",
        "nsIRDFService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/security/certoverride;1": [
        "nsIObserver",
        "nsISupports",
        "nsICertOverrideService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/layout/content-policy;1": [
        "nsISupports",
        "nsIContentPolicy"
    ],
    "@mozilla.org/secure_browser_ui;1": [
        "nsIObserver",
        "nsIFormSubmitObserver",
        "nsISupports",
        "nsIWebProgressListener",
        "nsISSLStatusProvider",
        "nsISupportsWeakReference",
        "nsISecureBrowserUI"
    ],
    "@mozilla.org/browser/history-entry;1": [
        "nsISupports",
        "nsIHistoryEntry",
        "nsISHEntryInternal",
        "nsISHEntry",
        "nsISHContainer"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-10": [
        "nsISupports"
    ],
    "@mozilla.org/widget/dragservice;1": [
        "nsISupports",
        "nsIDragSession",
        "nsIDragService"
    ],
    "@mozilla.org/layout/xul-boxobject-menu;1": [
        "nsIBoxObject",
        "nsISupports",
        "nsIMenuBoxObject"
    ],
    "@mozilla.org/embedcomp/base-command-controller;1": [
        "nsIController",
        "nsICommandController",
        "nsISupports",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM864i": [
        "nsISupports"
    ],
    "@mozilla.org/wifi/monitor;1": [
        "nsIWifiMonitor",
        "nsIObserver",
        "nsISupports",
        "nsIRunnable"
    ],
    "@mozilla.org/plugin/host;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsIPluginHost",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/embedcomp/command-params;1": [
        "nsICommandParams",
        "nsISupports"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/xml": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM857": [
        "nsISupports"
    ],
    "@mozilla.org/layout/xul-boxobject-listbox;1": [
        "nsIBoxObject",
        "nsISupports",
        "nsIListBoxObject"
    ],
    "@mozilla.org/uriloader;1": [
        "nsISupports",
        "nsIURILoader"
    ],
    "@mozilla.org/browser/clh;1": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1255": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-tamilttf-0": [
        "nsISupports"
    ],
    "@mozilla.org/feed-generator;1": [
        "nsISupports",
        "nsIFeedElementBase",
        "nsIFeedGenerator"
    ],
    "@adblockplus.org/abp/public;1": [
        "nsIStandardURL",
        "nsISupports",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/intl/lbrk;1": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/local-handler-app;1": [
        "nsISupports",
        "nsILocalHandlerApp",
        "nsIHandlerApp"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=EUC-KR": [
        "nsISupports"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/plain": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-hebrew": [
        "nsISupports"
    ],
    "@mozilla.org/filepicker;1": [
        "nsISupports",
        "nsIFilePicker"
    ],
    "@mozilla.org/accessibilityService;1": [
        "nsIAccessibleRetrieval",
        "nsIObserver",
        "nsISupports",
        "nsIWebProgressListener",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/io/string-input-stream;1": [
        "nsIInputStream",
        "nsISupportsCString",
        "nsISupports",
        "nsIStringInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/network/protocol/about;1?what=sessionrestore": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-gurmukhi": [
        "nsISupports"
    ],
    "@mozilla.org/js/xpc/Exception;1": [
        "nsISupports",
        "nsIXPCException",
        "nsIException"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1250": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-16": [
        "nsISupports"
    ],
    "@mozilla.org/content/xmlhttprequest-bad-cert-handler;1": [
        "nsISupports",
        "nsIInterfaceRequestor",
        "nsIBadCertListener2",
        "nsISSLErrorListener"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-2": [
        "nsISupports"
    ],
    "@mozilla.org/transfer;1": [
        "nsIWebProgressListener2",
        "nsITransfer",
        "nsISupports",
        "nsIWebProgressListener"
    ],
    "@mozilla.org/feed-entry;1": [
        "nsIFeedContainer",
        "nsIFeedEntry",
        "nsISupports",
        "nsIFeedElementBase"
    ],
    "@mozilla.org/streamconv;1?from=x-gzip&to=uncompressed": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/addons/web-install-listener;1": [
        "nsISupports",
        "amIWebInstallListener"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-IR-111": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM864": [
        "nsISupports"
    ],
    "@mozilla.org/content/namespacemanager;1": [
        "nsISupports"
    ],
    "@mozilla.org/rdf/datasource;1?name=xml-datasource": [
        "rdfIDataSource",
        "nsIChannelEventSink",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFXMLSource",
        "nsIRDFXMLSink",
        "nsIRDFRemoteDataSource",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=image/jpeg": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/xpcomproxy;1": [
        "nsISupports",
        "nsIProxyObjectManager"
    ],
    "@mozilla.org/embedding/browser/nsWebBrowser;1": [
        "nsIWebBrowserStream",
        "nsISupports",
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
    "@mozilla.org/network/proxy-auto-config;1": [
        "nsISupports",
        "nsIProxyAutoConfig"
    ],
    "@mozilla.org/binaryinputstream;1": [
        "nsIInputStream",
        "nsISupports",
        "nsIBinaryInputStream",
        "nsIObjectInputStream"
    ],
    "@mozilla.org/systemprincipal;1": [
        "nsISupports",
        "nsIPrincipal",
        "nsISerializable"
    ],
    "@mozilla.org/network/protocol/about;1?what=neterror": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/login-manager/storage/legacy;1": [
        "nsILoginManagerIEMigrationHelper",
        "nsISupports",
        "nsILoginManagerStorage"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=x-gzip": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/thread-pool;1": [
        "nsISupports",
        "nsIEventTarget",
        "nsIThreadPool",
        "nsIRunnable"
    ],
    "@mozilla.org/network/incremental-download;1": [
        "nsIAsyncVerifyRedirectCallback",
        "nsIChannelEventSink",
        "nsIObserver",
        "nsIStreamListener",
        "nsISupports",
        "nsIIncrementalDownload",
        "nsIRequest",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/xtf/xtf-service;1": [
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/command-manager;1": [
        "nsISupports",
        "nsICommandManager",
        "nsISupportsWeakReference",
        "nsPICommandUpdater"
    ],
    "@mozilla.org/image/rasterimage;1": [
        "nsIProperties",
        "nsISupports",
        "nsITimerCallback",
        "imgIContainer",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/xpcom/memory-service;1": [
        "nsISupports",
        "nsIMemory"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM850": [
        "nsISupports"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ruprob": [
        "nsISupports"
    ],
    "@mozilla.org/parental-controls-service;1": [
        "nsIParentalControlsService",
        "nsISupports"
    ],
    "@mozilla.org/network/file-input-stream;1": [
        "nsIInputStream",
        "nsIFileInputStream",
        "nsISupports",
        "nsILineInputStream",
        "nsISeekableStream"
    ],
    "@mozilla.org/no-data-protocol-content-policy;1": [
        "nsISupports",
        "nsIContentPolicy"
    ],
    "@mozilla.org/widgets/child_window/win;1": [
        "nsISupports"
    ],
    "@mozilla.org/cspservice;1": [
        "nsIChannelEventSink",
        "nsISupports",
        "nsIContentPolicy"
    ],
    "@mozilla.org/libjar/zip-reader;1": [
        "nsISupports",
        "nsIZipReader"
    ],
    "@mozilla.org/document-charset-info;1": [
        "nsISupports",
        "nsIDocumentCharsetInfo"
    ],
    "@mozilla.org/network/protocol/about;1?what=privatebrowsing": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/download-manager;1": [
        "nsIObserver",
        "nsISupports",
        "nsIDownloadManager",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/addons/integration;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "amIWebInstaller"
    ],
    "@mozilla.org/xre/runtime;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsISupports",
        "nsICrashReporter"
    ],
    "@mozilla.org/readconfig;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-7": [
        "nsISupports"
    ],
    "@mozilla.org/content/subtree-content-iterator;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=UTF-16BE": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=file": [
        "nsIProtocolHandler",
        "nsIFileProtocolHandler",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/offlinecacheupdate-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIOfflineCacheUpdateService",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/browser/nav-bookmarks-service;1": [
        "nsIObserver",
        "nsIAnnotationObserver",
        "nsISupports",
        "nsINavBookmarksService",
        "nsINavHistoryObserver"
    ],
    "@mozilla.org/txttohtmlconv;1": [
        "mozITXTToHTMLConv",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-devanagari": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=memory": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=Shift_JIS": [
        "nsISupports"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=negotiate": [
        "nsISupports",
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-cyrillic": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-hebrew": [
        "nsISupports"
    ],
    "@mozilla.org/xpcom/error-service;1": [
        "nsISupports",
        "nsIErrorService"
    ],
    "@mozilla.org/streamconv;1?from=application/x-unknown-content-type&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/rdf/resource-factory;1": [
        "nsIRDFResource",
        "nsISupports",
        "nsIRDFNode"
    ],
    "@mozilla.org/supports-PRTime;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRTime"
    ],
    "@mozilla.org/rdf/datasource;1?name=charset-menu": [
        "nsISupports",
        "nsICurrentCharsetListener",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/supports-interface-pointer;1": [
        "nsISupportsPrimitive",
        "nsISupportsInterfacePointer",
        "nsISupports"
    ],
    "@mozilla.org/network/http-channel-auth-provider;1": [
        "nsIAuthPromptCallback",
        "nsISupports",
        "nsIHttpChannelAuthProvider",
        "nsICancelable"
    ],
    "@mozilla.org/content/pre-content-iterator;1": [
        "nsISupports"
    ],
    "@mozilla.org/view-manager;1": [
        "nsISupports"
    ],
    "@mozilla.org/windows-taskbar;1": [
        "nsIWinTaskbar",
        "nsISupports"
    ],
    "@mozilla.org/moz/jssubscript-loader;1": [
        "nsISupports",
        "mozIJSSubScriptLoader"
    ],
    "@mozilla.org/security/sdr;1": [
        "nsISecretDecoderRing",
        "nsISupports",
        "nsISecretDecoderRingConfig"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1256": [
        "nsISupports"
    ],
    "@mozilla.org/spellchecker/i18nmanager;1": [
        "nsISupports",
        "mozISpellI18NManager"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=moz-webgl": [
        "nsISupports",
        "nsIDOMWebGLRenderingContext"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-6-I": [
        "nsISupports"
    ],
    "@mozilla.org/dirIndex;1": [
        "nsISupports",
        "nsIDirIndex"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-croatian": [
        "nsISupports"
    ],
    "@mozilla.org/appshell/window-mediator;1": [
        "nsIObserver",
        "nsISupports",
        "nsIWindowMediator",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/network/simple-uri;1": [
        "nsISupports",
        "nsIClassInfo",
        "nsIURI",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-gujarati": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=GEOSTD8": [
        "nsISupports"
    ],
    "@mozilla.org/stsservice;1": [
        "nsIObserver",
        "nsISupports",
        "nsIStrictTransportSecurityService"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-7": [
        "nsISupports"
    ],
    "@mozilla.org/categorymanager;1": [
        "nsISupports",
        "nsICategoryManager"
    ],
    "@mozilla.org/security/datasignatureverifier;1": [
        "nsISupports",
        "nsIDataSignatureVerifier"
    ],
    "@mozilla.org/content/range;1": [
        "nsISupports",
        "nsIDOMNSRange",
        "nsIDOMRange"
    ],
    "@mozilla.org/network/protocol/about;1?what=robots": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/browser/default-browser-clh;1": [
        "nsISupports",
        "nsICommandLineHandler"
    ],
    "@mozilla.org/layout/documentEncoder;1?type=text/xml": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.feed&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ko_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/updates/timer-manager;1": [
        "nsIObserver",
        "nsIUpdateTimerManager",
        "nsISupports",
        "nsITimerCallback"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=text/rdf": [
        "nsIBrowserHandler",
        "nsISupports",
        "nsICommandLineHandler",
        "nsIContentHandler",
        "nsICommandLineValidator"
    ],
    "@mozilla.org/widget/clipboard;1": [
        "nsISupports",
        "nsIClipboard"
    ],
    "@mozilla.org/scripterror;1": [
        "nsISupports",
        "nsIConsoleMessage",
        "nsIScriptError2",
        "nsIScriptError"
    ],
    "@mozilla.org/nsCMSEncoder;1": [
        "nsISupports"
    ],
    "@mozilla.org/content/element/html;1?name=option": [
        "nsIDOMEventTarget",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsISupports",
        "nsIDOMNSHTMLElement",
        "nsIDOMXPathNSResolver",
        "nsIDOMHTMLElement",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsISupportsWeakReference",
        "nsIDOMElement",
        "nsIDOMHTMLOptionElement"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-13": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=abp-elemhidehit": [
        "nsISupports",
        "nsIFactory",
        "nsIAboutModule"
    ],
    "@mozilla.org/spellchecker;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/async-stream-copier;1": [
        "nsISupports",
        "nsIRequest",
        "nsIAsyncStreamCopier"
    ],
    "@mozilla.org/image/cache;1": [
        "nsIObserver",
        "nsISupports",
        "imgICache",
        "imgILoader",
        "nsISupportsWeakReference",
        "nsIContentSniffer"
    ],
    "@mozilla.org/intl/unicodenormalizer;1": [
        "nsISupports",
        "nsIUnicodeNormalizer"
    ],
    "@mozilla.org/editor/editordocstatecontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsISupports",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=UTF-16": [
        "nsISupports"
    ],
    "@mozilla.org/io-util;1": [
        "nsIIOUtil",
        "nsISupports"
    ],
    "@mozilla.org/uriclassifierservice": [
        "nsIObserver",
        "nsISupports",
        "nsIURIClassifier",
        "nsIUrlClassifierDBService"
    ],
    "@mozilla.org/textservices/textservicesdocument;1": [
        "nsIEditActionListener",
        "nsISupports"
    ],
    "@mozilla.org/spellcheck/dir-provider;1": [
        "nsISupports",
        "nsIDirectoryServiceProvider2",
        "nsIDirectoryServiceProvider"
    ],
    "@mozilla.org/login-manager;1": [
        "nsISupports",
        "nsIInterfaceRequestor",
        "nsISupportsWeakReference",
        "nsILoginManager"
    ],
    "@mozilla.org/streamconv;1?from=multipart/byteranges&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/network/protocol;1?name=javascript": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-8-E": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-tscii": [
        "nsISupports"
    ],
    "@mozilla.org/uriloader/external-protocol-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsIMIMEService",
        "nsPIExternalAppLauncher",
        "nsIExternalHelperAppService",
        "nsISupportsWeakReference",
        "nsIExternalProtocolService"
    ],
    "@mozilla.org/supports-PRUint32;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRUint32"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=UTF-7": [
        "nsISupports"
    ],
    "@mozilla.org/browser/annotation-service;1": [
        "nsIAnnotationService",
        "nsISupports"
    ],
    "@mozilla.org/content/2dthebes-canvas-rendering-context;1": [
        "nsISupports",
        "nsIDOMCanvasRenderingContext2D"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-11": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-imap4-modified-utf7": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-viet-vps": [
        "nsISupports"
    ],
    "@mozilla.org/security/pkcs11;1": [
        "nsISupports",
        "nsIPKCS11"
    ],
    "@mozilla.org/supports-PRBool;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsPRBool"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-croatian": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=support": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/content-pref/service;1": [
        "nsIFrameMessageListener",
        "nsIObserver",
        "nsISupports",
        "nsIContentPrefService"
    ],
    "@mozilla.org/parentprocessmessagemanager;1": [
        "nsISupports",
        "nsIFrameMessageManager"
    ],
    "@mozilla.org/url-classifier/dbservice;1": [
        "nsIObserver",
        "nsISupports",
        "nsIURIClassifier",
        "nsIUrlClassifierDBService"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM862": [
        "nsISupports"
    ],
    "@mozilla.org/exslt/regexp;1": [
        "txIEXSLTRegExFunctions",
        "nsISupports"
    ],
    "@mozilla.org/document-transformer;1?type=xslt": [
        "nsIXSLTProcessorPrivate",
        "nsISupports",
        "nsIXSLTProcessor"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-IR-111": [
        "nsISupports"
    ],
    "@mozilla.org/editor/htmleditor;1": [
        "nsIEditorStyleSheets",
        "nsIEditorIMESupport",
        "nsISupports",
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
    "@mozilla.org/network/http-auth-manager;1": [
        "nsISupports",
        "nsIHttpAuthManager"
    ],
    "@mozilla.org/network/protocol;1?name=wss": [
        "nsIChannelEventSink",
        "nsIProtocolHandler",
        "nsIOutputStreamCallback",
        "nsIStreamListener",
        "nsISupports",
        "nsITimerCallback",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIInputStreamCallback",
        "nsIHttpUpgradeListener",
        "nsIDNSListener"
    ],
    "@mozilla.org/contentsecuritypolicy;1": [
        "nsISupports",
        "nsIContentSecurityPolicy"
    ],
    "@mozilla.org/xul/xul-document;1": [
        "nsIDOMXULDocument",
        "nsIDOMEventTarget",
        "nsIDOMXPathEvaluator",
        "nsISupports",
        "nsIDOMDocumentXBL",
        "nsIDOMNode",
        "nsIDOMNodeSelector",
        "nsIDOMDocument"
    ],
    "@mozilla.org/exceptionservice;1": [
        "nsIObserver",
        "nsISupports",
        "nsIExceptionManager",
        "nsIExceptionService"
    ],
    "@mozilla.org/url-classifier/jslib;1": [
        "nsISupports"
    ],
    "@mozilla.org/saxparser/attributes;1": [
        "nsISAXAttributes",
        "nsISAXMutableAttributes",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=KOI8-U": [
        "nsISupports"
    ],
    "@mozilla.org/focus-manager;1": [
        "nsIObserver",
        "nsISupports",
        "nsIFocusManager",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-gurmukhi": [
        "nsISupports"
    ],
    "@mozilla.org/rdf/datasource;1?name=httpindex": [
        "nsIHTTPIndex",
        "nsIDirIndexListener",
        "nsIStreamListener",
        "nsISupports",
        "nsIFTPEventSink",
        "nsIRequestObserver",
        "nsIInterfaceRequestor",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/content-permission/prompt;1": [
        "nsIContentPermissionPrompt",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-874": [
        "nsISupports"
    ],
    "@mozilla.org/browser/session-history-transaction;1": [
        "nsISHTransaction",
        "nsISupports"
    ],
    "@mozilla.org/autocomplete/simple-result;1": [
        "nsIAutoCompleteSimpleResult",
        "nsIAutoCompleteResult",
        "nsISupports"
    ],
    "@mozilla.org/array;1": [
        "nsISupports",
        "nsIArray",
        "nsIMutableArray"
    ],
    "@mozilla.org/browser/sessionstore;1": [
        "nsIObserver",
        "nsISupports",
        "nsISessionStore",
        "nsIDOMEventListener",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/security/random-generator;1": [
        "nsISupports",
        "nsIRandomGenerator"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-4": [
        "nsISupports"
    ],
    "@mozilla.org/network/content-sniffer;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter",
        "nsIContentSniffer"
    ],
    "@mozilla.org/gfx/info;1": [
        "nsIObserver",
        "nsISupports",
        "nsIGfxInfo",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=HZ-GB-2312": [
        "nsISupports"
    ],
    "@mozilla.org/rdf/xml-parser;1": [
        "nsIRDFXMLParser",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=TIS-620": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=default": [
        "nsIProtocolHandler",
        "nsISupports",
        "nsIExternalProtocolHandler",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/toolkit/default-clh;1": [
        "nsISupports",
        "nsICommandLineHandler"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-icelandic": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-2022-JP": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-16": [
        "nsISupports"
    ],
    "@mozilla.org/gfx/fontenumerator;1": [
        "nsISupports",
        "nsIFontEnumerator"
    ],
    "@mozilla.org/network/socket-transport-service;1": [
        "nsIObserver",
        "nsISocketTransportService",
        "nsISupports",
        "nsPISocketTransportService",
        "nsIThreadObserver",
        "nsIEventTarget",
        "nsIRunnable"
    ],
    "@mozilla.org/toolkit/profile-service;1": [
        "nsISupports",
        "nsIToolkitProfileService"
    ],
    "@mozilla.org/content/element/html;1?name=img": [
        "nsIDOMHTMLImageElement",
        "nsIDOMEventTarget",
        "nsIDOMElementCSSInlineStyle",
        "nsIDOMNSElement",
        "nsISupports",
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
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1257": [
        "nsISupports"
    ],
    "@mozilla.org/jsperf;1": [
        "nsISupports"
    ],
    "@mozilla.org/observer-service;1": [
        "nsISupports",
        "nsIObserverService"
    ],
    "@mozilla.org/browser/download-history;1": [
        "mozIStorageVacuumParticipant",
        "nsIObserver",
        "nsICharsetResolver",
        "nsISupports",
        "nsIGlobalHistory3",
        "nsPIPlacesDatabase",
        "nsIDownloadHistory",
        "nsIBrowserHistory",
        "nsIGlobalHistory2",
        "nsINavHistoryService",
        "nsPIPlacesHistoryListenersNotifier",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-mac-farsi": [
        "nsISupports"
    ],
    "@mozilla.org/security/keyobject;1": [
        "nsISupports",
        "nsIKeyObject"
    ],
    "@mozilla.org/network/stream-listener-tee;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamListenerTee"
    ],
    "@mozilla.org/gfx/printerenumerator;1": [
        "nsIPrinterEnumerator",
        "nsISupports"
    ],
    "@mozilla.org/browser/feeds/result-service;1": [
        "nsIFeedResultService",
        "nsISupports",
        "nsIFactory"
    ],
    "@mozilla.org/recycling-allocator;1": [
        "nsISupports",
        "nsIRecyclingAllocator",
        "nsIMemory"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1253": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/layout/xul-boxobject-popup;1": [
        "nsIBoxObject",
        "nsISupports",
        "nsIPopupBoxObject"
    ],
    "@mozilla.org/nsSecurityWarningDialogs;1": [
        "nsISupports",
        "nsISecurityWarningDialogs"
    ],
    "@mozilla.org/nschannelpolicy;1": [
        "nsISupports",
        "nsIChannelPolicy"
    ],
    "@mozilla.org/xul/xul-controllers;1": [
        "nsIControllers",
        "nsISupports",
        "nsISecurityCheckedComponent"
    ],
    "@mozilla.org/embedcomp/dialogparam;1": [
        "nsIDialogParamBlock",
        "nsISupports"
    ],
    "@mozilla.org/layout/xul-boxobject;1": [
        "nsIBoxObject",
        "nsISupports"
    ],
    "@mozilla.org/layout/form-processor;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=UTF-8": [
        "nsISupports"
    ],
    "@adblockplus.org/abp/private;1": [
        "nsIStandardURL",
        "nsISupports",
        "nsIClassInfo",
        "nsIURI",
        "nsIURL",
        "nsIMutable",
        "nsISerializable"
    ],
    "@mozilla.org/gfx/screenmanager;1": [
        "nsIScreenManager",
        "nsISupports"
    ],
    "@mozilla.org/rdf/container;1": [
        "nsIRDFContainer",
        "nsISupports"
    ],
    "@mozilla.org/moz/jsloader;1": [
        "nsIObserver",
        "nsISupports",
        "xpcIJSModuleLoader"
    ],
    "@mozilla.org/network/protocol/about;1?what=feeds": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/rdf/xml-serializer;1": [
        "nsISupports",
        "nsIRDFXMLSerializer",
        "nsIRDFXMLSource"
    ],
    "@mozilla.org/network/dns-service;1": [
        "nsIDNSService",
        "nsIObserver",
        "nsISupports",
        "nsPIDNSService"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1256": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=VISCII": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-14": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=Big5": [
        "nsISupports"
    ],
    "@mozilla.org/helperapplauncherdialog;1": [
        "nsISupports",
        "nsITimerCallback",
        "nsIHelperAppLauncherDialog"
    ],
    "@mozilla.org/streamConverters;1": [
        "nsISupports",
        "nsIStreamConverterService"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-4": [
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.video.feed&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=EUC-JP": [
        "nsISupports"
    ],
    "@mozilla.org/intl/stringbundle/text-override;1": [],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-2022-JP": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=HZ-GB-2312": [
        "nsISupports"
    ],
    "@mozilla.org/browser/shistory-internal;1": [
        "nsISHistory",
        "nsISupports",
        "nsISHistoryInternal",
        "nsIWebNavigation"
    ],
    "@mozilla.org/network/socket;2?type=socks4": [
        "nsISupports",
        "nsISocketProvider"
    ],
    "@mozilla.org/network/buffered-output-stream;1": [
        "nsIBufferedOutputStream",
        "nsISupports",
        "nsISeekableStream",
        "nsIOutputStream"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM866": [
        "nsISupports"
    ],
    "@mozilla.org/editor/editorspellchecker;1": [
        "nsIEditorSpellCheck",
        "nsISupports"
    ],
    "@mozilla.org/redirectchannelregistrar;1": [
        "nsISupports",
        "nsIRedirectChannelRegistrar"
    ],
    "@mozilla.org/widget/toolkit/win;1": [
        "nsISupports"
    ],
    "@mozilla.org/intl/collation;1": [
        "nsISupports",
        "nsICollation"
    ],
    "@mozilla.org/widget/transferable;1": [
        "nsISupports",
        "nsITransferable"
    ],
    "@mozilla.org/windows-jumplistbuilder;1": [
        "nsISupports",
        "nsIJumpListBuilder"
    ],
    "@mozilla.org/docshell/structured-clone-container;1": [
        "nsISupports",
        "nsIStructuredCloneContainer"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=UTF-16BE": [
        "nsISupports"
    ],
    "@mozilla.org/updates/update-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsITimerCallback",
        "nsIApplicationUpdateService"
    ],
    "@mozilla.org/network/auth-module;1?name=sys-ntlm": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=hkscs-1": [
        "nsISupports"
    ],
    "@mozilla.org/files/formdata;1": [
        "nsIDOMFormData",
        "nsISupports"
    ],
    "@mozilla.org/rdf/container-utils;1": [
        "nsISupports",
        "nsIRDFContainerUtils"
    ],
    "@mozilla.org/satchel/form-autocomplete;1": [
        "nsISupports",
        "nsISupportsWeakReference",
        "nsIFormAutoComplete"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM852": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=feed": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=application/vnd.mozilla.xul+xml": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM855": [
        "nsISupports"
    ],
    "@mozilla.org/xpcom/debug;1": [
        "nsISupports",
        "nsIDebug",
        "nsIDebug2"
    ],
    "@mozilla.org/satchel/form-fill-controller;1": [
        "nsISupports",
        "nsIDOMEventListener",
        "nsIFormFillController",
        "nsIAutoCompleteSearch",
        "nsIAutoCompleteInput"
    ],
    "@mozilla.org/editor/texteditor;1": [
        "nsIEditorIMESupport",
        "nsISupports",
        "nsIPhonetic",
        "nsIEditor",
        "nsIEditorMailSupport",
        "nsISupportsWeakReference",
        "nsIPlaintextEditor"
    ],
    "@mozilla.org/privatebrowsing-wrapper;1": [
        "nsIObserver",
        "nsISupports",
        "nsIPrivateBrowsingService"
    ],
    "@mozilla.org/chrome/chrome-native-theme;1": [
        "nsISupports",
        "nsITimerCallback"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-9": [
        "nsISupports"
    ],
    "@mozilla.org/nsCMSMessage;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=crashes": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/satchel/inputlist-autocomplete;1": [
        "nsISupports",
        "nsIInputListAutoComplete"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-2022-KR": [
        "nsISupports"
    ],
    "@mozilla.org/editor/htmleditorcontroller;1": [
        "nsIController",
        "nsICommandController",
        "nsISupports",
        "nsIControllerContext",
        "nsIInterfaceRequestor"
    ],
    "@mozilla.org/profile/migrator;1?app=browser&type=opera": [
        "nsIBrowserProfileMigrator",
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=multipart/x-mixed-replace&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/devicemotion;1": [
        "nsISupports",
        "nsIDeviceMotion"
    ],
    "@mozilla.org/streamconv;1?from=text/ftp-dir&to=application/http-index-format": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/places/categoriesStarter;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/embedcomp/window-watcher;1": [
        "nsISupports",
        "nsIPromptFactory",
        "nsIWindowWatcher"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=IBM864i": [
        "nsISupports"
    ],
    "@mozilla.org/xul/xul-prototype-cache;1": [
        "nsIObserver",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=UTF-16": [
        "nsISupports"
    ],
    "@mozilla.org/spellchecker/engine;1": [
        "nsIObserver",
        "nsISupports",
        "mozISpellCheckingEngine",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=GB2312": [
        "nsISupports"
    ],
    "@mozilla.org/security/pkiparamblock;1": [
        "nsIDialogParamBlock",
        "nsISupports",
        "nsIPKIParamBlock"
    ],
    "@mozilla.org/toolkit/profile-migrator;1": [
        "nsISupports",
        "nsIProfileMigrator"
    ],
    "@mozilla.org/network/auth-module;1?name=negotiate-gss": [
        "nsISupports"
    ],
    "@mozilla.org/embedding/browser/content-policy;1": [
        "nsISupports",
        "nsIContentPolicy"
    ],
    "@mozilla.org/gfx/init;1": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=certerror": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/url-parser;1?auth=no": [
        "nsISupports",
        "nsIURLParser"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=jis_0201": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=windows-1254": [
        "nsISupports"
    ],
    "@mozilla.org/streamconv;1?from=uncompressed&to=rawdeflate": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/xre/app-info;1": [
        "nsIXULRuntime",
        "nsIWinAppHelper",
        "nsIXULAppInfo",
        "nsISupports",
        "nsICrashReporter"
    ],
    "@mozilla.org/browser/history;1": [
        "nsIObserver",
        "nsISupports",
        "mozIAsyncHistory"
    ],
    "@mozilla.org/streamconv;1?from=application/vnd.mozilla.maybe.audio.feed&to=*/*": [
        "nsIStreamListener",
        "nsISupports",
        "nsIFeedResultListener",
        "nsIRequestObserver",
        "nsIStreamConverter"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=KOI8-R": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=license": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/intl/utf8converterservice;1": [
        "nsISupports",
        "nsIUTF8ConverterService"
    ],
    "@mozilla.org/transactionmanager;1": [
        "nsITransactionManager",
        "nsISupports",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/nss_errors_service;1": [
        "nsISupports",
        "nsINSSErrorsService"
    ],
    "@mozilla.org/saxparser/xmlreader;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsISAXXMLReader",
        "nsIExpatSink",
        "nsIRequestObserver",
        "nsIExtendedExpatSink"
    ],
    "@mozilla.org/network/effective-tld-service;1": [
        "nsISupports",
        "nsIEffectiveTLDService"
    ],
    "@mozilla.org/content-dispatch-chooser;1": [
        "nsISupports",
        "nsIContentDispatchChooser"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-9": [
        "nsISupports"
    ],
    "@mozilla.org/network/authprompt-adapter-factory;1": [
        "nsISupports",
        "nsIAuthPromptAdapterFactory"
    ],
    "@mozilla.org/layout/plaintextsink;1": [
        "nsISupports"
    ],
    "@mozilla.org/gfx/region;1": [
        "nsISupports",
        "nsIScriptableRegion"
    ],
    "@mozilla.org/geolocation/gpsd/provider;1": [
        "nsISupports",
        "nsIGeolocationProvider"
    ],
    "@mozilla.org/network/http-authenticator;1?scheme=digest": [
        "nsISupports",
        "nsIHttpAuthenticator"
    ],
    "@mozilla.org/network/cache-service;1": [
        "nsISupports",
        "nsICacheService"
    ],
    "@mozilla.org/security/entropy;1": [
        "nsISupports"
    ],
    "@mozilla.org/variant;1": [
        "nsISupports",
        "nsIVariant",
        "nsIWritableVariant"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-1": [
        "nsISupports"
    ],
    "@mozilla.org/content/canvas-rendering-context;1?id=experimental-webgl": [
        "nsISupports",
        "nsIDOMWebGLRenderingContext"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-euc-tw": [
        "nsISupports"
    ],
    "@mozilla.org/supports-PRUint16;1": [
        "nsISupportsPrimitive",
        "nsISupportsPRUint16",
        "nsISupports"
    ],
    "@mozilla.org/network/protocol/about;1?what=blank": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/autocomplete/search;1?name=places-tag-autocomplete": [
        "nsISupports",
        "nsIAutoCompleteSearch"
    ],
    "@mozilla.org/network/protocol/about;1?what=cache-entry": [
        "nsISupports",
        "nsIAboutModule",
        "nsICacheMetaDataVisitor"
    ],
    "@mozilla.org/security/pk11tokendb;1": [
        "nsISupports",
        "nsIPK11TokenDB"
    ],
    "@mozilla.org/network/protocol;1?name=view-source": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=gbk": [
        "nsISupports"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=ja_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/supports-char;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsChar"
    ],
    "@mozilla.org/rdf/datasource;1?name=files": [
        "nsISupports",
        "nsIRDFDataSource"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=armscii-8": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-11": [
        "nsISupports"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=universal_charset_detector": [
        "nsISupports"
    ],
    "@mozilla.org/storagestream;1": [
        "nsISupports",
        "nsIOutputStream",
        "nsIStorageStream"
    ],
    "@mozilla.org/feed-unescapehtml;1": [
        "nsIScriptableUnescapeHTML",
        "nsISupports"
    ],
    "@mozilla.org/toolkit/native-app-support;1": [
        "nsIObserver",
        "nsISupports",
        "nsINativeAppSupport"
    ],
    "@mozilla.org/dom/xpath-evaluator;1": [
        "nsIDOMXPathEvaluator",
        "nsISupports"
    ],
    "@mozilla.org/layout/contentserializer;1?mimetype=text/xml": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM857": [
        "nsISupports"
    ],
    "@mozilla.org/browser/sessionstartup;1": [
        "nsIObserver",
        "nsISupports",
        "nsISessionStartup",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=ISO-8859-6-I": [
        "nsISupports"
    ],
    "@mozilla.org/intl/charsetdetect;1?type=universal_charset_detector": [
        "nsISupports"
    ],
    "@mozilla.org/dirIndexParser;1": [
        "nsIDirIndexParser",
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver"
    ],
    "@mozilla.org/network/protocol/about;1?what=about": [
        "nsISupports",
        "nsIAboutModule"
    ],
    "@mozilla.org/network/downloader;1": [
        "nsIStreamListener",
        "nsISupports",
        "nsIRequestObserver",
        "nsIDownloader"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=EUC-KR": [
        "nsISupports"
    ],
    "@mozilla.org/xpti/interfaceinfomanager-service;1": [
        "nsISupports"
    ],
    "@mozilla.org/files/filereader;1": [
        "nsIDOMEventTarget",
        "nsISupports",
        "nsIXMLHttpRequestEventTarget",
        "nsIInterfaceRequestor",
        "nsIDOMFileReader"
    ],
    "@mozilla.org/scriptablebase64encoder;1": [
        "nsISupports",
        "nsIScriptableBase64Encoder"
    ],
    "@mozilla.org/supports-void;1": [
        "nsISupportsPrimitive",
        "nsISupports",
        "nsISupportsVoid"
    ],
    "@mozilla.org/dom/json;1": [
        "nsISupports",
        "nsIJSON"
    ],
    "@mozilla.org/consoleservice;1": [
        "nsISupports",
        "nsIConsoleService"
    ],
    "@mozilla.org/browser/feeds/result-writer;1": [
        "nsIObserver",
        "nsISupports",
        "nsIDOMEventListener",
        "nsINavHistoryObserver",
        "nsIFeedWriter"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=x-viet-vps": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/encoder;1?charset=windows-1253": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-8-I": [
        "nsISupports"
    ],
    "@mozilla.org/network/protocol;1?name=pcast": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/network/io-service;1": [
        "nsIObserver",
        "nsISupports",
        "nsINetUtil",
        "nsIIOService",
        "nsIIOService2",
        "nsISupportsWeakReference"
    ],
    "@mozilla.org/uriloader/content-handler;1?type=application/x-xpinstall": [
        "nsISupports",
        "nsIContentHandler"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=ISO-8859-1": [
        "nsISupports"
    ],
    "@mozilla.org/inspector/search;1?type=cssvalue": [
        "nsISupports",
        "inISearchProcess",
        "inICSSValueSearch"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=IBM864": [
        "nsISupports"
    ],
    "@mozilla.org/xul/xul-tree-builder;1": [
        "nsIObserver",
        "nsISupports",
        "nsITreeView",
        "nsIXULTreeBuilder",
        "nsIXULTemplateBuilder"
    ],
    "@mozilla.org/privatebrowsing;1": [
        "nsIObserver",
        "nsISupports",
        "nsICommandLineHandler",
        "nsISupportsWeakReference",
        "nsIPrivateBrowsingService"
    ],
    "@mozilla.org/docshell/urifixup;1": [
        "nsISupports",
        "nsIURIFixup"
    ],
    "@mozilla.org/intl/stringcharsetdetect;1?type=zh_parallel_state_machine": [
        "nsISupports"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-icelandic": [
        "nsISupports"
    ],
    "@mozilla.org/services-crypto/sync-jpake;1": [
        "nsISupports",
        "nsISyncJPAKE"
    ],
    "@mozilla.org/network/protocol;1?name=moz-safe-about": [
        "nsIProtocolHandler",
        "nsISupports"
    ],
    "@mozilla.org/xul/xul-sort-service;1": [
        "nsISupports",
        "nsIXULSortService"
    ],
    "@mozilla.org/intl/unicode/decoder;1?charset=x-mac-farsi": [
        "nsISupports"
    ],
    "@mozilla.org/layout/htmlCopyEncoder;1": [
        "nsISupports",
        "nsIDocumentEncoder"
    ],
    "": [
        "nsISupports",
        "nsIControllerCommandTable",
        "nsISupportsWeakReference"
    ]
}


