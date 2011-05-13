var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
//Cu.import('resource://xqjs/Services.jsm');
//Cu.import('resource://xqjs/Preferences.jsm');
initServices=function(){
	domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);
	winService = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	//ww = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
	sss= Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)
	atomService=Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);
	fileHandler = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
}
/***************************************************/
var initializeables=[]
function initialize(){
	initServices()

	for each(var i in initializeables)
		i.initialize()	
}
/*********************************//**************************
 * pref utils
 ***//**************/

//get addons
function addSpecialDirs(addonList){
	var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);  
    
	var appdir=gDirSvc.get("XCurProcD", Ci.nsIFile)
	item={id:      info.ID
		 ,file:    appdir
		 ,name:    info.name
		 ,iconURL: 'chrome://branding/content/icon48.png'
		 }
	addonList.unshift(item)
	
	var profdir=gDirSvc.get('ProfD', Ci.nsIFile);
	item={id:      info.ID
		 ,file:    profdir
		 ,name:    'profile '+getExtension(profdir.leafName)||profdir.leafName
		 ,iconURL: 'chrome://shadia/content/icons/default/4.ico'
		 }
	addonList.push(item)
}
//*** retrieve data for 3.6-
function getAddonsOld(){
	extMan=Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager)
	addonListTemp=extMan.getItemList(14,{})
	addonList=[]
	var enabledItems=getPref('extensions.enabledItems')
	var enabledSkinName=getPref('general.skins.selectedSkin')
	for each(var addon in addonListTemp){
		var id=addon.id,file=extMan.getInstallLocation(id).getItemLocation(id),name=addon.name
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

function getAddonsNew(callback,addonListTemp){
	// AddonManager gives addons only assynchronously
	if(!addonListTemp&& typeof callback=='function'){
		Components.utils.import("resource://gre/modules/AddonManager.jsm")
		AddonManager.getAllAddons(function(a){getAddonsNew(false,a);callback()})
		return
	}
	//********************	
	addonList=[]
	//

	/*/** code that doesn't* use addonManager
	var   extensionDirs=[], extd, extLocations=["ProfD","XCurProcD"]
	for each(var name in extLocations){
		extd=gDirSvc.get(name, Ci.nsIFile)
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
	var bap=Components.utils.import("resource://gre/modules/AddonManager.jsm")
	var installLocations=[], providers=bap.AddonManagerInternal.providers
	// 
	providers.forEach(function(x){x.installLocations&&installLocations.push.apply(installLocations, x.installLocations)})
	function getAddonInstallLocation(id){
		var found
		for(var i in installLocations){
			found=(installLocations[i]._IDToFileMap||installLocations[i]._IDToDirMap)[id]
			if(found){
				return found.clone()
			}
		}
	}
	//filter out plugins
	addonListTemp=addonListTemp.filter(function(a){return 'theme,extension'.indexOf(a.type)>-1})
	//
	for each(var addon in addonListTemp){
		var id=addon.id, file=getAddonInstallLocation(id),name=addon.name;
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

	
	
//bap=Components.utils.import("resource://gre/modules/AddonManager.jsm")
//installLocations=bap.AddonManagerInternal.providers[0].updateAllAddonDisabledStates()
/*

bap=Components.utils.import("resource://gre/modules/AddonManager.jsm")
installLocations=bap.AddonManagerInternal.providers[0].checkForChanges(true)
a1=Components.utils.getGlobalForObject(bap.AddonManagerInternal.providers[0])
a=a1.XPIDatabase.getAddons()//[16]
//a1.isUsableAddon(a)
a.map(function(a){return a.id})
a[14].isCompatible
a1.isUsableAddon(a[14])
a[14]._wrapper
targets=[{id:Services.appinfo.ID,minVersion:0,maxVersion:400}]
a1.XPIDatabase.updateTargetApplications(a[14],targets)



Components.utils.import("resource://gre/modules/Services.jsm")

a2=Components.utils.import("resource://gre/modules/XPIProvider.jsm").XPIDatabase.getAddons()
a=addonViewer.data[addonViewer.view.selection.currentIndex].addon
a1=Components.utils.import("resource://gre/modules/XPIProvider.jsm")

targets=[{id:Services.appinfo.ID,minVersion:0,maxVersion:400}]
a1.XPIDatabase.updateTargetApplications(a2[26],targets)
a2.map(function(x)x._internal_id)

a2[26].is

AddonManager.in


bap=Components.utils.import("resource://gre/modules/AddonManager.jsm")
bap.AddonManagerInternal.providers[1].updateAllAddonDisabledStates()
a1.XPIProvider.updateAllAddonDisabledStates()


*/
	
//*******************************
function parseManifest(file,addon,cs){
    var line, params, flags;
	// var uriForManifest = iosvc.newURI(getURLSpecFromFile(path), null, null);
	var path=uriFromFile(file)
	var manifestUri=ios.newURI(path,null,null)

	var manifest=makeReq(path)
    // Pick apart the manifest line by line.
	var aliasRoots=[]
    var lines = manifest.split("\n");
    for(var i = 0; i < lines.length; i++){
        line = lines[i].trim();
        params = line.split(/\s+/);
        switch (params[0]){
            case "content":
            case "skin":
			case "resource":
			// case "locale":
				if(params[0]=="skin"){
					flags = params[2]+params.slice(4).join(" ");
					var aliasPath=params[3]
				}else{
					flags = params.slice(3).join(" ");
					var aliasPath=params[2]
				}
				var realPath=ios.newURI(aliasPath,null,manifestUri).spec
				var id=aliasPath+'->'+realPath
				if(aliasRoots.indexOf(id)>-1)continue
				aliasRoots.push(id)
				cs.chromeMap.push({
						 alias:      params[1]
						,subAlias:   params[0]
						,chromePath: "chrome://" + params[1] + "/" + params[0]
						,realPath:   realPath
						,disabled:   addon.disabled
						,addon:      addon
						,flags:      flags
						,aliasPath:  aliasPath
					})
				//dump()
                break;
			case "manifest":break
            case "override":               
        }
    }
}


function doParseManifests(){
	timerStart=Date.now()
	cs={chromeMap:[],rv:[],path2alias:{},alias2path:{},}
	var cd=addonList[0].file.clone()//chrome directory
	cd.append('chrome');//cd='resource://chrome'
	var mList=getManifestsInDir(cd)
	for each(var j in mList)
		parseManifest(j,addonList[0],cs)

	for each(var i in addonList){
		var mList=getManifestsInDir(i.file)
		for each(var j in mList)
			parseManifest(j,i,cs)
	}
	chromePaths=[];chromeRegistry=[]
	timerStart-Date.now()
	for each(i in cs.chromeMap){
		var f=getLocalFile(i.realPath)
		if(f.exists()){
			var item={
				 name:       i.alias+'/'+i.subAlias+'\n\u2690'+i.flags+'\n'+i.aliasPath+'\n'+i.realPath
				,file:       f
				,spec:       i.realPath
				,obj:        i
				,cellProp:   i.disabled?'disabled':''}
			chromeRegistry.push(item);
			chromePaths.push(item)
		}else dump(i[0],f.spec,i.realPath)
	}
	chromePaths.sort(dirSort)
}
function dirSort(a, b){// make '/' less than everything (except null)
    var tempA = a.obj.realPath.toLowerCase();
    var tempB = b.obj.realPath.toLowerCase();
    if(tempA<tempB)return -1;
    if(tempA>tempB)return 1;
    return 0;
}
function indexOfURL(href){// binary search to find an url in the chromeDirTree
    var left=0, right=chromePaths.length-1;
    href = href.toLowerCase();// make '/' less than everything (except null)
    while(left<right){
        var mid=Math.floor((left+right)/2);
        var dataHref=chromePaths[mid].spec.toLowerCase()//.replace(/\x2f/g, "\x01").toLowerCase();
        //if(href==dataHref || dataHref+"\x01"==href || dataHref==href+"\x01")return mid;
             if(href<dataHref)right=mid-1;
        else if(href>dataHref)left=mid+1;
		dump(left,right,mid,dataHref)
    }
	//mid=Math.floor((left+right)/2);
	if(!href.indexOf(dataHref)==0){dataHref=chromePaths[left].spec.toLowerCase()}
	if(!href.indexOf(dataHref)==0)return [href,-1]
		
	return [chromePaths[left].obj.chromePath+'/'+href.substr(dataHref.length),left]

}
/*
chromePaths[0].obj.realPath

chromePaths.sort(dirSort).map(function(a){return a.obj.realPath})

ans=indexOfURL(chromePaths[10].obj.realPath+'/8/89')

chromePaths[ans].obj.realPath
ans
*/

function getManifestsInDir(dir){
	var manifests=[]
	try{
		dir.QueryInterface(Ci.nsIFile);
	}catch (ex){return}
	if(!dir.exists())
		return	
	if(!dir.isDirectory()){
		manifests.push(dir);
		return manifests
	}
	var dirEntries = dir.directoryEntries;
	while (dirEntries.hasMoreElements()){
		var file = dirEntries.getNext().QueryInterface(Ci.nsIFile);
		if ((/\.manifest$/i).test(file.path))
			manifests.push(file);
	}    
    return manifests;
}
uriFromFile=function(file){
	return 'file:///'+(typeof file=='string'?file:file.path).replace(/\\/g, '\/').replace(/^\s*\/?/, '')//.replace(/\ /g, '%20');
}
//****** process data

  //*****-----------**-------------------------*******
 //***-----*** dir data
//-------------*-----------------*-----------------
getURLSpecFromFile=function (file){
    if (!file)return null
    if (typeof file == "string")
        file = getLocalFile(file)
    return fileHandler.getURLSpecFromFile(file);
}
/*
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
/**************/
function getExtension(f){
    if (f.lastIndexOf(".") != -1)return f.substring(f.lastIndexOf(".") + 1, f.length).toLowerCase();
    return "";
}
function fileIconURL(isDir,name,ext,spec){
	if(isDir)      return "chrome://global/skin/dirListing/folder.png"
	if(!ext)       return "moz-icon://"+'.broken'+"?size=16"
	if(ext=='exe') return "moz-icon://"+spec+"?size=16"
	if(ext=='ico') return spec+"?size=16"
	return "moz-icon://"+'.'+ext+"?size=16"
}
	//simple
const jarExtensions='jar,xpi,zip,docx'
dirObjFromSpec=function(spec){	
	var l=spec.length-1
	var isDir=spec.charAt(l)=='/'
	var l1=spec.lastIndexOf('/',isDir?l-1:l)+1
	name=spec.substring(l1,l)		
	var ext=isDir?'/':getExtension(spec)
	if(ext&&jarExtensions.indexOf(ext)>-1){ext!='docx'&&(ext='zip');dt=1}else{dt=isDir?0:2}
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
	
	dump(obj.dirType,uri)

	var a=makeReq(uri).split('\n201: ')
	var ans=[]
	for(var i=1;i<a.length;i++){
		var line=a[i].split(' ')
		var isDir=line[3].indexOf('DIRECTORY')>-1
		var name=line[0]
		//dump(line,line[3],isDir,line[0].charCodeAt(0))
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
   //********************************************************************                  -------------------windowViewer
  //* viewer objects
 //****************************/
addonViewer={
	initialize:function(){
		try{
			getAddonsOld()
			this.initializeMain()
		}catch(e){
			getAddonsNew(function(){addonViewer.initializeMain()})
		}
	},
	initializeMain:function(){
		this.tree=document.getElementById('addonViewer')
		doParseManifests()
		this.view=new simpleView()
		this.activate()
	},
	activate:function(type){
		this.mode=type
		if(type=='chrome'){
			this.tree.removeAttribute('addons')	
			addonViewer.data=chromePaths
		}else if(type=='addons'||!type){
			this.tree.setAttribute('addons',true)
			addonViewer.data=addonList			
		}
		this.tree.view=null
		addonViewer.tree.style.height='0px'
		addonViewer.tree.boxObject.screenX
		addonViewer.tree.style.height=''
		this.view.data=this.data
		this.tree.view=this.view
	},
	onSelect:function(){
		var i=this.tree.currentIndex
		mAddonData=addonList[i]
		
		viewDoc.body.textContent=this.mode=='chrome'?chromePaths[i].name:''
		dirViewer.setDir((this.mode=='chrome'?chromePaths[i].spec:mAddonData.file))
		
	},
	getDirData:function(file){
		getDirDisplayData(getDirEntries(addonList[i].file))
	},
	
	//sort
}
	initializeables.push(addonViewer)
   //***************************************************
  //* 
 //******/
histLog=function(){dump(
	dirViewer.historyA.map(function(a){return a[0].path}).concat(['----------']).concat(
		dirViewer.historyB.map(function(a){return a[0].path})
		).join('\n'))
}
dirViewer={
	initialize:function(){
		this.tree=document.getElementById('dirViewer')
		gURLBar=this.urlbar=document.getElementById('urlbar')
		gURLBar.setAttribute('onkeypress','dirViewer.setDir(this.value)')
		this.view=new simpleView()
		var b=document.getElementById('dirViewerButtons')
		this.backButton=b.children[1]
		this.forwardButton=b.children[2]
	},
	activate:function(){		
		this.view.data=this.data
		this.tree.view=this.view
	},
	onSelect:function(){
		var i=this.tree.currentIndex
		var data=this.data[i]
		slateViewer.onSelect(data)
	},
	ondblclick:function(event){dump(this)
		if(event.button!=0)return
		var i=this.tree.currentIndex
		var dir=this.data[i]
		if(dir.dirType!=2)
			this.setDir(dir)
	},
	setDir:function(dir){
		this.data&&this.historyA.push([this.currentDir,this.data,this.tree.currentIndex,this.tree.treeBoxObject.getFirstVisibleRow()])
		this.historyA.length&&(this.backButton.disabled=false)
		if(this.historyA.length>100)this.historyA.shift()
				histLog()

		
		if(typeof dir=='string')
			this.currentDir=dirObjFromSpec(dir)
		else this.currentDir=dir
		this.data=getDirEntries(this.currentDir)
		this.activate()
		if(this.currentDir instanceof Ci.nsIFile)
			this.urlbar.value=this.currentDir.path
		else
			this.urlbar.value=decodeURIComponent(this.currentDir.spec		)
	},
	historyA:[],
	historyB:[],	
	restoreState:function(state){
		this.currentDir=state[0]
		this.data=state[1]
		this.activate()
		this.tree.view.selection.select(state[2])
		this.tree.treeBoxObject.scrollToRow(state[3])
	},
	back:function(){
		var st=this.historyA.pop()
		;(!this.historyA.length)&&(this.backButton.disabled=true)
		if(!st)return
		this.historyB.push(st)
		this.restoreState(st)
		this.historyB.length&&(this.forwardButton.disabled=false)
		histLog()
	},
	forward:function(){
		var st=this.historyB.pop()
		;(!this.historyB.length)&&(this.forwardButton.disabled=true)
		if(!st)return
		this.historyA.push(st)
		this.restoreState(st)
		this.historyA.length&&(this.backButton.disabled=false)
		histLog()

	},
	up:function(){
		var obj=this.currentDir
		if(obj instanceof Ci.nsIFile){
			var parent=this.currentDir.parent
			if(!parent)return
			var curName=obj.leafName
			this.setDir(parent)
		}else{
			var spec=obj.spec
			var curName=obj.name
			var l=spec.length
			if(spec.charAt(l-2)=='!'&&spec.slice(0,4)=='jar:')var st=4
			else var st=0
			
			l=spec.lastIndexOf('/',l-2)+1
			spec=spec.substring(st,l)
			//dump('--------------->',spec)
			this.setDir(dirObjFromSpec(spec))
		}
		this.select(curName)
	},
	select:function(name){
		var obj=dirViewer.data
		for(var i=0;i<obj.length;i++){
			if(obj[i].name==name)
				break			
		}
		if(i==this.tree.currentIndex)
			this.onselect()
		else
			this.tree.view.selection.select(i)
		this.tree.treeBoxObject.ensureRowIsVisible(i)
	},
	getType:function(ext){
		"xul,css,xhtml,xml,jsm,manifest,ini,ahk,locale,dtd,properties".indexOf(dirViewer.data[1].extension)>-1
		"png,jpg,giff,jpeg,ico"
	}
}
	initializeables.push(dirViewer)
getCurrentURI=function(){
	var i=dirViewer.tree.currentIndex
	return dirViewer.data[i].spec
}
getCurrentFile=function(){
	return getLocalFile(getCurrentURI())
}
 
getCurrentline=function(){
	return 100
}
npp1=function(){
	var file=getCurrentFile()
	if(file)var path=file.path
	else return
	if(path.slice(-3)!='jar')
		npp(path,getCurrentline())
	else file.reveal()
}
  /***************************************/
 /**-----------tree views--------------**/
/***************************************/
function simpleView(){
}
simpleView.prototype = {
	treeBox: null,
	selection: null,

	get rowCount()                     { return this.data.length; },
	setTree:     function(treeBox)     { this.treeBox = treeBox; },
	getCellText: function(row, col)    { return this.data[row].name },
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

	getImageSrc: function(row, column) { return this.data[row].iconURL },
	getProgressMode : function(row,column) {},
	getCellValue: function(row, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(row, column) {},
	performAction: function(action) {},
	performActionOnCell: function(action, index, column) {},
	getRowProperties: function(row, prop) {
		var pn=this.data[row].rowProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getCellProperties: function(row, column, prop) {
		var pn=this.data[row].cellProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getColumnProperties: function(column, element, prop) {
	},

};

function treeView(table){
	this.rowCount = table.length;
	this.getCellText  = function(row, col){return table[row][col.id]}
	this.getCellValue = function(row, col){}
	this.setTree = function(treebox){this.treebox = treebox}
	this.isEditable = function(row, col){return false}
	
	this.isContainer = function(row){return false}
	this.isContainerOpen = function(row){return false}
	this.isContainerEmpty = function(row){return false }
	this.getParentIndex = function(row){ return row?0:-1}
	this.getLevel = function(row){return row?1:0}
	this.hasNextSibling = function(row){return true}

	this.isSeparator = function(row){return false}
	this.isSorted = function(){ return false}
	this.getImageSrc = function(row,col){return ''}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){		
	};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){}
	this.cycleHeader = function(col, elem){}
	this.isSelectable=function(row,col){return true}
	return this
}

//***************************************/
//filtering trees
setTreeFilter= function(view,tree,text){
	if(!text){
		view.visibleData=view.childData.concat()
		tree.view=view
	}
	if(view.filter==text)
		return
	this.filter=text=text.toLowerCase()

	var index=0,cd=view.childData
	view.visibleData=[]
	for(var i =0;i<cd.length;i++){
		var k=cd[i]
		if(k.rowProp=='head'||springyIndex(k.text,text)>-1){
			view.visibleData.push(k)
			//k.index=index;index++
		}
	}
	tree.view=view
}
function springyIndex(val,filterText){
	var lowVal=val.toLowerCase()
	var priority=0,lastI=0,ind1=0;
	if(lowVal.indexOf(filterText)===0){
		return 0;//exact match
	}
	for(var j=0;j<filterText.length;j++){
		lastI = lowVal.indexOf(filterText[j],ind1);
		priority += lastI-ind1
		ind1 = lastI+1;
		if(lastI===-1)
			break;//springy matches
	}
	if(lastI != -1){
		return priority+1
	}
	return -1
}

   /******************************************************************************/
  ////** blends onselect and onmousedown
 /**************************/
 selectObjectInTreeTimeOuts={}
function selectObjectInTree(treeID,immediate){
//dump('selectObjectInTree',immediate)
	if(!immediate){
		if(selectObjectInTreeTimeOuts[treeID]){
			clearTimeout(selectObjectInTreeTimeOuts[treeID])
		}
		selectObjectInTreeTimeOuts[treeID]=setTimeout(function(){selectObjectInTree(treeID,true)},10)
		return
	}
	window[treeID].onSelect()
}
   //**************************
  //* browser viewer objects
 //******/
gMode='viewSource'
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
slateViewer={
	initialize:function(){
		gURLBar=this.urlbar=document.getElementById('urlbar')
		this.browser=document.getElementById('slate-browser')
		viewDoc=this.browser.contentDocument

	},
	onClick:function(event){	
		var node=event.target
		
		var i=getAttr(node,'slateid')[1]
		if(node.nodeName&&i){
			//var i=parseInt(i)
			if(event.button==0)
				this.onSelect(this.data[i])
		}	
	},
	onSelect:function(data){
		var uri,ans, dataIndex=0
		function isImage(a){return a.extension&&'gif,png,jpeg,jpg,ico'.indexOf(a.extension)>-1}
		function getImage(a){var ans='<div class="img" slateid='+dataIndex+'>'+
			(isImage(a)?'<img src="'+a.spec+'"/><a class=h >'+a.name
					   :'<img src="'+a.iconURL.replace(/\d+$/,'128')+'"/><a>'+a.name
			)+'</a></div>'
			dataIndex++
			return ans
		}
		
		if(!data){//---------------------------show current dir
			uri=dirViewer.currentDir.spec
			this.data=dirViewer.data;this.currentDir=dirViewer.currentDir
			var a=this.data.map(getImage)
			ans='<al>'+a.join(',')+'<al>'
		}else if(!data.extension){//----------------------------------no extension
			uri='view-source:'+data.spec
			ans='<iframe src="'+uri+'"/>'
		}else if('exe,dll,xpt,gz,tar,mar,lnk,msi,flv'.indexOf(data.extension)>-1){//---------------------------show exe
			uri='moz-icon://'+data.spec+'/?size=128'
			ans='<div><img src="'+uri+'"></img><span>'+data.name+'</span><div>'			
		}else if(data.dirType<2){//---------------------------show directory internals
			uri='view-source:'+data.spec
			this.data=getDirEntries(data);this.currentDir=data
			var a=this.data.map(getImage)
			ans='<al>'+a.join(',')+'<al>'
		}else if(isImage(data)){//---------------------------show only images
			uri='view-source:'+data.spec
			var alldata=this.data=dirViewer.data//.map(getImage)
			var l=alldata.length	
			ans='<div class=header><div class=img><img src="'+data.spec+'"/><span>'+data.name+'</span></div></div>'			
			for(var j=0;j<l;j++){
				var data1=alldata[j]
				if(isImage(data1)){
					ans+=getImage(data1)
				}
				dataIndex++
			}
			ans='<al>'+ans+'</al>'
		}else{//---------------------------show file
			this.data=[data]
			if(gMode=='viewSource'){
				uri='view-source:'+data.spec
				ans='<iframe src="'+uri+'"/>'
			}else if(gMode=='viewFile'){
				uri=data.spec
				ans='<iframe src="'+uri+'"/>'
			}else if(gMode=='codeMirror'){
				uri='view-source:'+data.spec
				ans='<iframe src="'+uri+'"/>'
			}
		}//content.location='view-source:'+this.data[i].spec
		this.urlbar.value=decodeURIComponent(uri)
		viewDoc.body.firstChild&&viewDoc.body.removeChild(viewDoc.body.firstChild)
		viewDoc.body.innerHTML=ans
	},
	
}
	initializeables.push(slateViewer)
 
 
/**-----------//////**************************/

  //**************************************************
 //* css searcher
//******/
SEARCH_ON_FOCUS='dump("145-------------------",this.mIgnoreFocus,this.value,domNodeSummary(event.target),event.target.nodeName=="html:input",event.target==this); if(event.target.nodeName=="html:input")this.mIgnoreFocus||'
cssSearch={
	initialize: function(aWindow){
		this.findbar = document.getElementById('cssSearch');
		this.nodeCount = this.findbar.getElementsByTagName('label')[0];
		this.textbox = this.findbar.getElementsByTagName('textbox')[0];
		this.textbox.setAttribute('oninput','cssSearch.onIninput(this.value)')
		this.textbox.setAttribute('oncommand','cssSearch.onIninput(this.value)')
		this.textbox.setAttribute('onfocus',SEARCH_ON_FOCUS+'cssSearch.onIninput(this.value,true)')
		this.textbox.addEventListener('keypress',this,true)
	},
	activate: function(aWindow){
		//this.active=true
		//stylesheetViewer.activate()
		stylesheetViewer.fillList(function(){cssSearch.onIninput(cssSearch.textbox.value)})
	},
	setWindow: function(win){
		mWindow=win
		mNode=mWindow.document.documentElement
		var xp=this.activeXPath
		this.activeXPath=''
		this.onIninput(xp)
	},

	onIninput: function(xpath,searchAgain){
		if(!searchAgain&&xpath==this.activeXPath)return
		if(stylesheetViewer.winMustChange){this.activate();return}
		this.activeXPath=xpath
		//xpath=this.parseXPATH2(xpath)
		this.previousSearches.push(xpath)
		//dump(xpath,this.activeXPath)
		var result=this.findRules(xpath,allCSSSheets)
		this.nodeCount.value=result.length
		cssSlate.sayRules(result)
	},


	handleEvent: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_UP:
				if(event.ctrlKey);
				content.scrollByLines(-2)
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				content.scrollByLines(2)
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_RETURN:
			ert=event
				if(event.ctrlKey){
					cssSlate.sayRemainingRules()
				}
				content.focus()
				event.preventDefault();event.stopPropagation();
				break
								
				break
		}
	},

	parseCPATH2:function(str){
		var i=0,i0=0,next=str.charAt(i++)//i is one char farther than next so that [# .] are skipped
		if(next=='`')
			return [[str.substr(1)],[]]
		//
		var rx=/[\w$-\[\]\(\)]/
		var skipWord=function(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		var modes=[[],[]],ind=0
		while(next){
			if(next=='.'||next=='#'||rx.test(next)){
				skipWord()
				modes[ind].push(str.substring(i0-1,i));
			}else if(next=='{'){
				ind=1
			}else if(next==':'&&ind==0){
				next=str.charAt(i++)
				if(next==':'||rx.test(next))
					skipWord()
				modes[ind].push(str.substring(i0-2,i));
			}else if(next==':'&&ind==1){
				skipWord()
				modes[ind].push(str.substring(i0,i));
			}
			next=str.charAt(i++)
		}
		
		function createTest(testArray,doubles){
			if(!testArray&&!doubles)
				return false
			if(!doubles)
				return function(css){
					for each(var t in testArray)
						if(css.indexOf(t)==-1)
							return false
					return true}
			if(!testArray)
				return function(css){					
					for each(var t in doubles){
						var index=0
						for(var i=t[1];i>0;i--)
						if((index=css.indexOf(t[0],index))==-1)
							return false
					}
					return true}
			return function(css){
					for each(var t in testArray)
						if(css.indexOf(t)==-1)
							return false
					for each(var t in doubles){
						var index=0
						for(var i=t[1];i>0;i--)
						if((index=css.indexOf(t[0],index))==-1)
							return false
					}
					return true}
		}
		//return [createTest(testArray1,doubles1),createTest(testArray2,doubles2)]
				return [createTest(modes[0],null),createTest(modes[1],null)]

	},
	findRules: function(text, stylesheets){time=Date.now()
		var ans=[]
		var [test1,test2]=this.parseCPATH2(text)
		
		function iterateCSSRules(cssRules){
			for (var j = 0; j < cssRules.length; j++){
				var rule = cssRules[j];
				if (rule.type===1){//
					var selector = rule.selectorText;
					if((!test1||test1(selector))&&(!test2||test2(rule.cssText)))ans.push(rule)
				}else if(rule.cssRules){//
					var selector=rule.cssText,i=selector.indexOf('{')
					if(i>0)selector=selector.substring(0,i)
					if(test1&&test1(selector))
						ans.push(rule)
					iterateCSSRules(rule.cssRules)
				}else{
					if(test1&&test1(rule.cssText))ans.push(rule)
				}
			}
		}
		for (var i = 0; i < stylesheets.length; i++){
			iterateCSSRules(stylesheets[i].cssRules)
		}
		//dump('css---->time: ',time-Date.now())

		return ans
	},

	previousSearches:[],
	
	findBindingRules: function(){time=Date.now()
		var ans=[]
		function iterateCSSRules(cssRules){
			for (var j = 0; j < cssRules.length; j++){
				var rule = cssRules[j];
				if (rule.type===1){//
					var mb=rule.style.MozBinding
					if(mb)ans.push([rule.selectorText,mb,hrefromRule(rule)])					
				}else if(rule.cssRules){//
					iterateCSSRules(rule.cssRules)
				}
			}
		}
		for (var i = 0; i < allCSSSheets.length; i++){
			iterateCSSRules(allCSSSheets[i].cssRules)
		}
		//dump('css---->time: ',time-Date.now())

		return ans
	},
}





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

/*
cssSearch.findBindingRules().length
ios.getProtocolHandler("about").QueryInterface(Ci.nsIProtocolHandler).newURI('about:config',null,null)
gDirSvc.getFile()
cssSearch.findBindingRules().length
ios.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler).hasSubstitution('resource://gre/res/forms.css')
*/
 
  //**********************************************************
 //* context menu
//****/
const gClipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);

urlOperations=function(command){
	var path=leftPane.currentURI()
	if(path)
	switch(command){
		case 'view':    viewFileURI(path, leftPane.currentLine&&leftPane.currentLine());break
		case 'launch':	getLocalFile(path).launch();break
		case 'reveal':  getLocalFile(path).reveal();break
		case 'copy':    gClipboardHelper.copyString(path);break
	}
}

function contextMenuPopupShowing(event){
	dr=document.popupNode
	dr2=event
	//shadia.advanceLight(dr)
}


//*****//

shortcutManager={
	initialize: function(){
		window.addEventListener('keydown',this,true)
	},
	handleEvent:function(event){
		var activeElId
		function getActiveEl(){
			var	activeEl=document.activeElement
			while(activeEl&&!(activeElId=activeEl.id)){
				activeEl=activeEl.parentNode
			}
		}
		var needs_stop
		if(event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_F){
			getActiveEl()
			          if(activeElId=='leftPane-tree'||activeElId=="window-tree")   leftPaneSearch.textbox.focus()
				 else if(activeElId=='leftPane-search') leftPaneSearch.tree.focus()
				 else if(activeElId=='slate-browser')browserFind.focus()

		}else if((event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_Q)||
				 (event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_W)||
				 (event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_Enter)){
			getActiveEl()			
			     if(activeElId=='leftPane-tree'||activeElId=="leftPane-search")windowViewer.activate()
			else if(activeElId=='slate-browser'||activeElId=='slate-finder')leftPane.tree.focus()
			else if(activeElId=='window-tree'){windowViewer.deactivate();document.getElementById('slate-browser').focus()}
		}
		else if((event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_Q)||
				(event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_W)||
				(event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_ENTER)){
			getActiveEl()	
//dump(activeElId)			
			     if(activeElId=='leftPane-tree')   document.getElementById('slate-browser').focus()
			else if(activeElId=='slate-browser') windowViewer.activate()
			else if(activeElId=='window-tree'){    windowViewer.deactivate();leftPane.tree.focus()}
		}else return
		//event.preventDefault();event.stopPropagation();
	}
}

	initializeables.push(shortcutManager)

/**
i=content.wrappedJSObject.lt.parentNode.parentNode.getAttribute('slateid')

parseInt(i)
currentRules[i].style.setProperty('display','block','')
currentRules[i].style.setProperty('width','50px','')
currentRules[i].cssText

lt=content.wrappedJSObject.lt
lt.previousElementSibling.textContent

**/
  /**--------------------//            ----*/
 /** /------finder-----//////**************************/
/**--------------------//            --- */
browserFind={
	initialize: function(){
		/*this.editor=textArea.editor*/
		var docShell = content.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShell);
		this.selCon= docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsISelectionDisplay).QueryInterface(Ci.nsISelectionController);
		this.editor={rootElement:viewDoc.body,selectionController:this.selCon}

		this._searchRange = document.createRange()
		this._searchRange.selectNodeContents(this.editor.rootElement);

		
		this.selCon=this.editor.selectionController
		this.seltype=Ci.nsISelectionController.SELECTION_IME_RAWINPUT
		this.findSelection = this.selCon.getSelection(this.seltype);
		
		this.selCon.setDisplaySelection(Ci.nsISelectionController.SELECTION_ON);
		this.selCon.setCaretVisibilityDuringSelection(true);
		
		this.finder=Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance(Components.interfaces.nsIFind)
		this.finder.caseSensitive = false
		
		
		this.selCon.getSelection(1).QueryInterface(Ci.nsISelectionPrivate).addSelectionListener(this)
		this.editor.rootElement.addEventListener('mousedown',this,true)
		
		this.textbox=document.getElementById("slate-finder")
		this.textbox.setAttribute('oninput','browserFind.oninput(this.value)')
		this.textbox.setAttribute('onfocus',SEARCH_ON_FOCUS+'browserFind.oninput(this.value)')
		this.textbox.addEventListener('keypress',function(e){browserFind.handleKeypress(e)},true)
		this.checkbox=this.textbox.nextSibling
		this.updateAutoHighlight(true)
		//this.ff=document.getElementById('slate-browser').fastFind
//ff.findAgain('i',false)//find('cu',false)
		
	},
	updateAutoHighlight:function(on){
		if(typeof on=='undefined')
			on=!this.highlight
		this.highlight=on
		this.checkbox.checked=on
	},
	handleKeypress: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_RIGHT:
				//if(event.ctrlKey)content.scrollByLines(-2)
				//else browserFind.ff.findAgain(true,false)
				//else browserFind.findAgain(true)
				//event.preventDefault();event.stopPropagation();
				if(this.textbox.selectionEnd==this.textbox.textLength){
					this.selCon.characterMove(1,1)
					this.textbox.value=this.typeAheadFindText=this.text=this.selCon.getSelection(1)
				}
				break;
			case KeyEvent.DOM_VK_UP:
				if(event.ctrlKey)content.scrollByLines(-2)
				//else browserFind.ff.findAgain(true,false)
				else browserFind.findAgain(true)
				event.preventDefault();event.stopPropagation();
				break;
			case KeyEvent.DOM_VK_DOWN:
				if(event.ctrlKey)content.scrollByLines(2)
				//else browserFind.ff.findAgain(false,false)
				else browserFind.findAgain(false)
				event.preventDefault();event.stopPropagation();
				break;
			case KeyEvent.DOM_VK_RETURN:
				if(event.ctrlKey){
					
				}
				content.focus()
				event.preventDefault();event.stopPropagation();
				break
								
				break
		}
	},
	oninput:function(xpath){
		//this.findSelection.removeAllRanges()
		//this.addRanges2(xpath)
		//this.ff.find(xpath,false)
		this.typeAheadFind(xpath,false,false)
	},
	moveSel:function(){
		this.selCon.characterMove(1,1)
		this.textbox.value=this.selCon.getSelection(1)
	},
	
	
	handleEvent:function(e){
		if(this.timeout)
			clearTimeout(this.timeout)		
		if(this.active&&e.originalTarget.prefix!='xul')//hack to exclude scrollbars
			this.findSelection.removeAllRanges()
	},
	notifySelectionChanged:function(){
		//dump('notifySelectionChanged---------------',this.timeout)
		if(!this.highlight)return
		//if(!)
		if(this.timeout){
			clearTimeout(this.timeout)
		}
		this.timeout=setTimeout(function()browserFind.selectionReallyChanged(),120)		
	},
	scheduleHighlight:function(text){
		if(this.timeout){
			clearTimeout(this.timeout)
		}
		if(this.active)
			this.findSelection.removeAllRanges()
		this.text=text
		if(text)this.addRanges2(text)
	},
	selectionReallyChanged:function(){
		var text=this.selCon.getSelection(1).toString()
		//dump('selectionReallyChanged---------------',text)
		if(text!==this.text){
			if(this.timeout){
				clearTimeout(this.timeout)
			}
			if(this.active)
				this.findSelection.removeAllRanges()
			this.text=text
			if(text)this.addRanges(text)
				//this.timeout=setTimeout(function()self.addRanges(text), text.length<3?300:100)
		}
	},
	addRanges2:function(text){
		var t=Date.now()
		this._searchRange.selectNodeContents(this.editor.rootElement);
		this._startPt = this._searchRange.cloneRange();
		this._startPt.collapse(true);
		this._endPt = this._searchRange.cloneRange();
		this._endPt.collapse(false);
		this.active=false
		while ((retRange = this.finder.Find(text, this._searchRange,this._startPt, this._endPt))) {
			this.findSelection.addRange(retRange);
			this._startPt = retRange.cloneRange();
			this._startPt.collapse(false);
			this.active=true
		}
		this._searchRange.collapse(1)
		//dump('oldmethod--',t-Date.now());t=Date.now()
		
		/*//dump(t-Date.now());t=Date.now()
		this.addRangeszap=this.addRanges
		this.addRanges=this.addRanges2
		this.addRanges2=this.addRangeszap
		//dump(t-Date.now())*/
	},
	addRanges:function(text){
		var t=Date.now()
		this._searchRange.selectNodeContents(this.editor.rootElement);  

		var currRange= this.selCon.getSelection(1).getRangeAt(0).cloneRange()
		
		//dump(currRange)
		
		var currEnd=currRange.cloneRange(); currEnd.collapse(false)
		var currStart=currRange.cloneRange(); currStart.collapse(true)

		var allDocEnd=this._searchRange.cloneRange(); allDocEnd.collapse(false)
		var allDocStart=this._searchRange.cloneRange(); allDocStart.collapse(true)
		
		var retRange
		this.active=false

		this.finder.findBackwards=false
		while(retRange=this.finder.Find(text, this._searchRange, currEnd, allDocEnd)){
		//dump(retRange)
			this.findSelection.addRange(retRange);
			currEnd=retRange.cloneRange();currEnd.collapse(false)
			this.active=true
		}

		this.finder.findBackwards=true
		while(retRange=this.finder.Find(text, this._searchRange, currStart, allDocStart)){
			this.findSelection.addRange(retRange);
			currStart=retRange.cloneRange();currStart.collapse(true)
			this.active=true
		}
		

		this.timeout=''
		dump(t-Date.now(),this.active)
		
		/*this.addRangeszap=this.addRanges
		this.addRanges=this.addRanges2
		this.addRanges2=this.addRangeszap*/
	},
	typeAheadFind:function(text,dir,next){
		var	sel=this.selCon.getSelection(1),curEnd, continueFromTop=false
		this.typeAheadFindText=text;
		if(!text){
			sel.removeAllRanges()
			this.findSelection.removeAllRanges()
			return
		}
		this._searchRange.selectNodeContents(this.editor.rootElement); 
		var allDocEnd=this._searchRange.cloneRange();allDocEnd.collapse(dir)
		
		if(sel.rangeCount){
			curEnd=sel.getRangeAt(0);curEnd=curEnd.cloneRange();
			curEnd.collapse(next?dir:!dir)
			continueFromTop=true
		}else{
			curEnd=this._searchRange			
			curEnd.cloneRange()
			curEnd.collapse(!dir)
		}
		dump('if---fi',curEnd.startOffset,allDocEnd.startOffset)

		this.finder.findBackwards=dir
		curEnd=this.finder.Find(text, this._searchRange, curEnd, allDocEnd)
		dump('if---fio',curEnd,!curEnd&&continueFromTop,text)

		if(!curEnd&&continueFromTop){
			curEnd=sel.getRangeAt(0);curEnd=curEnd.cloneRange()
			curEnd.collapse(!dir)
			allDocEnd=this._searchRange.cloneRange(); allDocEnd.collapse(!dir)
			curEnd=this.finder.Find(text, this._searchRange, allDocEnd, curEnd)		
			dump('if---',curEnd)
		}
		sel.removeAllRanges()
		this.selCon.setDisplaySelection(Ci.nsISelectionController.SELECTION_ATTENTION);
		this.selCon.repaintSelection(this.seltype)
		if(curEnd){
			sel.addRange(curEnd)
			this.editor.selectionController.scrollSelectionIntoView(1, 0, false);
			dump('if---fi',sel)
		}
		allDocEnd.detach();
		this._searchRange.collapse(1)
	},
	findAgain: function(dir){
		this.typeAheadFind(this.typeAheadFindText,dir,true)
	},

	focus:function(){
		var text=this.selCon.getSelection(1).toString()
		if(text)this.textbox.value=text
		else this.textbox.select()
		this.textbox.focus()
	},
}
	initializeables.push(browserFind)
/*
var docShell = content.window.QueryInterface(Ci.nsIInterfaceRequestor)
                                .getInterface(Ci.nsIWebNavigation)
                                .QueryInterface(Ci.nsIDocShell);
selCon= docShell.QueryInterface(Ci.nsIInterfaceRequestor)
                                   .getInterface(Ci.nsISelectionDisplay)
                                   .QueryInterface(Ci.nsISelectionController);

viewDoc.body.contentEditable=true
docShell.editor.selectionController


ff=document.getElementById('slate-browser').fastFind
//ff.findAgain('i',false)//find('cu',false)
ff.find('i',false)
ff.caseSensitive=false
ff.findAgain('i',0)
*/

/*******************************************************/
/*          */
/*          */
/*          */
/** ///normal**/
//contentType = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService).getTypeFromFile(i.file)
/* function compareFile(a, b){
    if(!a.isDirectory && b.isDirectory)return 1;
    if(a.isDirectory && !b.isDirectory)return -1;
    if(a.name.toLowerCase() < b.name.toLowerCase())return -1;
    if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
} */

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