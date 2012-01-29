

getDirEntriesOld=function(arg){
	var dir=arg
	if(dir instanceof Ci.nsIFile){
		dir={file:dir,isDirectory:dir.isDirectory(),extension:getExtension(dir.leafName),jarLevel:0}
	}else if(typeof dir=='string'){	
		dir={file:dir,isDirectory:dir.isDirectory(),extension:getExtension(dir.leafName),jarLevel:0}
	}
	if(dir.isDirectory){
		var displayData
		if(dir.jarLevel==0){displayData=getNormalDirEntries(dir.file)}
		else displayData=getEntriesInJARDir(dir.uri)
	}else if(dir.jarLevel==0&&/xpi|jar|zip/i.test(dir.extension)){
		displayData=getEntriesInJARDir(dir.file)
	}else return
	displayData.sort(compareFile)
	return displayData
}
function getNormalDirEntries(dir){
	var dirEntries = dir.directoryEntries,ans=[];
	while(dirEntries.hasMoreElements()){
		var file = dirEntries.getNext().QueryInterface(Ci.nsIFile);
		var uri=ios.newURI(getURLSpecFromFile(file),null,null).QueryInterface(Ci.nsIFileURL)
		var isDir=file.isDirectory(),name=file.leafName,ext=uri.fileExtension
		ans.push({
			name:name,
			iconURL: fileIconURL(isDir,name,ext),
			isDirectory: isDir,
			extension: ext,
			file: file,
			uri: uri,
			jarLevel:0
		})
	}
	return ans 
}
	/** ///jar**/
function escapeJAREntryForFilter(entryName){
    return entryName.replace(/([\*\?\$\[\]\^\~\(\)\\])/g, "\\$1");
}
var zr
function getEntriesInJARDir(uri){   
    if(!zr)zr = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
    zr.close()
	if(uri instanceof Ci.nsIFile){
		zr.open(uri)
		var strEntry =''
		var spec='jar:'+getURLSpecFromFile(uri)+'!/'
		uri=ios.newURI(spec,null,null).QueryInterface(Ci.nsIJARURI)
	}else{
		uri=uri.QueryInterface(Ci.nsIJARURI)
		var strEntry = uri.JAREntry;
		uri=uri.JARFile.QueryInterface(Ci.nsIFileURL);		
		zr.open(uri.file);		
		var spec='jar:'+uri.spec+'!/'
		uri=ios.newURI(spec,null,null).QueryInterface(Ci.nsIJARURI)
	}
    // Be careful about empty entry (root of jar); nsIZipReader.getEntry balks
	//dump(strEntry)
    if(strEntry){
        var realEntry=zr.getEntry(strEntry);
        if (!realEntry.isDirectory)
                throw strEntry + " is not a directory!";
    }
    var escapedEntry = escapeJAREntryForFilter(strEntry);

    var filter = escapedEntry + "?*~" + escapedEntry + "?*/?*";
	var entries=zr.findEntries(filter), ans=[]
	while(entries.hasMore()){
        var name=entries.getNext();
		var isDir=zr.getEntry(name).isDirectory
		var childuri=ios.newURI(name,null,uri).QueryInterface(Ci.nsIJARURI)
		   ,ext=childuri.fileExtension
		   ,a
		//if(name.slice(-1)=='/')
		if(isDir){
			var i=name.lastIndexOf('/',name.length-2)
			name=name.slice(i<0?0:i+1,-1)
		}else{
			var i=name.lastIndexOf('/',name.length)
			name=name.slice(i<0?0:i+1)
		}
		
		ans.push({
			name: name,
			iconURL: fileIconURL(isDir,name,ext),
			isDirectory: isDir,
			extension: ext,
			file: '',
			uri: childuri,
			jarLevel:1
		})
    }
    zr.close();
    return ans
}

/**** /
function makeAllAddonsCompatible(){
	var bap=Components.utils.import("resource://gre/modules/AddonManager.jsm")
	var installLocations=bap.AddonManagerInternal.providers[0].installLocations
	var uio=Components.utils.getGlobalForObject(installLocations)
	with(uio){function comp() {
		var aTarget={id:Services.appinfo.ID,minVersion:0,maxVersion:3}
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
	comp.call(uio.XPIDatabase,null)
	bap.AddonManagerInternal.providers[0].updateAllAddonDisabledStates()
}
*/


/*/**************/
function getFileFromURLSpec(url)
{
    const nsIFileProtocolHandler = Components.interfaces.nsIFileProtocolHandler;
    var handler = ios.getProtocolHandler("file");
    handler = handler.QueryInterface(nsIFileProtocolHandler);
    return handler.getFileFromURLSpec(url);
}

a1=dirViewer.data[4].file
a1= getURLSpecFromFile(a1)
a1='jar:'+a1+'.jar!/'
//a1=getJARFileForURI(a1)
a1=ios.newURI(a1,null,null)
getEntriesInJARDir(a1)



/*function indexOfURL(href){// binary search to find an url in the chromeDirTree
    var left=0, right=chromePaths.length-1;
    href = href.toLowerCase();// make '/' less than everything (except null)
	var n=0//, state=1
    while(right>left&&n<100){n++
        var mid=Math.floor((left+right)/2);
        var dataHref=chromePaths[mid].spec.toLowerCase()//.replace(/\x2f/g, "\x01").toLowerCase();
        //if(href==dataHref || dataHref+"\x01"==href || dataHref==href+"\x01")return mid;
        //dump(dataHref)
		if(href<dataHref){
			//dump('<',right)
			right = mid-1;
			//state = -1
        }else if(href>dataHref){
			//dump('>',right)
			left = mid+1;
			//state = 1
		}else{
			left = mid
			//state = 0
			break
		}
		//dump(left, mid, right)
		
    }
	if(mid > right){
		mid = right
	}else if(mid < left){
		mid = left
	}
	
	//dump(mid)
	if(href.indexOf(dataHref)!=0){
		dataHref=chromePaths[right].spec.toLowerCase()
		if(href.indexOf(dataHref)!=0)
			return [href,-1]
	}
	
	return [chromePaths[left].obj.chromePath+'/'+href.substr(dataHref.length),mid]
}
/*
function indexOfURL(href){// binary search to find an url in the chromeDirTree
    var left=0, right=chromePaths.length-1;
    href = href.toLowerCase();// make '/' less than everything (except null)
	var n=0, state=1
    while(right-left>1&&n<100){n++
        var mid=Math.floor((left+right)/2);
        var dataHref=chromePaths[mid].spec.toLowerCase()//.replace(/\x2f/g, "\x01").toLowerCase();
        //if(href==dataHref || dataHref+"\x01"==href || dataHref==href+"\x01")return mid;
        dump(dataHref,mid)
		if(href<dataHref){
			dump('<',right)
			right = mid;
			state = -1
        }else if(href>dataHref){
			dump('>',right)
			left = mid;
			state = 1
		}else{
			left = mid
			state = 0
			break
		}
		dump(left, mid, right)
		
    }
	
	mid=left
	dump(mid)
	if(href.indexOf(dataHref)!=0){
		dataHref=chromePaths[left].spec.toLowerCase()
		if(href.indexOf(dataHref)!=0){
mid=right
dataHref=chromePaths[right].spec.toLowerCase()
		if(href.indexOf(dataHref)!=0){
	return [href,-1]
    }}
		
	}
	
	return [chromePaths[left].obj.chromePath+'/'+href.substr(dataHref.length),mid]
}

for (i in chromePaths){
i1=indexOfURL('o'+chromePaths[i].spec+'').concat([chromePaths[i].spec])[1]
//chromePaths[5].spec
jn.say(i1+'  '+i)
}
//chromePaths[15].spec==chromePaths[16].spec

/*
i=3
indexOfURL(chromePaths[i].spec+'sfvvvvv').concat([chromePaths[i].spec])

chromePaths[3].spec.toLowerCase()>chromePaths[7].spec.toLowerCase()*/