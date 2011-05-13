/*var frame = document.getElementById("sample-frame");
if (!frame) {
	// create frame
		frame = document.createElement("iframe"); 
		frame.setAttribute("id", "sample-frame");
		frame.setAttribute("name", "sample-frame");
		frame.setAttribute("type", "crome");
		frame.setAttribute("collapsed", "false");
document.documentElement.appendChild(frame);
}
frame2=frame 
var frame = document.getElementById("sample-frame2");
if (!frame) {
	// create frame
		frame = document.createElement("iframe"); 
		frame.setAttribute("id", "sample-frame");
		frame.setAttribute("name", "sample-frame");
		frame.setAttribute("type", "crome");
		frame.setAttribute("collapsed", "false");
document.documentElement.appendChild(frame);
}


frame.contentDocument.location = "data:text/html," + encodeURIComponent("ppppppppppppppppppppp");


frame2.contentDocument.location = "data:text/html," + encodeURIComponent("7777777");
frame.contentDocument

frame2.contentDocument.designMode="on"
frame.contentDocument.documentElement


el=frame2.contentDocument.documentElement.children[1]*/

t=Date.now()
frame.addEventListener("mouseup",function(){
frame2.contentDocument.documentElement.appendChild(el)
},true)

t-Date.now()





function generateDataURI(file) {
  var contentType = Components.classes["@mozilla.org/mime;1"]
                              .getService(Components.interfaces.nsIMIMEService)
                              .getTypeFromFile(file);
  var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                              .createInstance(Components.interfaces.nsIFileInputStream);
  inputStream.init(file, 0x01, 0600, 0);
  var stream = Components.classes["@mozilla.org/binaryinputstream;1"]
                         .createInstance(Components.interfaces.nsIBinaryInputStream);
  stream.setInputStream(inputStream);
  var encoded = btoa(stream.readBytes(stream.available()));
  return "data:" + contentType + ";base64," + encoded;
}
