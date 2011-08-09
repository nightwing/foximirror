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

/*********************************//**************************
 * pref utils
 ***//**************/

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

	
/******************************* 
 * manifest parser
 */
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

function indexOfURL(href){// binary search to find an url in the chromeDirTree
    var left=0, right=chromePaths.length-1;
    href = href.toLowerCase();// make '/' less than everything (except null)
    var n=0
    while(right-left>1&&n<100){n++
        var mid=Math.floor((left+right)/2);
        var dataHref=chromePaths[mid].spec.toLowerCase()//.replace(/\x2f/g, "\x01").toLowerCase();
		if(href<dataHref){
			right = mid;
        }else if(href>dataHref){
			left = mid;
		}else{
			left = mid
			break
		}		
    }

	if(href.indexOf(dataHref)!=0){
		dataHref=chromePaths[left].spec.toLowerCase()
		if(href.indexOf(dataHref)!=0){
            mid=right
            dataHref=chromePaths[right].spec.toLowerCase()
		    if(href.indexOf(dataHref)!=0){
            	return [href,-1]
            }
        }		
	}
	
	return [chromePaths[left].obj.chromePath+'/'+href.substr(dataHref.length),mid]
}





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
    if (!file)
		return null
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
Services.dirsvc.getFile()
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