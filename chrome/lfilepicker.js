var fp = null;
var nsIFilePicker = Ci.nsIFilePicker;

function setFilters(fp, filter){
   // fp.appendFilter("JavaScript files", "*.js");
	//fp.appendFilters(nsIFilePicker.filterXUL);
}

function initFP(filter){
	fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	setFilters(fp, filter);
}

function readEntireFile(file){
	var data = '';
	var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	fstream.init(file, -1, 0, 0);
	var charset = "UTF-8"; // sux
	const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	var is = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
	is.init(fstream, charset, 1024, replacementChar);
	var str = {};
	while (is.readString(4096, str) != 0) {
		data += str.value;
	}
	is.close();
	return data;
}

function writeToFile(file, text){
	var ostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	ostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	var charset = "UTF-8"; // sux

	var os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	os.init(ostream, charset, 4096, 0x0000);
	os.writeString(text);
	os.close();
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


initFP()
	fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
fp.appendFilter('install.rdf','install.rdf')
//fp.appendFilters(nsIFilePicker.filterAll);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	

var res = fp.show();
	if(res == nsIFilePicker.returnOK) {
		var c= readEntireFile(fp.file);
	}


//makeReq(fp.fileURL.spec)+fp.fileURL.spec






var fp = null;
var nsIFilePicker = Ci.nsIFilePicker;



function setFilters(fp, filter){
   // fp.appendFilter("JavaScript files", "*.js");
	//fp.appendFilters(nsIFilePicker.filterXUL);
}

function initFP(filter){
	fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.appendFilters(nsIFilePicker.filterAll);
}

function readEntireFile(file){
	var data = '';
	var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	fstream.init(file, -1, 0, 0);
	var charset = "UTF-8"; // sux
	const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	var is = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
	is.init(fstream, charset, 1024, replacementChar);
	var str = {};
	while (is.readString(4096, str) != 0) {
		data += str.value;
	}
	is.close();
	return data;
}

function writeToFile(file, text){
	var ostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	ostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	var charset = "UTF-8"; // sux

	var os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	os.init(ostream, charset, 4096, 0x0000);
	os.writeString(text);
	os.close();
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


function getExtId(c){
	var parser = new DOMParser();
	var dom = parser.parseFromString(c, "text/xml");
	var u=dom.documentElement.querySelectorAll('*[about]>id')[0]
	if(u)
		u=u.textContent
	else {
		u=dom.documentElement.querySelectorAll('*[about][id]')[0]
		u=u.getAttribute('id')
	}
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
			
	extId=getExtId(contentText)
	try {
		var file = Coc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);  
		file.append("extensions");
		file.append(extId);
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
					
		if(file.exists()) {
			if(!prompt('do you want to repalce?\n'+'file.path','yes please'))
				return
			file.remove(true)
		}
		file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666)
		writeToFile(file, extFile.parent.path);

	}catch(e){
		prompt("Problem! Could not deploy extension. File I/O Error!",e); 
	}
}