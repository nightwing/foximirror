let EXPORTED_SYMBOLS = [ "$shadiaFile" ];

let $shadiaFile=this

Cc=Components.classes
Ci=Components.interfaces


/**zr constants*/
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;


function getCssMirrorJarPath(){
	var cssMirrorDir=Services.dirsvc.get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	
	var fileHandler = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
	var uri=fileHandler.getURLSpecFromFile(getCssMirrorDir());
		
	return 'jar:'+uri+'!/'
}

function getCssMirrorDir(){
	var cssMirrorDir=Services.dirsvc.get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	if(!cssMirrorDir.exists()){
		cssMirrorDir.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
		var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
		var zipW = new zipWriter();
		zipW.open(cssMirrorDir, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
		let istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
		var data='shadiaglue{-moz-binding:url("chrome://shadia/content/bindings/debug.xml#shadiaGlue")!important}\n'+
			'parseerror{-moz-binding:url("chrome://shadia/content/bindings/debug.xml#parseerror")!important}\n'+
			'*{-moz-tab-size:4!important}\n'
		var entryPath='readMe'
		istream.setData(data, data.length);
		if (zipW.hasEntry(entryPath))
			zipW.removeEntry(entryPath, false)
		zipW.addEntryStream(entryPath, null, Ci.nsIZipWriter.COMPRESSION_NONE, istream, false)
		
		zipW.close();
	}
		
	return cssMirrorDir
}

//t=Date.now()//t-Date.now()
//register enabled styles
function registerStyles(){
	var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
	var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)

	var cssMirrorJarPath = getCssMirrorJarPath()

	var gPrefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
	var prefBranch = gPrefService.getBranch(null).QueryInterface(Ci.nsIPrefBranch2)

	if(!prefBranch.prefHasUserValue('extensions.shadia.enabledStyles'))
		return
	var enabledStyles=prefBranch.getCharPref('extensions.shadia.enabledStyles')
	enabledStyles.split(',').forEach(function(name){
		if(name)try{
			var uri=cssMirrorJarPath+name
			uri=ios.newURI(uri,null,null)
			sss.loadAndRegisterSheet(uri,sss.AGENT_SHEET)
		}catch(e){Components.utils.reportError(e)}
	})
}

registerStyles()

