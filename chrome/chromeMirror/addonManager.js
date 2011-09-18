//install unpacked extension
function getExtId(c){
	var parser = new DOMParser();
	var dom = parser.parseFromString(c, "text/xml");
	var u=dom.documentElement.querySelectorAll('*[about]>id')[0]
	if(u)
		u=u.textContent
	else {
		u=dom.documentElement.querySelectorAll('*[about]')[0]
		var att=u.attributes
		for(var i=0;i<att.length;i++)			
			if(/:id$/.test(att[i].nodeName) ){
				u=att[i].nodeValue
				break			
			}
	}
	return u
}
function getExtName(c){
	var parser = new DOMParser();
	var dom = parser.parseFromString(c, "text/xml");
	var u=dom.documentElement.querySelectorAll('name')[0]
	if(u)
		u=u.textContent	
	return u
}

function installUnpacked(){
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilter('install.rdf','install.rdf')
	fp.appendFilters(nsIFilePicker.filterAll);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	var res = fp.show();

	if(res == nsIFilePicker.returnOK) {
		var extFile=fp.file
	}
	if(!extFile)
		return
	var contentText= readEntireFile(fp.file);
			
	var extId=getExtId(contentText)
	if(!extId)
		extId=prompt("Problem! can't find extension id");
	if(!extId)
		return
		
	try {
		var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);  
		file.append("extensions");
		file.append(extId);
					
		if(file.exists()) {
			if(!prompt('do you want to repalce?\n'+file.path,'yes please'))
				return
			file.remove(true)
		}
		file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666)
		writeToFile(file, extFile.parent.path);
		
		document.getElementById('restart').hidden=false
		
		var xpiFile=file.parent
		xpiFile.append(extId+'.xpi')
		file=xpiFile
		if(file.exists()) {
			if(!prompt('do you want to repalce?\n'+file.path,'yes please'))
				return
			//unlockJarFile(file)
			flushJarCache(file)
			file.remove(true)
		}

	}catch(e){
		prompt("Problem! Could not deploy extension. File I/O Error!",e); 
	}
}

function registerChromeLocation(file){
	if(file.isDirectory())
		file.append('chrome.manifest')
	
	if(file.path.slice(-15) == 'chrome.manifest' && file.exists())
		Components.manager.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(file)
	else if(file.path.slice(-4) == '.xpi')
		AddJarManifestLocation(file.path)
	else
		dump(file.path, '-----------------not a xpi')
		
	Services.chromeReg.checkForNewChrome()
}

//
function AddJarManifestLocation(path) {
	Components.utils.import("resource://gre/modules/ctypes.jsm");
	var file = Cc["@mozilla.org/file/directory_service;1"]
				.getService(Ci.nsIProperties)
				.get("XCurProcD", Ci.nsIFile);//resource:app
	file.append(ctypes.libraryName("xul"));
	var libxul = ctypes.open(file.path);
  
	// we need to explicitly allocate a type for the buffer we'll need to hold
	// the path in :(
	var bufLen = path.length + 2;
	var PathBuffer_t = ctypes.StructType("PathBuffer",
										[{buf: ctypes.jschar.array(bufLen)}])
	var nsString_t = ctypes.StructType("nsAString",
										[{mData:   PathBuffer_t.ptr}
										,{mLength: ctypes.uint32_t}
										,{mFlags:  ctypes.uint32_t}])
	var PRBool_t = ctypes.uint32_t; // yay NSPR
	var nsILocalFile_t = ctypes.StructType("nsILocalFile").ptr;

	var NS_NewLocalFile = libxul.declare("NS_NewLocalFile_P",
                   ctypes.default_abi,
                   ctypes.uint32_t,         // nsresult return
                   nsString_t.ptr,          // const nsAString &path
                   PRBool_t,                // PRBool followLinks
                   nsILocalFile_t.ptr       // nsILocalFile* *result
	);
	var XRE_AddJarManifestLocation = libxul.declare("XRE_AddJarManifestLocation",
                   ctypes.default_abi,
                   ctypes.uint32_t,         // nsresult return
                   ctypes.int32_t,          // NSLocationType aType
                   nsILocalFile_t           // nsILocalFile* aLocation
	);
	var pathBuffer = new PathBuffer_t;
	pathBuffer.buf = path + '\0';
	var manifest = new nsString_t;
	manifest.mData = pathBuffer.address();
	manifest.mLength = path.length;
	manifest.mFlags = 1 << 4; // F_FIXED
	var manifestPtr = manifest.address();
  
	try {
		var rv;
		var localFile = new nsILocalFile_t;
		rv = NS_NewLocalFile(manifest.address(), false, localFile.address());
		if (rv & 0x80000000) {
			throw Components.Exception("NS_NewLocalFile error", rv);
		}
		const NS_SKIN_LOCATION = 1;
		rv = XRE_AddJarManifestLocation(NS_SKIN_LOCATION, localFile);
		if (rv & 0x80000000) {
			throw Components.Exception("XRE_AddJarManifestLocation error", rv);
		}
	} finally {
		libxul.close();
	}
}

