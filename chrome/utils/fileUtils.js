
/***********************************************************
 *
 * file utils
 *****************/
Cc=Components.classes
Ci=Components.interfaces
Cu=Components.utils
var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
//ZipReader = Components.Constructor("@mozilla.org/libjar/zip-reader;1",
 //                                      "nsIZipReader", "open");

ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
var jarProtocolHandler = ios.getProtocolHandler("jar").QueryInterface(Ci.nsIJARProtocolHandler);

/**zr constants*/
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;

/***
var jarfile=getCurrentFile()
JARCache=jarProtocolHandler.JARCache
a=rd.findEntries('*.jar').getNext()
rd=JARCache.getZip(jarfile)

function closeInner(innerPath){
	var reader=JARCache.getInnerZip(jarfile,innerPath)
	reader.close()
	return function reopen(){
		reader.openInner(JARCache.getZip(jarfile),innerPath)
	}
}
*/
function unlockJarFile(jarfile){
	var JARCache = jarProtocolHandler.JARCache
	var reader = JARCache.getZip(jarfile)
	var entries = reader.findEntries('*.jar')
	while(entries.hasMore()){
		var subPath = entries.getNext()
		closeInner(subPath)	
	}	
	reader.close()
	function closeInner(innerPath){
		var reader=JARCache.getInnerZip(jarfile,innerPath)
		reader.close()
		return function reopen(){
			reader.openInner(JARCache.getZip(jarfile),innerPath)
		}
	}
}

/**doesn't work for archives with opened archives inside*/
function syncWriteToJar(jarFile, entryPath, writer, data, compression){
    var jarCache = jarProtocolHandler.JARCache;
    var reader = jarCache.getZip(jarFile);
    reader.close();
	try{
		var zipW = new zipWriter();
		zipW.open(jarFile, PR_RDWR); // | PR_APPEND
		try{
			// remove entry
			if (zipW.hasEntry(entryPath)){
				if(typeof compression!='number')
					var compression=zipW.getEntry(entryPath).compression			
				zipW.removeEntry(entryPath, false);	
			}
			//
			if(typeof compression!='number')
				compression=Ci.nsIZipWriter.COMPRESSION_DEFAULT//_NONE
			writer(zipW, entryPath, data, compression)
		}catch(e){var err=e.toString();Cu.reportError(e)}
		zipW.close();
	}catch(e){var err=e.toString();Cu.reportError(e)}	
    reader.open(jarFile);
	return err
}

function writeFileToJar(zipW, entryPath, data, compression){    
    zipW.addEntryFile(entryPath, compression, filePath, false);       
}
function writeStringToJar(zipW, entryPath, data, compression){    
    var istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
	istream.setData(data, data.length);
	zipW.addEntryStream(entryPath, null, compression, istream, false)       
}

function removeEntryFromJar(){}


function readDataFromJar(jarFilePath,entryPath){	
	//????
}


function extractFiles(aZipFile, aDir) {
  function getTargetFile(aDir, entry) {
    let target = aDir.clone();
    entry.split("/").forEach(function(aPart) {
      target.append(aPart);
    });
    return target;
  }

  let zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].
                  createInstance(Ci.nsIZipReader);
  zipReader.open(aZipFile);

  try {
    // create directories first
    let entries = zipReader.findEntries("*/");
    while (entries.hasMore()) {
      var entryName = entries.getNext();
      let target = getTargetFile(aDir, entryName);
      if (!target.exists()) {
        try {
          target.create(Ci.nsILocalFile.DIRECTORY_TYPE,
                        FileUtils.PERMS_DIRECTORY);
        }
        catch (e) {
          ERROR("extractFiles: failed to create target directory for " +
                "extraction file = " + target.path, e);
        }
      }
    }

    entries = zipReader.findEntries(null);
    while (entries.hasMore()) {
      let entryName = entries.getNext();
      let target = getTargetFile(aDir, entryName);
      if (target.exists())
        continue;

      zipReader.extract(entryName, target);
      target.permissions |= FileUtils.PERMS_FILE;
    }
  }
  finally {
    zipReader.close();
  }
}

/*
f=getCurrentFile()
f.moveTo
f.parent
f.leafName
//f.copyTo(f.parent,f.leafName+'b')
//f.reveal()
//syncWriteToJar(f,'r1.rdf',writeStringToJar,syncWriteToJar.toString())
f
g=f.parent.clone()
g.append(f.leafName+'b')
g
syncWriteToJar(g,'r1.rdf',writeStringToJar,syncWriteToJar.toString())
f.moveTo(f.parent,f.leafName+'g.xpi')
g=f.parent.clone()
g.append(f.leafName+'g.xpi')

syncWriteToJar(f,'r11.rdf',writeStringToJar,syncWriteToJar.toString())

f.moveTo(f.parent,f.leafName.slice(0,-5))
*/


/* var store2 = Cc["@mozilla.org/file/directory_service;1"]
                                  .getService(Ci.nsIProperties).get("ProfD",  Ci.nsIFile);
store2.append("quizfx"); */

function importQuiz(){
    var file = pickZipQuiz();
    var fileName = file.leafName;
    var extensionDelimiter = fileName.lastIndexOf(".");
    var prefix = fileName.substr(0, extensionDelimiter);
    store2.append(prefix);
    alert(store2.path);
    if(!store2.exists() || !store2.isDirectory() ){ // if it doesn't exist, create
        store2.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);
	}
    alert(store2.path);
    extractExtensionFiles(prefix, file);
}


function pickZipQuiz(){
    const nsIFilePicker = Ci.nsIFilePicker;

    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Dialog Title", nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		var file = fp.file;
		// Get the path as string. Note that you usually won't
		// need to work with the string paths.
		var path = fp.file.path;
		// work with returned nsILocalFile...
		return file;   
    }
}

function extractExtensionFiles(extensionID, xpiFile) {
    var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
    zipReader.open(xpiFile);
    zipReader.test(null);
    // create directories first
    var entries = zipReader.findEntries("*/");
    while (entries.hasMore()) {
      var entryName = entries.getNext();
      var target = getItemFile(entryName);
      if (!target.exists()) {
        try {
          target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
        }
        catch (e) {
          alert("extractExtensionsFiles: failed to create target directory for extraction " +
                " file = " + target.path + ", exception = " + e + "\n");
        }
      }
    }

    entries = zipReader.findEntries(null);
    while (entries.hasMore()) {
      var entryName = entries.getNext();
      target = getItemFile(entryName);
      if (target.exists())
        continue;

      try {
        target.create(Ci.nsILocalFile.DIRECTORY_TYPE, 0777);
      }
      catch (e) {
        alert("extractExtensionsFiles: failed to create target file for extraction " +
              " file = " + target.path + ", exception = " + e + "\n");
      }
      zipReader.extract(entryName, target);
    }
    zipReader.close();
}

function getItemFile( filePath) {
    //alert(store2.path);
    var itemLocation = store2.clone();
    var parts = filePath.split("/");
    for (var i = 0; i < parts.length; ++i)
      itemLocation.append(parts[i]);
    return itemLocation;
}




/*************************************** File IO **********************************/
function readEntireFile(file) {
    var data = "",
        str = {},
        fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream),
        converter = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);

    const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
    fstream.init(file, -1, 0, 0);
    converter.init(fstream, "UTF-8", 1024, replacementChar);
    while (converter.readString(4096, str) != 0)
    {
        data += str.value;
    }
    converter.close();

    return data;
}

function writeToFile(file, text) {
    var fostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream),
        converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);

    fostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
    converter.init(fostream, "UTF-8", 4096, 0x0000);
    converter.writeString(text);
    converter.close();
}

/***********************************************************************************/
function AddJarManifestLocation(path) {
	Components.utils.import("resource://gre/modules/ctypes.jsm");
	var file = Cc["@mozilla.org/file/directory_service;1"]
				.getService(Ci.nsIProperties)
				.get("resource:app", Ci.nsIFile);
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
