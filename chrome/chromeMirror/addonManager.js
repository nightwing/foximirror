//filepicker
function setFilters(fp, filter){
   // fp.appendFilter("JavaScript files", "*.js");
	//fp.appendFilters(nsIFilePicker.filterXUL);
}

function initFP(filter){
	fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilters(nsIFilePicker.filterAll);
}



function loadFileToTextbox(win, textbox, filter){
	if(!fp)
		initFP(filter);
	fp.init(win, "Select a File", nsIFilePicker.modeOpen);
	var res = fp.show();
	if(res == nsIFilePicker.returnOK) {
		textbox.value = readEntireFile(fp.file);
	}
}

function saveFileFromTextbox(win, textbox, filter){
	if(!fp)
		initFP(filter);
	fp.init(win, "Save As", nsIFilePicker.modeSave);
	var res = fp.show();
	if(res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
		writeToFile(fp.file, textbox.value);
	}
}

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


var fails=[],nonfails=[]
// make compatible
compatibleForever={	
	/****/
	removeMinMaxVersionInString: function(str){
		return str.replace(/maxVersion>(.+)<\//g,"maxVersion>333.3.3</")
				  .replace(/minVersion>(.+)<\//g,"minVersion>1.0.0</");
		
	},
	removeMinMaxVersionInDir: function(addonDir){
		var dir = addonDir.clone();
		dir.append("install.rdf");
		var srt=readEntireFile(dir);
		if(!srt){
			Components.utils.reportError("Failed to read " + dir.path);
			return
		}
		srt=this.removeMinMaxVersionInString(srt)
		if(!writeToFile(dir, srt)){
		   Components.utils.reportError("Failed to write " + dir.path);
		   return
		}
	},
	removeMinMaxVersionInJar: function(addonJar){return
		var uri=fileHandler.getURLSpecFromFile(addonJar)
		uri='jar:'+uri+'!/'+'install.rdf'
		var srt=makeReq(uri)		
		if(!srt){
			Components.utils.reportError("Failed to read " + addonJar.path);
			return
		}
		srt=this.removeMinMaxVersionInString(srt)
		try{
			var copy=addonJar.parent.clone()
			copy.append(addonJar.leafName+'.bak.zip')
			if(!copy.exists())
				addonJar.copyTo(addonJar.parent,addonJar.leafName+'.bak.zip')
			var err=syncWriteToJar(addonJar, 'install.rdf', writeStringToJar, srt)
			if(err){prompt(addonJar.path,'fail'),fails.push(addonJar)}
			else{prompt(addonJar.path),nonfails.push(addonJar)}
		}catch(e){
		   Components.utils.reportError("Failed to write " + addonJar.path);
		   Components.utils.reportError(e);
		   return
		}
	},
	removeAllMinMax: function(){
		for( var i in addonList){
			var m=addonList[i];
			if(m.addon){//&&m.addon.appDisabled){
				if(m.file.isDirectory())
					this.removeMinMaxVersionInDir(m.file)
				else if(/\.jar$|\.xpi$|\.zip$/.test(m.file.leafName))
					this.removeMinMaxVersionInJar(m.file)
				//jn.say(jn.inspect(m.file)+m.addon.appDisabled)
			}
		}

	},
	
	cloneRDFOld: function(){
		this.dirservCID = '@mozilla.org/file/directory_service;1';	
		this.propsIID   = Components.interfaces.nsIProperties;	
		this.fileIID    = Components.interfaces.nsIFile;

		var dir = Components.classes[this.dirservCID].createInstance(this.propsIID).get("ProfD", this.fileIID);
		var file2 = dir.clone();
		dir.append("extensions.rdf")
		file2.append("extensions.rdf1")
		var srt=compatibleForever.FileIO.read(dir)
		srt=srt.replace(/maxVersion=\"(.+)\"/g,'maxVersion="333.3.3"').replace(/minVersion=\"(.+)\"/g,'minVersion="1.0.0"')
		if(!compatibleForever.FileIO.write(file2, srt)){
			   throw Error("Failed to write " + dir.path);
		}	
	},
	
	almostForeverOld:function(){
		var o=new String(),ans=[];
		o=this.nsIExtensionManagerComponent.getItemList(14,o)
		for(i in o){
			var n=o[i]
			if(n.maxAppVersion!=="333.3.3"||n.minAppVersion!=="1.0.0"){
				ans.push(n.name+" : "+n.id+" : "+n.minAppVersion+" - "+n.maxAppVersion)
				this.removeMinMaxVersion(n.id)
			}
		}
		return ans.join("\n")
	},
	
	/* Components.utils.import("resource://gre/modules/AddonManager.jsm");AddonManager.getAllAddons(function(a){alert(a.length)}) */
	

}


/*
XPIProviderBP=Components.utils.import("resource://gre/modules/XPIProvider.jsm")//
bart=XPIProviderBP.XPIDatabase.getAddons()[0]

Components.utils.import("resource://gre/modules/Services.jsm")
XPIProviderBP.XPIDatabase.updateTargetApplications
targets=[{id:Services.appinfo.ID,minVersion:0,maxVersion:400}]
XPIProviderBP.XPIDatabase._getTargetApplications(bart)[0]

XPIProviderBP.XPIDatabase.updateTargetApplications(bart,targets)

XPIProviderBP.XPIDatabase._getTargetApplications(bart)[0].maxVersion
*/

/****/
function makeAllAddonsCompatible(){
	var XPIProviderBP=Components.utils.import("resource://gre/modules/XPIProvider.jsm")//

	with(XPIProviderBP){function comp() {
		var aTarget={id:Services.appinfo.ID,minVersion:1,maxVersion:333}
		var addons = this.getAddons();
		this.beginTransaction();
		try {
			let stmt = this.getStatement("updateTargetApplications");
			addons.forEach(function(aAddon){
				stmt.params.internal_id = aAddon._internal_id;
				stmt.params.id = aTarget.id;
				stmt.params.minVersion = aTarget.minVersion;
				stmt.params.maxVersion = aTarget.maxVersion;
				executeStatement(stmt);
			});
			this.commitTransaction();
		}catch (e) {
			this.rollbackTransaction();
			throw e;
		}
	}}
	comp.call(XPIProviderBP.XPIDatabase,null)
	XPIProviderBP.XPIProvider.updateAllAddonDisabledStates()
}


/*
reopenJarCache(mAddonData.file)

addonJar=mAddonData.file
reopenJarCache(mAddonData.file)
var uri=fileHandler.getURLSpecFromFile(addonJar)
		uri='jar:'+uri+'!/'+'install.rdf'
		var srt=makeReq(uri)


var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
	var zipW = new zipWriter();
	zipW.open(mAddonData.file, PR_RDWR | PR_APPEND | PR_SYNC);
if(zipW.hasEntry('install.rdf2'))
	zipW.removeEntry('install.rdf2',false)

	//zipW.addEntryStream('install.rdf2',null,Ci.nsIZipWriter.COMPRESSION_FASTEST,istream,false)

//zipW.close();
compatibleForever.removeMinMaxVersionInString(srt)


data=srt.replace(/maxVersion>(.+)<\//g,"maxVersion>3373.3.3</").replace(/minVersion>(.+)<\//g,"minVersion>1.0.0</");
let istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
	istream.setData(data, data.length);
istream

addonJar.QueryInterface(Ci.nsILocalFile)

reopenJarCache(mAddonData.file)

data
zipW.close()
*/