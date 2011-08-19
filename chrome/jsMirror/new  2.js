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


Ci.IDispatch.name
Cc["@mozilla.org/generic-factory;1"]
Cc["@mozilla.org/dom/storage;2"]
ComponentClassCrashers = ["@mozilla.org/generic-factory;1", "QueryInterface", "@mozilla.org/dom/storage;2"];
ComponentInterfaceCrashers = ["IDispatch"];

// classInfo obj.QueryInterface(Ci.nsIClassInfo)

function getserviceOrCreateInstance(p){
	// These were needed because some Component access crash FF window.dump("get service "+this.nsIJSCID.name+"\n");
	if(ComponentClassCrashers.indexOf(p.name) != -1)
		return "crasher";
	try{
		var obj = Cc[p.name].getService(Ci.nsISupports);
	}catch(e){
		try{
			obj = Cc[p.name].createInstance(Ci.nsISupports);
		}catch(e){
			return "not a service or object";
		}
	}
    // ifaces = jn.supportedInterfaces(obj);  // QI it
    return obj;
}
rt=0;rt1=0
//getserviceOrCreateInstance(Cc["@mozilla.org/autocomplete/controller;1"])

//Cc["@mozilla.org/autocomplete/controller;1"].createInstance()

for (var i in Cc)
	if(Cc[i] instanceof Ci.nsIJSCID)
		getserviceOrCreateInstance(Cc[i])
rt1




/*Ci.nsIClassInfo


var num={}




jn.supportedInterfaces(getserviceOrCreateInstance(Cc["@mozilla.org/inspector/dom-view;1"]))


//Ci.nsIClassInfo.QueryInterface(Ci.nsIClassInfo).getInterfaces(num,{})[0]


a=Cc["@mozilla.org/inspector/dom-view;1"].QueryInterface(Ci.nsIClassInfo).getInterfaces(num,{})


Components.interfacesByID[a[1]]

Components.manager.getServiceByContractID("@mozilla.org/inspector/dom-view;1",Ci.nsISupports)
document.QueryInterface(Ci.nsIClassInfo).



//Cc["@mozilla.org/inspector/dom-view;1"].createInstance(Ci.inIDOMView).QueryInterface(Ci.nsIClassInfo).getInterfaces(num,{})[0]

//Ci.nsIDOMStyleSheet.

*/







cii=[]
for each(var i in Ci) {
    cii.push(i);
}


function supportedInterfaces(element) {
    var ans = [];
    for(var i=cii.length;i--;) {
		var p =cii[i]
		try {
			if (element instanceof p) {
				ans.push(p);
			}
		}catch(e){
			Components.utils.reportError(e);
		}
	}
    return ans;
}

p=getserviceOrCreateInstance(Cc["@mozilla.org/timer;1"])
timerStart=Date.now()
for(var timerI=0;timerI<100;timerI++){

supportedInterfaces(p)
}timerStart-Date.now()
supportedInterfaces(p)


















jn.supportedInterfaces

ComponentClassCrashers = ["@mozilla.org/generic-factory;1", "QueryInterface", "@mozilla.org/dom/storage;2"];
ComponentInterfaceCrashers = ["IDispatch"];
function getserviceOrCreateInstance(p){
	// These were needed because some Component access crash FF window.dump("get service "+this.nsIJSCID.name+"\n");
	if(ComponentClassCrashers.indexOf(p.name) != -1)
		return "crasher";
	try{
		var obj = Cc[p.name].getService(Ci.nsISupports);
	}catch(e){
		try{
			obj = Cc[p.name].createInstance(Ci.nsISupports);
		}catch(e){
			return "not a service or object";
		}
	}
  return obj;
}

function supportedInterfaces(element) {
    var ans = [];
    for(var i in Ci) {
        /*try {
            if (element instanceof i) {
                ans.push(i);
            }
        } catch (e) {
            Components.utils.reportError(e);
        }*/
    }
    return ans;
}



cii=[]
 for each(var i in Ci) {
       cii.push(i);
    }
cii


function supportedInterfaces(element) {
    var ans = [];
    for(var i=cii.length;i--;) {
    var p =cii[i]
    try {
         if (element instanceof p) {
                ans.push(p.name);
            }
        } catch (e) {
            Components.utils.reportError(e);
        }
    }
    return ans;
}

/*
timerStart=Date.now()
as={}
for each (var c in Cc){
p=getserviceOrCreateInstance(c)
as[c.name]=supportedInterfaces(p)
}*/

timerStart-Date.now()




as["@mozilla.org/intl/unicode/encoder;1?charset=Big5"]



sa={}
try{

for (var i in as){
c=as[i]
for each (var b in c){
if(sa[b])sa[b].push(i)
else sa[b]=[i]
}
}
}catch(e){[b,sa[b]]}

r=0;s=0
for each(i in sa){
s++
if(i.length>1)r++
}

r
s

cii.length


⨭⨮⫷⫸✓✑✎ ✏ ✐✘✳✯❖➺⟳⟲Ͼ ✓Ͽ߷௵෴༒ↂ⊰ ⊱▒▢ ⚶▣⚜