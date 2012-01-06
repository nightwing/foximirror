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
		
		var existingAddon = getExistingAddon(extId)
		if (file.exists()) {
			if (!prompt('do you want to repalce?\n'+file.path,'yes please'))
				return
			file.remove(true)
		}
		var xpiFile=file.parent
		xpiFile.append(extId+'.xpi')
		if (xpiFile.exists()) {
			if(!prompt('do you want to repalce?\n'+xpiFile.path,'yes please'))
				return
			//unlockJarFile(file)
			flushJarCache(xpiFile)
			xpiFile.remove(true)
		}

		file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666)
		writeToFile(file, extFile.parent.path);
		
		document.getElementById('restart').hidden=false
		updateAddonManager(extId, existingAddon)
	}catch(e){
		prompt("Problem! Could not deploy extension. File I/O Error!",e); 
		throw e
	}
}
/************************************************/
getExistingAddon = function(id) {
	try{
		var XPIProviderBP = Components.utils.import("resource://gre/modules/XPIProvider.jsm")
		XPIProvider = XPIProviderBP.XPIProvider
		var iloc = XPIProvider.installLocationsByName["app-profile"]
		
		var oldFile = iloc._IDToFileMap[id] && iloc.getLocationForID(id);
		var existingAddon = oldFile && XPIProviderBP.loadManifestFromFile(oldFile)
		existingAddon._installLocation = iloc
		return existingAddon
	}catch(e){}
}

updateAddonManager = function(id, existingAddon) {
	var XPIProviderBP = Components.utils.import("resource://gre/modules/XPIProvider.jsm")
	XPIProvider = XPIProviderBP.XPIProvider
	var iloc = XPIProvider.installLocationsByName["app-profile"]
	
	iloc._linkedAddons = []
	iloc._readAddons()
	dump(iloc._linkedAddons)
	
	var file = iloc.getLocationForID(id);
	dump(file)
	frt=file
	var addon = XPIProviderBP.loadManifestFromFile(file)

	var install = new XPIProviderBP.AddonInstall(iloc)

	install.init = function() {
		this.addon = addon;
		this.sourceURI=Services.io.newFileURI(addon._sourceBundle);

		this.updateAddonURIs();

		this.addon._install = this;
		this.name = this.addon.selectedLocale.name;
		this.type = this.addon.type;
		this.version = this.addon.version;
		
		
		this.existingAddon = existingAddon
	}
	install.init()
	
	// XPIProviderBP.LOG=dump
with(XPIProviderBP) {
    install.startInstall = function AI_startInstall() {
        this.state = AddonManager.STATE_INSTALLING;
        if (!AddonManagerPrivate.callInstallListeners("onInstallStarted", this.listeners, this.wrapper)) {
            this.state = AddonManager.STATE_DOWNLOADED;
            XPIProvider.removeActiveInstall(this);
            AddonManagerPrivate.callInstallListeners("onInstallCancelled", this.listeners, this.wrapper)
            return;
        }

        // Find and cancel any pending installs for the same add-on in the same
        // install location
        XPIProvider.installs.forEach(function(aInstall) {
            if (
				aInstall.state == AddonManager.STATE_INSTALLED
				&& aInstall.installLocation == this.installLocation
				&& aInstall.addon.id == this.addon.id
			)
				aInstall.cancel();
        }, this);

        let isUpgrade = this.existingAddon && this.existingAddon._installLocation == this.installLocation;
        let requiresRestart = XPIProvider.installRequiresRestart(this.addon);

        //LOG("Starting install of " + this.sourceURI.spec);
        AddonManagerPrivate.callAddonListeners("onInstalling", createWrapper(this.addon), requiresRestart);

        try {
            if (requiresRestart) {
				let stagedAddon = this.installLocation.getStagingDir();
                // Cache the AddonInternal as it may have updated compatibiltiy info
                let stagedJSON = stagedAddon.clone();
                stagedJSON.leafName = this.addon.id + ".json";
                if (stagedJSON.exists())
                    stagedJSON.remove(true);
                let stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
                let converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);

                try {
                    stream.init(stagedJSON, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE, FileUtils.PERMS_FILE, 0);
                    converter.init(stream, "UTF-8", 0, 0x0000);
                    converter.writeString(JSON.stringify(this.addon));
                } finally {
                    converter.close();
                    stream.close();
                }

                LOG("Install of " + this.sourceURI.spec + " completed.");
                this.state = AddonManager.STATE_INSTALLED;
                if (isUpgrade) {
                    delete this.existingAddon.pendingUpgrade;
                    this.existingAddon.pendingUpgrade = this.addon;
                }
                AddonManagerPrivate.callInstallListeners("onInstallEnded", this.listeners, this.wrapper, createWrapper(this.addon));
            } else {
                // The install is completed so it should be removed from the active list
                XPIProvider.removeActiveInstall(this);

                // TODO We can probably reduce the number of DB operations going on here
                // We probably also want to support rolling back failed upgrades etc.
                // See bug 553015.
                // Deactivate and remove the old add-on as necessary
                let reason = BOOTSTRAP_REASONS.ADDON_INSTALL;
                if (this.existingAddon) {
                    if (Services.vc.compare(this.existingAddon.version, this.addon.version) < 0)
						reason = BOOTSTRAP_REASONS.ADDON_UPGRADE;
                    else
						reason = BOOTSTRAP_REASONS.ADDON_DOWNGRADE;

                    if (this.existingAddon.bootstrap) {
                        let file = this.existingAddon._installLocation.getLocationForID(this.existingAddon.id);
                        if (this.existingAddon.active) {
                            XPIProvider.callBootstrapMethod(this.existingAddon.id, this.existingAddon.version, file, "shutdown", reason);
                        }

                        XPIProvider.callBootstrapMethod(this.existingAddon.id, this.existingAddon.version, file, "uninstall", reason);
                        XPIProvider.unloadBootstrapScope(this.existingAddon.id);
                        flushStartupCache();
                    }

                    /*if (!isUpgrade && this.existingAddon.active) {
                        this.existingAddon.active = false;
                        XPIDatabase.updateAddonActive(this.existingAddon);
                    }*/
                }

                // Install the new add-on into its final location
                let existingAddonID = this.existingAddon ? this.existingAddon.id : null;
                let file = this.addon._sourceBundle

                // Update the metadata in the database
                this.addon._installLocation = this.installLocation;
                this.addon.updateDate = recursiveLastModifiedTime(file);
                this.addon.visible = true;
				this.addon.active = true

				if (isUpgrade) {
					XPIDatabase.updateAddonMetadata(this.existingAddon, this.addon, file.persistentDescriptor);
				} else {
					this.addon.installDate = this.addon.updateDate;
					XPIDatabase.addAddonMetadata(this.addon, file.persistentDescriptor);
				}                

                // Retrieve the new DBAddonInternal for the add-on we just added
                let self = this;
                //XPIDatabase.getAddonInLocation(this.addon.id, this.installLocation.name, function(a) {
                   // dump(a)
                    
                    gtt=self
                    //self.addon = a;
                    if (self.addon.bootstrap) {
                        XPIProvider.callBootstrapMethod(self.addon.id, self.addon.version, file, "install", reason);
                        if (self.addon.active) {
                            XPIProvider.callBootstrapMethod(self.addon.id, self.addon.version, file, "startup", reason);
                        } else {
                            XPIProvider.unloadBootstrapScope(self.addon.id);
                        }
                    }
                    AddonManagerPrivate.callAddonListeners("onInstalled", createWrapper(self.addon));

                    LOG("Install of " + self.sourceURI.spec + " completed.");
                    self.state = AddonManager.STATE_INSTALLED;
                    AddonManagerPrivate.callInstallListeners("onInstallEnded", self.listeners, self.wrapper, createWrapper(self.addon));
                //});
            }
        } catch (e) {
            WARN("Failed to install", e);
            this.state = AddonManager.STATE_INSTALL_FAILED;
            this.error = AddonManager.ERROR_FILE_ACCESS;
            XPIProvider.removeActiveInstall(this);
            AddonManagerPrivate.callInstallListeners("onInstallFailed", this.listeners, this.wrapper);
        } finally {
        }
    }
}
	install.startInstall()
}



/************************************************/





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

