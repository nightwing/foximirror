;(function(){

function log(x) log.$.push(x);
log.start = function() log.$ = [];
log.end = function() dump(log.$.join('\n'))
log.$ = [];

/**zr constants*/
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;


var maxFileCount = 1000, fileCount = 0, userCanceled = false

var excludePattern = /\.xpi$|\.zip$|\.rar$|thumbs.db$|^\.|^__/i
var specialPattern = /\.(xml|xul|jsm?|css)$/i
var ignorePatterns = []
var shouldIgnore
var _shouldIgnore = function(jarPath){
    var ignore = false
	for each(var p in ignorePatterns){
		if(p.re.test(jarPath)){
			ignore = p.include
		}	
	}
    
	return ignore
}

var initIgnorePatterns = function(contextFolder){
    ignorePatterns = []
	var file = contextFolder.clone()
	file.append('.xpiignore')
	if (!file.exists()){
		shouldIgnore = null
		return
	}
	
	readEntireFile(file).split('\n').forEach(function(x){
		x = x.trim()
		if(!x)
			return

		var i = x.indexOf(' ')
		var type = x.slice(0, i)
		var y = x.substr(i+1).trim()
		try{
			ignorePatterns.push({
				re: RegExp(y),
				include: type
			})
			log('pattern:' + x)
		}catch(e){
			log('invalid pattern:'+ x)
		}
	})
	
	shouldIgnore = _shouldIgnore
}
//
function isInvalid(entryName, root) {
	return excludePattern.test(entryName)	
}

function makeXPI(contextFolder){
	contextFolder = contextFolder;
	if(!contextFolder.isDirectory())
		contextFolder = contextFolder.parent
	var rdf = contextFolder.clone()
	rdf.append('install.rdf')
	if (!rdf.exists()) {
		prompt('no install rdf in current folder')
		return
	}
	
	log.start()
	initIgnorePatterns(contextFolder)
	
	packXPI(contextFolder, function(jar){
		jar.QueryInterface(Ci.nsILocalFile).reveal()
		log.end()
	})
}

function packXPI(folder, callback){
	var jar = folder.clone()
	
	// Create a new xpi file
	jar.append(folder.leafName + ".xpi");
	if(jar.exists()){
		try{
			var jarProtocolHandler = Services.io.getProtocolHandler("jar").QueryInterface(Ci.nsIJARProtocolHandler);

			var jarCache = jarProtocolHandler.JARCache;
			var reader = jarCache.getZip(jar);
			reader.close();
		}catch(e){}
		jar.remove(true)
	}
	jar.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
  
	var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
	var zipW = new zipWriter();
	zipW.open(jar, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
	
	
	// We don't want to block the main thread, so the zipping is done asynchronously
	// and here we get the notification that it has finished
	var observer = {
		onStartRequest: function(request, context) {},
		onStopRequest: function(request, context, status) {
			zipW.close();
			// Notify that we're done.
			callback(jar);
		}
	}
	
	// in case something goes wrong
	fileCount = 0, userCanceled = false
	try {
		addFolderContentsToZip(zipW, folder, "");
		zipW.processQueue(observer, null);	
	} catch(e) {
		zipW.close();
		Components.utils.reportError(e)
	}
}

/**
* function to add the contents of a folder recursively
* zipW a nsIZipWriter object
* folder a nsFile object pointing to a folder
* root a string defining the relative path for this folder in the zip
*/
function addFolderContentsToZip(zipW, folder, root, pendingFolders){
	var entries = folder.directoryEntries; 
	while(entries.hasMoreElements()){
		fileCount++
		if(fileCount > maxFileCount){
			userCanceled = !prompt("Processed " + maxFileCount + ' files\n continue?');
			if(userCanceled)
				return
			else
				fileCount = 0
		}
		
		
		var entry = entries.getNext(); 
		entry.QueryInterface(Ci.nsIFile);
		
		var entryName = entry.leafName
		var jarName = root + entryName
		
		//skip archives and .svn
		if (isInvalid(entryName, root)){
			log('skipping: ' + jarName)
			continue
		}
		var ignore = shouldIgnore && shouldIgnore(jarName)
		
		if (ignore == 'excludeFolder'){
			log('folder skipped by xpiIgnore: ' + jarName)
			continue
		}
		
		if (entry.isDirectory()) {
			var pf2 = pendingFolders ? pendingFolders.concat() : []
			pf2.push(jarName)
			//var i = [jarName, entry]
			//zipW.addEntryFile(i[0], Ci.nsIZipWriter.COMPRESSION_DEFAULT, i[1], true);
			var added = addFolderContentsToZip(zipW, entry, jarName + "/", pf2)
			if(added)
				pendingFolders = null
			continue
		}
		
		if (ignore == 'exclude') {
			log('file skipped by xpiIgnore: ' + jarName)
			continue
		}
		
		if (pendingFolders){
			for each(var i in pendingFolders)
				zipW.addEntryDirectory(i, 0, true);
			pendingFolders = null
		}
		
		
		if (specialPattern.test(jarName)) {
			log('adding trimmed: ' + jarName)
			addTrimmedFileContentsToJAR(zipW, jarName, entry)
		} else {
			log('adding verbatim: ' + jarName)
			zipW.addEntryFile(jarName, Ci.nsIZipWriter.COMPRESSION_DEFAULT, entry, true);
		}
	}
	
	if (!pendingFolders)
		return true
}

// 
function addTrimmedFileContentsToJAR(zipW, entryPath, file) {
	var data = readEntireFile(file)
	data = removeDebugCode(data)
	if (data.length < 10) {
		log('skipped: file too short')
		return
	}
	
	//var istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);	
	//istream.setData(data, data.length);
	//todo: do we need to keep encoding from file instead of converting everything to UTF-8
	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	converter.charset = "UTF-8";
	var istream = converter.convertToInputStream(data)

	zipW.addEntryStream(entryPath, null, Ci.nsIZipWriter.COMPRESSION_DEFAULT, istream, true)   
}

function removeDebugCode(code) {	
	var startMarker = 'devel__' + '('
	var endMarker = 'devel__' + ')'
	var i = 0, ans = '';
	
	function readBlock(){
		var i1 = i;
		i = code.indexOf(startMarker, i)
		if (i == -1) {
			ans += code.substr(i1)
			return false
		}
		ans += code.substring(i1, i)
		
		i = code.indexOf(endMarker, i + 1)
		return i != -1;
	}
	
	var n = 100;
	while(n-- && readBlock());

	return ans.replace(/^\s*dump\(.*$/gm, '')
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
    while (converter.readString(4096, str) != 0) {
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
/*************************************** File IO **********************************/
window.makeXPI = makeXPI

})()