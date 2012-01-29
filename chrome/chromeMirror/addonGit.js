var XPIProviderBP = Components.utils.import("resource://gre/modules/XPIProvider.jsm")
t=XPIProviderBP.XPIProvider.bootstrapScopes["right@context.a.am"]//.eval('startup')



id
#>>

//Cu.getWeakReference(4).toString()

shutdown()
startup()
#>>

with(XPIProviderBP){    
      let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      file.persistentDescriptor = XPIProvider.bootstrappedAddons[id].descriptor;
      XPIProvider.callBootstrapMethod(id, XPIProvider.bootstrappedAddons[id].version,
                                      XPIProvider.bootstrappedAddons[id].type, file, "shutdown",
                                      BOOTSTRAP_REASONS.APP_SHUTDOWN);
}

with(XPIProviderBP){    
      let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      file.persistentDescriptor = XPIProvider.bootstrappedAddons[id].descriptor;
      XPIProvider.callBootstrapMethod(id, XPIProvider.bootstrappedAddons[id].version,
                                      XPIProvider.bootstrappedAddons[id].type, file, "shutdown",
                                      XPIProviderBP.BOOTSTRAP_REASONS.ADDON_DISABLE);
}
#>>
XPIProviderBP
//unloadBootstrapScope


XPIProvider=XPIProviderBP.XPIProvider
XPIProviderBP.XPIDatabase.getVisibleAddonForID("absolute@load.control.am", function(aAddon){
 let file = aAddon._installLocation.getLocationForID(aAddon.id);
 XPIProviderBP.XPIProvider.callBootstrapMethod(aAddon.id, aAddon.version, aAddon.type, file, "shutdown",
                                     XPIProviderBP.BOOTSTRAP_REASONS.ADDON_DISABLE);
 XPIProviderBP.XPIProvider.unloadBootstrapScope(aAddon.id);
})
XPIProvider=XPIProviderBP.XPIProvider
XPIProviderBP.XPIDatabase.getVisibleAddonForID("absolute@load.control.am", function(aAddon){
 let file = aAddon._installLocation.getLocationForID(aAddon.id);
 XPIProviderBP.XPIProvider.callBootstrapMethod(aAddon.id, aAddon.version, aAddon.type, file, "startup",
                                      XPIProviderBP.BOOTSTRAP_REASONS.ADDON_ENABLE);
})



url="file:///D:/ffaddons/foxifier@a.am/rightcontext/"
XPIProviderBP = Components.utils.import("resource://gre/modules/XPIProvider.jsm")

XPIProviderBP.loadManifestFromDir(getLocalFile(url))


//XPIProviderBP.AddonInstall.createInstall(location ,getLocalFile(url))


//XPIProviderBP.AddonInstall.createInstall(location ,getLocalFile(url)) 

with(XPIProviderBP){
XPIProviderBP.dump = $shadia.dump
;(function (aCallback) {
    this.file = this.sourceURI.QueryInterface(Ci.nsIFileURL).file.QueryInterface(Ci.nsILocalFile);
    dump(1)
    if (!this.file.exists()) {        
        return;
    }
    this.state = AddonManager.STATE_DOWNLOADED;
    this.progress = this.file.fileSize;
    this.maxProgress = this.file.fileSize;
    
    this.addon = loadManifestFromDir(this.file)
    
    this.addon._install = this;
    this.name = this.addon.selectedLocale.name;
    this.type = this.addon.type;
    this.version = this.addon.version;
    
  
    let self = this;
    dump(1)
    XPIDatabase.getVisibleAddonForID(self.addon.id, function(aAddon) {
        dump(1)
        self.existingAddon = aAddon;

        self.addon.updateDate = Date.now();
        self.addon.installDate = aAddon ? aAddon.installDate : self.addon.updateDate;

        self.state = AddonManager.STATE_DOWNLOADED;
        AddonManagerPrivate.callInstallListeners("onNewInstall", self.listeners, self.wrapper);
        self.install()
        aCallback(self)
    });
        
    
}).call( new XPIProviderBP.AddonInstall(
        	XPIProvider.installLocationsByName[KEY_APP_PROFILE],
			Services.io.newURI(url,null,null)
		),
		dump
	)
}