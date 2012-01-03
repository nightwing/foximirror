/***********************************************************
 *
 * file utils
 *****************/
Cc = Components.classes
Ci = Components.interfaces
Cu = Components.utils
var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
//ZipReader = Components.Constructor("@mozilla.org/libjar/zip-reader;1", "nsIZipReader", "open");
Cu.import('resource://shadia/main.js')
var jarProtocolHandler = Services.io.getProtocolHandler("jar").QueryInterface(Ci.nsIJARProtocolHandler);

/**zr constants*/
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;
var PERMS_DIRECTORY = 0755;
var PERMS_FILE      = 0644;

function unlockJarFile(jarfile){
	var JARCache = jarProtocolHandler.JARCache
	var reader = JARCache.getZip(jarfile)
	if(!reader)
		return
	var entries = reader.findEntries('*.jar')
	while(entries.hasMore()){
		var subPath = entries.getNext()
		closeInner(subPath)	
	}	
	reader.close()
	function closeInner(innerPath){
		var reader = JARCache.getInnerZip(jarfile,innerPath)
		reader.close()
		/*return function reopen(){
			reader.openInner(JARCache.getZip(jarfile),innerPath)
		}*/
	}
}

function flushJarCache(aJarFile) {
	if(aJarFile){
		try{
			unlockJarFile()
		}catch(e){Components.utils.reportError(e)}
		Services.obs.notifyObservers(aJarFile, "flush-cache-entry", null);
	}
	//flush entire cache since "flush-cache-entry" doesn't work with inner jars
	Services.obs.notifyObservers(null, "chrome-flush-caches", null);
}

function flushStartupCache() {
	Services.obs.notifyObservers(null, "startupcache-invalidate", null);
}

function saveTextToLocaleUri(href, text){
	var uri = $shadia.getLocalURI(href)
	if(!uri)
		return false
	
	if(uri.scheme == 'file') {
		let file = uri.QueryInterface(Ci.nsIFileURL).file
		writeToFile(file, text)
		return true
	}
		
	if(uri.scheme == 'jar') {
		//uri.QueryInterface(Ci.nsINestedURI).innermostURI
		var jar = uri.QueryInterface(Ci.nsIJARURI).JARFile
		if(jar.scheme != 'file'){
			return false
		}
		if(uri.JAREntry.slice(-1)=='/'){
			Components.utils.reportError('attempt to override directory')
			return false
		}
		var jarFile = jar.QueryInterface(Ci.nsIFileURL).file
		syncWriteToJar(jarFile, uri.JAREntry, writeStringToJar, text)
		return true
	}
}
function saveFileToLocaleUri(href, origFile){
	var uri = $shadia.getLocalURI(href)
	if(!uri)
		return false
	
	if(uri.scheme == 'file') {
		let file = uri.QueryInterface(Ci.nsIFileURL).file
		if (file.exists())
			file.remove
		origFile.copyTo(file.parent, file.leafName)
		return true
	}
		
	if(uri.scheme == 'jar') {
		//uri.QueryInterface(Ci.nsINestedURI).innermostURI
		var jar = uri.QueryInterface(Ci.nsIJARURI).JARFile
		if(jar.scheme != 'file'){
			Components.utils.reportError("please don't use nested jars!")
			return false
		}
		if(uri.JAREntry.slice(-1)=='/'){
			Components.utils.reportError('attempt to override directory')
			return false
		}
		var jarFile = jar.QueryInterface(Ci.nsIFileURL).file
		syncWriteToJar(jarFile, uri.JAREntry, writeFileToJar, origFile)
		return true
	}
}
function deleteLocaleUri(href){
	var uri = $shadia.getLocalURI(href)
	if(!uri)
		return false
	
	if(uri.scheme == 'file') {
		let file = uri.QueryInterface(Ci.nsIFileURL).file
		try{
			file.remove(false)
		}catch(e){
			flushJarCache()
			file.remove(true)
		}
		return true
	}
		
	if(uri.scheme == 'jar') {
		//uri.QueryInterface(Ci.nsINestedURI).innermostURI
		var jar = uri.QueryInterface(Ci.nsIJARURI).JARFile
		if(jar.scheme != 'file'){
			return false
		}

		var jarFile = jar.QueryInterface(Ci.nsIFileURL).file
		syncWriteToJar(jarFile, uri.JAREntry, removeEntryFromJar)
		return true
	}
	return false
}

function renameLocaleUri(href, newName){
	if (href instanceof Ci.nsIFile){
		var file = href
	} else {
		var uri = $shadia.getLocalURI(href)
		if(!uri)
			return false
	}
	
	if(uri.scheme == 'file') {
		var file = uri.QueryInterface(Ci.nsIFileURL).file
	}

	if(file){
		let newFile = file.parent.clone()
		newFile.append(newName)
		
		if(newFile.exists())
			return false
		
		file.moveTo(file.parent, newName)
		return
	}
	
	if(uri.scheme == 'jar') {
		throw 'not implemented'
		var url = getCurrentURI()
		var channel = Services.io.newChannel(url, 0, null);
		var stream = channel.open();

		var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
		bstream.setInputStream(stream);

		bytes = bstream.readBytes(bstream.available());  
		bstream.close()
		p=1
	}
	
	return false
}



/**doesn't work for archives with opened archives inside*/
function syncWriteToJar(jarFile, entryPath, writer, data, compression){
	flushJarCache(jarFile)
	if(!entryPath)
		return
	try{
		dump(jarFile.spec)
		var zipW = new zipWriter();
		zipW.open(jarFile, PR_RDWR); // | PR_APPEND
		try{
			// remove entry
			if (zipW.hasEntry(entryPath)){
				if(typeof compression != 'number')
					var compression = zipW.getEntry(entryPath).compression			
				zipW.removeEntry(entryPath, false);	
			}
			//
			if(typeof compression!='number')
				compression = Ci.nsIZipWriter.COMPRESSION_DEFAULT//_NONE
				
			writer(zipW, entryPath, data, compression)
		}catch(e){
			var err = e.toString();
			Cu.reportError(e)
		}
	}catch(e){
		var err = e.toString();
		Cu.reportError(e)
	} finally {
		zipW.close();
	}
	
	return err
}

function writeFileToJar(zipW, entryPath, filePath, compression){    
    zipW.addEntryFile(entryPath, compression, filePath, false);       
}
function writeStringToJar(zipW, entryPath, data, compression){    
    var istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
	istream.setData(data, data.length);
	zipW.addEntryStream(entryPath, null, compression, istream, false)       
}
function writeBytesToJar(zipW, entryPath, data, compression){    
    var istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
	istream.setData(data, data.length);
	zipW.addEntryStream(entryPath, null, compression, istream, false)       
}

function removeEntryFromJar(){}




function extractFiles(aZipFile, aDir) {
	function getTargetFile(aDir, entry) {
		let target = aDir.clone();
		entry.split("/").forEach(function(aPart) {
			target.append(aPart);
		});
		return target;
	}

	let zipReader = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
	zipReader.open(aZipFile);

	try {
		// create directories first
		let entries = zipReader.findEntries("*/");
		while (entries.hasMore()) {
			var entryName = entries.getNext();
			let target = getTargetFile(aDir, entryName);
			if (!target.exists()) {
				try {
					target.create(Ci.nsILocalFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
				} catch (e) {
					Cu.reportError("extractFiles: failed to create target directory for " +
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
			target.permissions |= PERMS_FILE;
		}
	} finally {
		zipReader.close();
	}
}

/*
f=getCurrentFile()
f.moveTo
f.parent
f.leafName
//f.copyTo(f.parent, f.leafName+'b')
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



/*************************************** File IO **********************************/
function readEntireFile(file) {
    var data = "",
        str = {},
        fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream),
        converter = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);

    const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
    fstream.init(file, -1, 0, 0);
    converter.init(fstream, "UTF-8", 1024, replacementChar);
    while (converter.readString(4096, str) != 0){
        data += str.value;
    }
    converter.close();

    return data;
}

function writeToFile(file, text) {
    var fostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream),
        converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	
	if(!file.exists())
		file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0664)
	
    fostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
    converter.init(fostream, "UTF-8", 4096, 0x0000);
    converter.writeString(text);
    converter.close();
}

