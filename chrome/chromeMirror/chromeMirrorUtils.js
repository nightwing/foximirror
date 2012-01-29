var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

function qs(x, el) (el||document).querySelector(x)
function qsa(x, el) Array.slice((el||document).querySelectorAll(x))
function $(id) document.getElementById(id)

initServices=function(){
	ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
	sss= Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)
	atomService = Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);
	fileHandler = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
}

/*********************************//**************************
 * addon utils
 ***//**************/
if (Cc["@mozilla.org/extensions/manager;1"]){//3.6-
	var extMan = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager)
	getAddonFileByID = function(id){
		return extMan.getInstallLocation(id).getItemLocation(id)
	}
	isDisabledAddonID = function(){

	}
}
else{ // dealing with 4+ is more work apearantly
	this.__defineGetter__('installLocations', function(){$getAddonData(); return this.installLocations})
	this.__defineGetter__('inactiveAddonIDs', function(){$getAddonData(); return this.inactiveAddonIDs})

	$getAddonData = function (){
		var bap = Components.utils.import("resource://gre/modules/AddonManager.jsm", {});
		var installLocations = []
		var inactiveAddonIDs = []
		var providers = bap.AddonManagerInternal.providers
		providers.forEach(function(x){
			if(x.installLocations)
				installLocations.push.apply(installLocations, x.installLocations)
			if(x.inactiveAddonIDs)
				inactiveAddonIDs.push(x.inactiveAddonIDs)
		})

		delete this.installLocations
		delete this.inactiveAddonIDs

		this.installLocations = installLocations
		this.inactiveAddonIDs = inactiveAddonIDs
	}

	getAddonFileByID = function(id){
		var found
		for(var i in installLocations){
			found=(installLocations[i]._IDToFileMap||installLocations[i]._IDToDirMap)[id]
			if(found){
				return found.clone()
			}
		}
	}

	isDisabledAddonID = function(){
		var found
		for(var i in installLocations){
			if(inactiveAddonIDs.indexOf(id) != -1){
				return true
			}
		}
		return false
	}

	getAddonsAsync = function(){


	}

}
/*	/** code that doesn't use addonManager
	var   extensionDirs=[], extd, extLocations=["ProfD", "XCurProcD"]
	for each(var name in extLocations){
		extd=Services.dirsvc.get(name, Ci.nsIFile)
		extd.append('extensions')
		extd.exists()&&extensionDirs.push(extd)
	}

	function getAddonInstallLocation(id){try{
		var found
		for(var i in extensionDirs){
			var extd=extensionDirs[i].clone()
			extd.append(id+'.xpi');if(extd.exists()){found=true;break}
			extd=extensionDirs[i].clone()
			extd.append(id);if(extd.exists()){found=true;break}
		}
		if(!found){dump(extd.path);return extensionDirs[0].clone()}
		if(extd.isDirectory())return extd
		if(extd.fileSize<1000)
			var extd1=extd.clone()
			var path=makeReq(getURLSpecFromFile(extd))
			extd.QueryInterface(Ci.nsILocalFile).initWithPath(path)
			if(extd.exists())return extd
		}catch(e){Cu.reportError(e);return extd1}
	}*/


//get addons
function addSpecialDirs(addonList){
	var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

	var appdir=Services.dirsvc.get("XCurProcD", Ci.nsIFile)
	item={id:      info.ID
		 ,file:    appdir
		 ,name:    info.name
		 ,iconURL: 'chrome://branding/content/icon48.png'
		 }
	addonList.unshift(item)

	var profdir=Services.dirsvc.get('ProfD', Ci.nsIFile);
	item={id:      info.ID
		 ,file:    profdir
		 ,name:    'profile '+getExtension(profdir.leafName)||profdir.leafName
		 ,iconURL: 'chrome://shadia/content/icons/default/4.ico'
		 }
	addonList.push(item)
}
//*** retrieve data for 3.6-
function getAddonsOld(){
	addonListTemp=extMan.getItemList(14,{})
	addonList=[]
	var enabledItems=getPref('extensions.enabledItems')
	var enabledSkinName=getPref('general.skins.selectedSkin')
	for each(var addon in addonListTemp){
		var id=addon.id,file=getAddonFileByID(id),name=addon.name
		var item={id:id
				 ,file:file
				 ,name:name
				 ,iconURL:addon.iconURL
				 ,disabled:(addon.type==addon.TYPE_THEME)?(addon.name!=enabledSkinName):(enabledItems.indexOf(id)==-1)
				 ,addon:addon
				}
		if(item.disabled)item.cellProp='disabled'
		addonList.push(item)
	}
	//profd and appdir
	addSpecialDirs(addonList)

}

function getAddonsNew(callback, addonListTemp){
	// AddonManager gives addons only assynchronously
	if(!addonListTemp&& typeof callback=='function'){
		Components.utils.import("resource://gre/modules/AddonManager.jsm")
		AddonManager.getAllAddons(function(a){
			getAddonsNew(false,a);
			callback()
		})
		return
	}
	//********************
	addonList = []

	//filter out plugins
	addonListTemp = addonListTemp.filter(function(a){return 'theme,extension'.indexOf(a.type)>-1})
	//
	for each(var addon in addonListTemp) {
		var id = addon.id, file = getAddonFileByID(id), name = addon.name;
		var item={id:        id
				 ,file:      file
				 ,name:      name
				 ,iconURL:   addon.iconURL||'chrome://mozapps/skin/extensions/extensionGeneric.png'
				 ,disabled:  addon.appDisabled||addon.userDisabled
				 ,addon: addon
				}
		if(item.disabled)
			item.cellProp='disabled'

		addonList.push(item)
	}

	//profd and appdir
	addSpecialDirs(addonList)
}


/*******************************
 * manifest parser
 *
 * todo use Cu.import("resource://gre/modules/ChromeManifestParser.jsm");
 * ChromeManifestParser.parseSync(Services.io.newURI("",null,null))
 */
function parseManifest(href, addon, cs, manifest){
    var line, params, flags;
	if (typeof href == 'string')
		var manifestUri = ios.newURI(href, null, null)
	else{
		manifestUri = href
		href = manifestUri.spec
	}

	// check if we have already parsed this
	if(cs.parsedManifests[href])
		return
	cs.parsedManifests[href] = true

	// get manifest Text
	if(!manifest)
		manifest = makeReq(href)

    // Pick apart the manifest line by line.
	var aliasRoots = [];
    var lines = manifest.split("\n");

    for(var i = 0; i < lines.length; i++){
        line = lines[i].trim();
        params = line.split(/\s+/);
        switch (params[0]) {
            case "skin": case "content": case "resource": // case "locale":
				if (params[0]=="skin") {
					flags = params[2] + params.slice(4).join(" ");
					var relPath = params[3]
				} else {
					flags = params.slice(3).join(" ");
					var relPath = params[2]
				}
				if (params[0]=="resource")
					var aliasPath = "resource://" + params[1] + "/"
				else
					var aliasPath = "chrome://" + params[1] + "/" + params[0] + "/"

				var realPath = ios.newURI(relPath, null, manifestUri).spec
				var id = relPath + '->' + realPath
				if(aliasRoots.indexOf(id)>-1)
					continue
				aliasRoots.push(id)
				cs.chromeMap.push({
					 alias:      params[1]
					,subAlias:   params[0]
					,aliasPath:  aliasPath
					,realPath:   realPath
					,disabled:   addon.disabled
					,addon:      addon
					,flags:      flags
					,manifestUri:href
					,line:       i
				})
            break;
			case "manifest":
				var aliasPath=params[1]
				parseManifest(ios.newURI(aliasPath, null, manifestUri).spec, addon, cs)
			break
            case "override":
        }
    }
}

function doParseManifests(){
	// chrome structure
	cs = chromeStructure = {
		chromeMap: [],
		rv: [],
		path2alias: {},
		alias2path: {},
		parsedManifests: {}
	}

	// special handling for application itself (a big addon)
	var app = addonList[0]
	var cd = app.file.clone()//chrome directory
	cd.append('chrome');
	var mList = getManifestsInDir(cd)
	if(mList){
		for each(var j in mList)
			parseManifest(j, app, chromeStructure)
	}else{
		var uri = $shadia.getLocalURI("resource:///chrome.manifest")
		if(uri)
			parseManifest(uri.spec, app, chromeStructure)
	}
	var uri = $shadia.getLocalURI("resource://gre/")
	if(uri){
		parseManifest(uri, app, chromeStructure, 'resource gre ' + uri.spec)
	}

	// all other addons
	for each(var addon in addonList){
		var mList = getManifestsInDir(addon.file)
		for each(var j in mList)
			parseManifest(j, addon, chromeStructure)
		// add addon

	}

	//
	chromePaths=[];
	chromeRegistry=[]

	for each(i in cs.chromeMap){
		try{
			var f = getLocalFile(i.realPath)
		}catch(e){}
		if (f && f.exists()){
			var item={
				 name:       i.alias+'/'+i.subAlias+'\n\u2690'+i.flags+'\n'+i.aliasPath+'\n'+i.realPath
				,file:       f
				,spec:       i.realPath
				,obj:        i
				,cellProp:   i.disabled?'disabled':''
			}
			chromeRegistry.push(item);
			chromePaths.push(item)
		}
		else
			$shadia.dump(i.realPath)
	}


	gChromeMap = new fileMap(cs.chromeMap)
	gAddonMap = new fileMap(addonList)
}
var gChromeMap
var gAddonMap
function getManifestsInDir(dir){
	var manifests=[], mfRe = /\.manifest$/i
	function addFile(file){
		if (!mfRe.test(file.path))
			return false
		manifests.push(getURLSpecFromFile(file));
		return true
	}

	try{
		dir.QueryInterface(Ci.nsIFile);
	}catch (e){
		return
	}

	if(!dir.exists())
		return
	// xpi or manifest itself
	if(!dir.isDirectory()){
		if(addFile(dir))
			return manifests

		var uri = getURLSpecFromFile(dir)
		uri = 'jar:'+uri+'!/'
		return [uri+'chrome.manifest']
	}
	// unpacked addons
	var dirEntries = dir.directoryEntries;
	while (dirEntries.hasMoreElements()){
		addFile(dirEntries.getNext().QueryInterface(Ci.nsIFile));
	}
    return manifests;
}


uriFromFile=function(file){
	return 'file:///'+(typeof file=='string'?file:file.path).replace(/\\/g, '\/').replace(/^\s*\/?/, '');
}


//
/* a=new fileMap(addonList)
a.debug()

a.getAliasList('file:///e:/program files/mozilla firefox/chrome/') */
//********************************


function fileMap(a) {
	this.map = Object.create(null)
	this.map2 = []
	this.addAlias(a)
}

fileMap.prototype = {
	normalizeUri: function(path){
		var a = decodeURIComponent(path).replace(/^(:?file:|jar:|\/+)+/, '').split('/')
		if (a[a.length-1]=="")
			a.pop()
		return a
	},
	
	addPathChunc: function(){
		
	},

	$addSingleItem: function(a){
		if(!a._rPath){
			var p = a.localPath || a.realPath || (a.file && fileHandler.getURLSpecFromFile(a.file))
			if(!p)
				return false	
			a._rPath = this.normalizeUri(p)
		}
		this.map2.push(a._rPath)
		var start = this.map
		for each(var i in a._rPath){
			i = i.toLowerCase()
			start = start[i] || (start[i] = Object.create(null))
		}
		start["/mapto"] = a
		
		return true
	},
	addAlias: function(a){
		if('forEach' in a)
			a.forEach(this.$addSingleItem, this)
		else
			this.$addSingleItem(a)
	},
	
	
	debug: function(){
		$shadia.dump(JSON.stringify(this.map, function(a, b) {
			if (a[0] != "/")
				return b;
			else
				return b.id||b.aliasPath
		}, 1))

		$shadia.dump(JSON.stringify(this.map2).replace("],[", "]\n,[", "g"))
	},
	getAlias: function(href){
		var a = this.getAliasList(href)[0]
		return a ? a.url : ""
	},
	
	getAliasList: function(href){
		var _rPath = this.normalizeUri(href)		
		var ans = [], node = this.map
		var i, alias
		while (i = _rPath.shift()){
			i = i.toLowerCase()
			node = node[i]
			if (!node)
				break

			if (alias = node["/mapto"]){
				var unmatched = _rPath.join('/')
				var newURL = this.resolveAlias(null, alias, unmatched)
				ans.unshift({
					url: newURL,
					alias: alias
				})
			}

		}
		return ans
	},
	
	// todo: doesn't belong here
	resolveAlias: function(href, alias, matchedHref){
		if (matchedHref == null){
			// todo get from href
		}
		let p = alias.aliasPath || ('```'+alias.name+'```')
		
		return p + matchedHref
	},
	
	getAliasPathList: function(href){
		
	}
}

//****** process data
var uriFixup
var gFileRegistry = {}
function createFile(href){
	var fileEntry = gFileRegistry[href]
	if(fileEntry)
		return fileEntry

	if(!uriFixup)
		uriFixup = Cc["@mozilla.org/docshell/urifixup;1"].getService(Ci.nsIURIFixup)

	var fu = uriFixup.createFixupURI(href, null)	
	href = fu.spec
	
	var fileEntry = gFileRegistry[href]
	if(fileEntry)
		return fileEntry

	var f = new fileEntry(href)

	return f
}
// const
function fileEntry(){

}

fileEntry.prototype = {
	localPath: '', // jar: or file:
	get children (){
		this.children = {}
		return this.children
	},

	get icon (){
		this.children = {}
		return this.children
	},
	
	isDirectory: false,
	
	get extension (){
		if(this.isDirectory)
			this.extension = '/'
		else{
			var m = this.localPath.match(/\.[\w-]+$/)
			this.extension = m ? m[0].substr(1) : ''
		}
		return this.extension
	},
	
	getMimeType: function(){
		
	},
	
	size: 0,
	lastModified: 0
}

  //*****-----------**-------------------------*******
 //***-----*** dir data
//-------------*-----------------*-----------------
getURLSpecFromFile=function (file){
    if (!file)
		return null
    if (typeof file == "string")
        file = getLocalFile(file)
    return fileHandler.getURLSpecFromFile(file);
}

navigate = function(url){
	var fu = Cc["@mozilla.org/docshell/urifixup;1"].getService(Ci.nsIURIFixup).createFixupURI(url, null)
	if(!fu || /^http/i.test(fu.spec))
		return

	dirViewer.setDir(fu.spec)
}


function getExtension(f){
    if (f.lastIndexOf(".") != -1)
		return f.substring(f.lastIndexOf(".") + 1, f.length).toLowerCase();
    return "";
}
function fileIconURL(isDir, name, ext, spec){
	if(isDir)      return "chrome://global/skin/dirListing/folder.png"
	if(!ext)       return "moz-icon://"+'.broken'+"?size=16"
	if(ext=='exe') return "moz-icon://"+spec+"?size=16"
	if(ext=='ico') return spec+"?size=16"
	return "moz-icon://"+'.'+ext+"?size=16"
}

const jarExtensions='jar,xpi,zip,docx'
dirObjFromSpec=function(spec){
	var l=spec.length-1
	var isDir=spec.charAt(l)=='/'
	var l1=spec.lastIndexOf('/',isDir?l-1:l)+1
	name=spec.substring(l1,l)
	var ext = isDir?'/':getExtension(spec)
	if (ext && jarExtensions.indexOf(ext) > -1){
		ext!='docx'&&(ext='zip');
		dt = 1;
	}else{
		dt = isDir?0 : 2;
	}
	return  {name:         decodeURIComponent(name)
			,iconURL:      fileIconURL(isDir,name,ext,spec)
			,isDirectory:  isDir
			,extension:    ext
			,spec:         spec
			,dirType:      dt
	}
}
getDirEntries=function(obj){
	var uri
	if(obj instanceof Ci.nsIFile){
		uri=fileHandler.getURLSpecFromFile(obj)
		if(!obj.isDirectory())
			obj=dirObjFromSpec(uri)
	}else if(obj.spec)
		uri=obj.spec

	var dt=obj.dirType
	if(dt && dt==1)
		uri='jar:'+uri+'!/'


	var a=makeReq(uri).split('\n201: ')
	var ans=[]
	for(var i=1;i<a.length;i++){
		var line=a[i].split(' ')
		var isDir=line[3].indexOf('DIRECTORY')>-1
		var name=line[0]
		if(isDir){
			if(name.slice(-1)=='/')
				name=name.slice(0,-1)
			var ext='/'
			var auri=uri+name+'/'
			var dt=0
		}else{
			var auri=uri+name
			var ext=getExtension(name)
			'jar,xpi,zip,docx,iso'.indexOf(ext)>-1
			if(ext&&jarExtensions.indexOf(ext)>-1){
				ext!='docx'&&(ext='zip');dt=1
			}else{
				dt=2
			}
		}
		ans.push({
			name:         decodeURIComponent(name),
			iconURL:      fileIconURL(isDir,name,ext,auri),
			isDirectory:  isDir,
			extension:    ext,
			spec:         auri,
			dirType:      dt
		})
	}
	ans.sort(compareFile)

	return ans
}

function compareFile(a, b){
    if(a.dirType<b.dirType)return -1;
    if(a.dirType>b.dirType)return 1;
    if(a.name.toLowerCase()<b.name.toLowerCase())return -1;
    if(a.name.toLowerCase()>b.name.toLowerCase()) return 1;
    return 0;
}

npp1=function(){
	$shadia.externalEditors.edit(getCurrentURI(), getCurrentline())
}
  /***************************************/
 /**-----------tree views--------------**/
/***************************************/
function simpleView(){
}
simpleView.prototype = {
	treeBox: null,
	selection: null,

	get data() {return this.$data},
	set data(val) { 
		this.$data = val;
		this.visibleData = val.concat()
		this.childData = val.concat()
		return val
	},
	
	get rowCount()                     { return this.visibleData.length; },
	setTree:     function(treeBox)     { this.treeBox = treeBox; },
	getCellText: function(row, col)    { return this.visibleData[row].name },
	isContainer: function(row)         { return false; },

	isContainerOpen:  function(row)    { return true },
	isContainerEmpty: function(row)    { return false; },
	isSeparator: function(row)         { return false; },
	isSorted:    function()            { return false; },
	isEditable:  function(row, column) { return false; },

	getParentIndex: function(row){-1},
	getLevel: function(row){return 0;},
	hasNextSibling: function(row, after){return true;},
	toggleOpenState: function(row){},

	getImageSrc: function(row, column) { return this.visibleData[row].iconURL },
	getProgressMode : function(row,column) {},
	getCellValue: function(row, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(row, column) {},
	performAction: function(action) {},
	performActionOnCell: function(action, index, column) {},
	getRowProperties: function(row, prop) {
		var pn=this.visibleData[row].rowProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getCellProperties: function(row, column, prop) {
		var pn=this.visibleData[row].cellProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getColumnProperties: function(column, element, prop) {
	},

};

   //**************************
  //*
 //******/
function getId(el){
	var elId
	while(el&&!(elId=el.id)){
		el=el.parentNode
	}
	return [elId,el]
}
function getAttr(el,attr){
	var elId
	while(el&&el.nodeType==1&&!el.hasAttribute(attr)){
		el=el.parentNode
	}
	if(el&&el.nodeType==1)
		return [el.getAttribute(attr),el]
	return [null,null]
}


/**-----------//////**************************/

  //***********************************************************
 //*
//*************/
function createElement(name, atrs){
  var lm = document.createElement(name);
  for(let key in atrs) lm.setAttribute(key, atrs[key]);
  return lm;
}
function empty(lm){
  while(lm.hasChildNodes()) lm.removeChild(lm.lastChild);
  return lm;
}



function binarySearch(object, array, comparator) {
    var first = 0;
    var last = array.length - 1;

    while (first <= last) {
        var mid = (first + last) >> 1;
        var c = comparator(object, array[mid]);
        if (c > 0)
            first = mid + 1;
        else if (c < 0)
            last = mid - 1;
        else
            return mid;
    }

    // Return the nearest lesser index, "-1" means "0, "-2" means "1", etc.
    return -(first + 1);
}

Object.defineProperty(Array.prototype, "binaryIndexOf", { value: function(value, comparator) {
    var result = binarySearch(value, this, comparator);
    return result >= 0 ? result : -1;
}});

function insertionIndexForObjectInListSortedByFunction(anObject, aList, aFunction) {
    var index = binarySearch(anObject, aList, aFunction);
    if (index < 0)
        // See binarySearch implementation.
        return -index - 1;
    else {
        // Return the first occurance of an item in the list.
        while (index > 0 && aFunction(anObject, aList[index - 1]) === 0)
            index--;
        return index;
    }
}