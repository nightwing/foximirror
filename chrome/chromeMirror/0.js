utils=window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);

ui=utils.sendQueryContentEvent(utils.QUERY_CARET_RECT, 0, 0, 0, 0)
ui

function getDrives(){
    var root = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);  
    root.initWithPath("\\\\.");  
    var drivesEnum = root.directoryEntries, drives = [];  
    while (drivesEnum.hasMoreElements()) {  
		drives.push(drivesEnum.getNext().QueryInterface(Ci.nsILocalFile).path);  
    }
	return drives
}	


readEntireFile(file){
   var data = "";  
   var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);  
   var cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);  
   fstream.init(file, -1, 0, 0);  
   cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish  
     
   let (str = {}) {  
     let read = 0;  
     do {   
       read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value  
       data += str.value;  
     } while (read != 0);  
   }
   cstream.close(); // this closes fstream  
}
     
  
function readEntireFile(file){
	var data = "",str = {};
	var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	fstream.init(file, -1, 0, 0);
	const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	var converter = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
	converter.init(fstream, "UTF-8", 1024, replacementChar);
	while (converter.readString(4096, str) != 0) {
		data += str.value;
	}
	converter.close();
	
	return data;
}

function writeFile(file, text){
	var fostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	fostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);// write, create, truncate
	var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	converter.init(fostream, "UTF-8", 4096, 0x0000);
	converter.writeString(text);
	converter.close();
}
  
  
   // open an input stream from file  
   var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);  
   istream.init(file, 0x01, 0444, 0);  
   istream.QueryInterface(Ci.nsILineInputStream);  
     
   // read lines into array  
   var line = {}, lines = [], hasmore;  
   do {  
     hasmore = istream.readLine(line);  
     lines.push(line.value);   
   } while(hasmore);  
     
   istream.close();  
     
   // do something with read data  
   alert(lines);  
  
  
  
  
   1. var appInfo=Cc["@mozilla.org/xre/app-info;1"]  
   2.                    .getService(Ci.nsIXULAppInfo);  
   3. var isOnBranch = appInfo.platformVersion.indexOf("1.8") == 0;  
   4. var ios=Cc["@mozilla.org/network/io-service;1"]  
   5.                   .getService(Ci.nsIIOService);  
   6. var fileURI=ios.newFileURI(file);  
   7. var channel = ios.newChannelFromURI(fileURI);  
   8. var observer = {  
   9.   onStreamComplete : function(aLoader, aContext, aStatus, aLength, aResult)  
  10.   {  
  11.     alert(aResult);  
  12.   }  
  13. };  
  14. var sl = Cc["@mozilla.org/network/stream-loader;1"].  
  15.                    createInstance(Ci.nsIStreamLoader);  
  16. if (isOnBranch) {  
  17.   sl.init(channel, observer, null);  
  18. } else {  
  19.   sl.init(observer);  
  20.   channel.asyncOpen(sl, channel);  
  21. }  

  



/* Zipping functions */
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;
 
/**
* folder is a nsFile pointing to a folder TmpD
* callback is a function that it's called after the zip is created. It has one parameter: the nsFile created
*/
function zipFolder(folder, callback){
 // get TMP directory 
 var nsFile = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("Desk", Ci.nsIFile);
 
 // Create a new file
 nsFile.append( folder.leafName + ".zip");
 nsFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
  
 var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
 var zipW = new zipWriter();
  
 zipW.open(nsFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
  
 addFolderContentsToZip(zipW, folder, "");
  
 // We don't want to block the main thread, so the zipping is done asynchronously
 // and here we get the notification that it has finished
 var observer = {
  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status){
   zipW.close();
   // Notify that we're done.
   callback(nsFile);
  }
 }
 
 zipW.processQueue(observer, null);
}
 
/**
* function to add the contents of a folder recursively
* zipW a nsIZipWriter object
* folder a nsFile object pointing to a folder
* root a string defining the relative path for this folder in the zip
*/
function addFolderContentsToZip(zipW, folder, root){
 var entries = folder.directoryEntries; 
 while(entries.hasMoreElements())  { 
  var entry = entries.getNext(); 
  entry.QueryInterface(Ci.nsIFile); 
  zipW.addEntryFile(root + entry.leafName, Ci.nsIZipWriter.COMPRESSION_DEFAULT, entry, true);
  if (entry.isDirectory())
   addFolderContentsToZip(zipW, entry, root + entry.leafName + "/");
 }
}


































  var nsFile = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("Desk", Ci.nsIFile);
nsFile.append('hl')
nsFile






/* Zipping functions */
var PR_RDONLY      = 0x01;
var PR_WRONLY      = 0x02;
var PR_RDWR        = 0x04;
var PR_CREATE_FILE = 0x08;
var PR_APPEND      = 0x10;
var PR_TRUNCATE    = 0x20;
var PR_SYNC        = 0x40;
var PR_EXCL        = 0x80;
 
/**
* folder is a nsFile pointing to a folder TmpD
* callback is a function that it's called after the zip is created. It has one parameter: the nsFile created
*/
function zipFolder(folder, callback){
 // get TMP directory 
 var nsFile = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("Desk", Ci.nsIFile);
 
 // Create a new file
 nsFile.append( folder.leafName + ".zip");
 nsFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
  
 var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
 var zipW = new zipWriter();
  
 zipW.open(nsFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
  
 addFolderContentsToZip(zipW, folder, "");
  
 // We don't want to block the main thread, so the zipping is done asynchronously
 // and here we get the notification that it has finished
 var observer = {
  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status){
   zipW.close();
   // Notify that we're done.
   callback(nsFile);
  }
 }
 
 zipW.processQueue(observer, null);
}
 
/**
* function to add the contents of a folder recursively
* zipW a nsIZipWriter object
* folder a nsFile object pointing to a folder
* root a string defining the relative path for this folder in the zip
*/
function addFolderContentsToZip(zipW, folder, root){
 var entries = folder.directoryEntries; 
 while(entries.hasMoreElements())  { 
  var entry = entries.getNext(); 
  entry.QueryInterface(Ci.nsIFile); 
  zipW.addEntryFile(root + entry.leafName, Ci.nsIZipWriter.COMPRESSION_NONE, entry, true);
  if (entry.isDirectory())
   addFolderContentsToZip(zipW, entry, root + entry.leafName + "/");
 }
}

zipFolder(nsFile,function(nsFile){nsFile.QueryInterface(Ci.nsILocalFile).reveal();


 let istream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
 TEST_DATA='opp-***'
istream.setData(TEST_DATA, TEST_DATA.length);
istream

var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
 var zipW = new zipWriter();

 zipW.open(nsFile, PR_RDWR | PR_APPEND | PR_SYNC);

entryPath='make.sh'
if (zipW.hasEntry(entryPath))
zipW.removeEntry(entryPath,false)
zipW.addEntryStream(entryPath,null,Ci.nsIZipWriter.COMPRESSION_NONE,istream,false)
zipW.comment = "This is a comment.";

zipW.close()

})