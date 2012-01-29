let EXPORTED_SYMBOLS = [ "xblPlayground" ];

let shadiaStyleRegistrar=this

Cc=Components.classes
Ci=Components.interfaces
ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)

rph = ios.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
/*aliasFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
aliasFile.initWithPath("/some/absolute/path");
 
var aliasURI = ioService.newFileURI(aliasFile);
resProt.setSubstitution("myalias", aliasURI);*/


var  fp='G:\\javascript\\00\\content\\firebug\\external\\splitmenu.xml'

aliasFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
aliasFile.initWithPath(fp)
aliasURI = ios.newFileURI(aliasFile);
aliasURI = makeURI('chrome://global/content/bindings/toolbarbutton.xml#toolbarbutton',null,null);

var i=0,alias='shadia'+i+'.xml', bID='#splitmenu',bID='#toolbarbutton'
m='toolbarbutton#ff-LogoBtn{-moz-binding:url(resource:'+alias+bID+')!important}'

rph.setSubstitution(alias, aliasURI)


document.styleSheets[0].insertRule(m,2)



function getCssMirrorJarPath(){
	var cssMirrorDir=Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	
	var fileHandler = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
	var uri=fileHandler.getURLSpecFromFile(getCssMirrorDir());
		
	return 'jar:'+uri+'!/'
}

function getCssMirrorDir(){
	var cssMirrorDir=Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
	cssMirrorDir.append('cssMirrorStyles.zip')
	if(!cssMirrorDir.exists()){
		cssMirrorDir.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
		var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
		var zipW = new zipWriter();
		zipW.open(getCssMirrorDir(), PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
		let istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
		var data='readMe',entryPath='readMe'
		istream.setData(data, data.length);
		if (zipW.hasEntry(entryPath))
			zipW.removeEntry(entryPath,false)
		zipW.addEntryStream(entryPath,null,Ci.nsIZipWriter.COMPRESSION_NONE,istream,false)
		
		zipW.close();
	}
		
	return cssMirrorDir
}

//t=Date.now()//t-Date.now()
//register enabled styles
function registerStyles(){
	var ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
	var sss= Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)

	var cssMirrorJarPath=getCssMirrorJarPath()

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

