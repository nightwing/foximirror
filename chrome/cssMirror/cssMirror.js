Components.utils.import('resource://shadia/main.js', window).addDevelopmentUtils(window)
getCssMirrorDir = $shadia.getCssMirrorDir
getCssMirrorJarPath = $shadia.getCssMirrorJarPath

ios = Services.io
sss = Services.sss
consoleService = Services.console



/***/

var initializeables=[]
function initialize(){
	codebox = document.getElementById('code');
	
	Firebug.Ace.initialize({
		win2: {id:"code", starter:FBL.bind(cssMirror.initialize, cssMirror)}
	})

	for each(var i in initializeables)
		i.initialize()
}
window.addEventListener('load', function(){
	removeEventListener('load', arguments.callee, false);
	initialize()
}, false);

/***************************************************************
 *error listener
 *
 */
function goToErrorLine(a, b){
	cssMirror.editor.selection.moveCursorToPosition({row:a, column:b})
}

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

errorListener={
	reportError:function(message){
		var errors = document.getElementById("errors");
		errors.style.display = "block";
		errors=errors.firstChild
		try{
			var error=message.QueryInterface(Components.interfaces.nsIScriptError);
		}catch(e){
			var error={lineNumber:0, columnNumber:0, errorMessage:message}
		}
		var label = document.createElementNS("http://www.w3.org/1999/xhtml","div");
		label.setAttribute('onclick','hig(this.a,this.b)')
		label.className='error'
		label.textContent= error.lineNumber + ":" + error.columnNumber + " " + error.errorMessage;
		errors.appendChild(label);
		label.a=error.lineNumber
		label.b=error.columnNumber
	},
	clearErrors:function(){
		var errors = document.getElementById("errors");
		errors.style.display = "none";
		errors=errors.firstChild
		while (errors.hasChildNodes()) {
			errors.removeChild(errors.lastChild);
		}
	},
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIConsoleListener, Components.interfaces.nsISupports]),
	observe: function(message) {
		this.reportError(message)
	},
	checkForErrors:function(context,callback,args){
		//t=Date.now()
		this.clearErrors()
		consoleService.unregisterListener(this)
		consoleService.registerListener(this);
		try{
			callback.apply(context,args||[])
		}catch(e){}
		//errorListener.reportError(t-Date.now())
		consoleService.unregisterListener(this)
	},
}


sheetTypes = {agent: sss.AGENT_SHEET, user: sss.USER_SHEET}
dataStyleRegistrar={
	getCode:function(){
		return codebox.value
	},
	saveStyle: function(){
	},
	activeSheetType: sheetTypes.agent,
	register:function(){
		this.activeURL&&this.unregister()
		this.activeURL=this.getDataUrl()
		this.activeURL&&sss.loadAndRegisterSheet(this.activeURL, this.activeSheetType)
	},
	unregister:function(){
		if (this.activeURL&&sss.sheetRegistered(this.activeURL, this.activeSheetType))
			sss.unregisterSheet(this.activeURL, this.activeSheetType);
		this.activeURL=''
	},
	changeSheetType: function(aType){
		if (this.activeURL&&sss.sheetRegistered(this.activeURL, this.activeSheetType)){
			sss.unregisterSheet(this.activeURL, this.activeSheetType);
			this.activeSheetType=aType
			sss.loadAndRegisterSheet(this.activeURL, this.activeSheetType)
		} else
			this.activeSheetType=aType
	},
	preview:function(){
		//t=Date.now()
		errorListener.clearErrors()
		errorListener.checkForErrors(this,this.register)
		setTimeout("document.getElementById('unpreview-button').style.display=''",200)
	},
	unpreview:function(){
		this.unregister()
		errorListener.clearErrors()

		setTimeout("document.getElementById('unpreview-button').style.display='none'",200)

	},
	getDataUrl: function(){
		var code=this.getCode()
		if (!code)
			return null;
		// this will strip new lines rather than escape - not what we want
		//return this.ios.newURI("data:text/css," + nameComment + this.code.replace(/\n/g, "%0A"), null, null);
		return ios.newURI("data:text/css," + encodeURIComponent(code), null, null);
	}
}


/*****************************************************************
 *  code completion utils
 ****************/
function treeView(table){
	this.rowCount = table.length;
	this.getCellText  = function(row, col){return table[row][col.id]}
	this.getCellValue = function(row, col){return table[row][col.id]}
	this.setTree = function(treebox){this.treebox = treebox}
	this.isEditable = function(row, col){return false}

	this.isContainer = function(row){return false}
	this.isContainerOpen = function(row){return false}
	this.isContainerEmpty = function(row){return true }
	this.getParentIndex = function(row){ return 0}
	this.getLevel = function(row){return 0}
	this.hasNextSibling = function(row){return false}

	this.isSeparator = function(row){return false}
	this.isSorted = function(){ return false}
	this.getImageSrc = function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
	};
	this.getCellProperties = function(row,col,props){
		/*if((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		}*/
	};
	this.getColumnProperties = function(colid,col,props){}
	this.cycleHeader = function(col, elem){}
}


completionProvider={
	propName: function(fragment){
		if(!gCSSProperties.keys){
			var table=[]
			for(var i in gCSSProperties){
				table.push({name:i})
			}
			gCSSProperties.keys=table
		}
		this.filter(gCSSProperties.keys,fragment[2])
	},
	propValue: function(fragment){

		var a=gCSSProperties[fragment[3]]
		if(!a)
			return []

		var table=[]
		for each(var i in a.initial_values){
			table.push({name:i})
		}
		for each(var i in a.other_values){
			table.push({name:i})
		}

		this.filter(table,fragment[2])
	},
	selector: function(fragment){
		var table=[]
		if(fragment[1]==':'){
			for each(var i in mozPseudoClasses){
				table.push({name:i})
			}
			for each(var i in pseudoClasses){
				table.push({name:i})
			}
			for each(var i in pseudoElements){
				table.push({name:i})
			}
		}

		this.filter(table,':'+fragment[2])
	},


	filter:function(data,text){
		var table =[];
		if(!text){
			data.forEach(function(val) {table.push(val)})
			//table.sort()
			this.sortedArray=table
			return;
		}
		var filterText=text.toLowerCase()
		var filterTextCase=this.text

		//**funcs*****/
		function springyIndex(val){
			var lowVal=val.name//.comName
			var priority=0,lastI=0,ind1=0;
			if(val.name.indexOf(filterTextCase)===0){
				val.priority=-2
				table.push(val);
				return;//exact match
			}
			for(var j=0;j<filterText.length;j++){
				lastI = lowVal.indexOf(filterText[j],ind1);
				if(lastI===-1)
					break;//doesn't match
				priority += lastI-ind1
				ind1 = lastI+1;
			}
			if(lastI != -1){
				val.priority=priority
				table.push(val);
			}
		}

		function sorter(a,b){
			if(!a.special&&b.special) return 1;
			if(a.special&&!b.special) return -1;//???
			for each(i in sortVals){
			  if (a[i]<b[i]) return -1;
			  if (a[i]>b[i]) return 1;
			}
			return 0;
		}
		var sortVals=['priority','depth','name']

		data.forEach(springyIndex)
		table.sort(sorter)
		this.sortedArray=table
	},

	setView: function(si){
		if(typeof si!='number')
			si=this.tree.currentIndex
		this.tree.view=new treeView(this.sortedArray)
		this.tree.view.selection.select(si);
        this.tree.treeBoxObject.ensureRowIsVisible(si);
		//this.number.value=si+':'+this.sortedArray.length+'/'+this.unfilteredArray.length
	},
}


/*

/*dataStyleRegistrar.unpreview()


timerStart=Date.now()
for(var timerI=0;timerI<1;timerI++){

dataStyleRegistrar.preview()
}timerStart-Date.now()






//dataStyleRegistrar.changeSheetType(sheetTypes.user)
function asd(){
codebox.value=codebox.value.slice(0,-6)+(lt+=5)+'px\n}'
//dataStyleRegistrar.preview()
dataStyleRegistrar.register()
n--;if(n)setTimeout(asd,500)
}
n=10;lt=10

asd()




function asd(){
if(sss.sheetRegistered(uri, type))
	sss.unregisterSheet(uri, type);
code=codebox.value.slice(0,-6)+(lt+=5)+'px\n}'
uri=ios.newURI("data:text/css," + encodeURIComponent(code), null, null)
sss.loadAndRegisterSheet(uri, type);

//dataStyleRegistrar.preview()
//dataStyleRegistrar.register()
n--;if(n)setTimeout(asd,500)
}
n=10;lt=10;type=1;
uri=ios.newURI("data:text/css," + encodeURIComponent('code'), null, null)

*/


 /***************************************************************
 *   tree and save
 */
var gstyle={}
defaultFileComponent={
	openStyle: function(style){
		
		
	},
	createStyle: function(){
		var name = 'untitled'//prompt('name for new style')
		if(!name)
			return
		gstyle={
				name: name,
				spec: getCssMirrorJarPath()+name
			}

		codebox.value=''
		styleList.push(gstyle)
		this.resetView()
	},
	initialize: function(){
		this.tree= treeOnSelectHandler.addTree('style-list-tree', function(tree){cssMirror.openStyle()})
		styleList = getDirEntries(getCssMirrorJarPath())
		this.resetView()
		//
		
		this.tree.view.selection.select(0)
	},
	resetView: function(){
		this.tree.view=new plainFilterView(styleList)
	},
	saveStyle: function(style){
		style.code=codebox.value
		writeData(style.code, style.name)
		style.dirty=false
	},
	removeStyle: function(style){
		var  jarFile=getCssMirrorDir()
		syncWriteToJar(jarFile, style.name, writeStringToJar, data)
	},
}
	initializeables.push(defaultFileComponent)

//generic custom tree view stuff
function plainFilterView(table) {
	this.rowCount = table.length;
	this.getCellText = function(row, col) {
		return table[row][col.id];
	};
	this.getCellValue = function(row, col) {
		return table[row][col.id];
	};
	this.setTree = function(treebox) {
		this.treebox = treebox;
	};
	this.isEditable = function(row, col) {
		return true;
	};

	this.isContainer = function(row){ return false; };
	this.isContainerOpen = function(row){ return false; };
	this.isContainerEmpty = function(row){ return true; };
	this.getParentIndex = function(row){ return 0; };
	this.getLevel = function(row){ return 0; };
	this.hasNextSibling = function(row){ return false; };

	this.isSeparator = function(row){ return false; };
	this.isSorted = function(){ return false; };
	this.getImageSrc = function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
		/* if ((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
					  getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		} */
	};
	this.getCellProperties = function(row,col,props){
		/* if ((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
					  getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		}	 */
	};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader = function(col, elem) {};
}
treeOnSelectHandler={
	name:'treeOnSelectHandler',
	timeOuts:{},
	callbacks:{},
	onSelect: function(treeID,immediate){
		dump(this.name,'onSelect',treeID,immediate)
		
		if(!immediate){
			if(this.timeOuts[treeID]){
				clearTimeout(this.timeOuts[treeID])
			}			
			var self=this
			this.timeOuts[treeID]=setTimeout(function(){self.onSelect(treeID,true)}, 10)
			return
		}
		this.callbacks[treeID]()
	},
	addTree: function(id,callback){
		this.callbacks[id]=callback
		var tree=document.getElementById(id)
		tree.setAttribute('onselect',this.name+'.onSelect("'+id+'")')
		tree.getElementsByTagName('treechildren')[0].setAttribute('onclick',this.name+'.onSelect("'+id+'")')
		return tree
	}
}
//
function onTreeClicked(event){
	var tree = document.getElementById("tree");
	var i = tree.currentIndex
	var style = styleList[i]

	if(style)
		defaultFileComponent.openStyle(style)

	/*if(event.detail==2){
		target=target[cellText]

		data=getProps(target)
		inputFilter({target:document.getElementById("filter")})
	}else
	targetPropName=cellText;
	targetProp=target[cellText];
	answer.value=targetProp;*/

}

function getExtension(f){
    if (f.lastIndexOf(".") != -1)return f.substring(f.lastIndexOf(".") + 1, f.length).toLowerCase();
    return "";
}
//			iconURL:      'moz-icon://css.css?size=16',

getDirEntries=function(uri){
	var a=makeReq(uri).split('\n201: ')
	var ans=[]
	for(var i=1;i<a.length;i++){
		var line=a[i].split(' ')
		var isDir=line[3].indexOf('DIRECTORY')>-1
		var name=line[0]
		if(isDir){
			continue//TODO
		}else{
			var auri=uri+name
			var ext=getExtension(name)
		}
		ans.push({
			name:         safeDecodeURIComponent(name),
			spec:         auri,
			dateModified: new Date(decodeURIComponent(line[2])).toString()
		})
	}
	//ans.sort(function(a,b)a.name>b.name)

	return ans
}
 function safeDecodeURIComponent(name){
	try{
		return decodeURIComponent(name)
	}catch(e){
		return name
	}
}
 /************************************/

//**************//

function writeData(data,entryPath){
	var  jarFile = getCssMirrorDir()
	syncWriteToJar(jarFile, entryPath, writeStringToJar, data, Ci.nsIZipWriter.COMPRESSION_FASTEST)
}


function importFromStylish(){
	var service = Cc["@userstyles.org/style;1"].getService(Ci.stylishStyle)
	var styleList = service.list(service.REGISTER_STYLE_ON_CHANGE,{})
	var service = Cc["@userstyles.org/style;1"].getService(Ci.stylishStyle)

	for(var i=0; i<styleList.length; i++){
		var st=styleList[i]
		st.name
		st.code
		st.enabled
		writeData(st.code, st.name+'.css')
		//prompt(st.name)
	}
}

jarRegistrar={
	basePrefName: 'extensions.shadia.enabledStyles',
	mainJarPath: getCssMirrorJarPath(),
	initialize: function(){
		this.enabledStyles=(getPref(this.basePrefName)||'').split(',')
		var self=this
		styleList.forEach(function(x){
			var isEnabled=self.enabledStyles.indexOf(x.name)>-1
			var isRegistered=self.isStyleRegistered(x.name)
			if(isEnabled&&!isRegistered){
			}else if(!isEnabled&&isRegistered){
				enabledStyles.push(x.name)
				isEnabled=true
			} 
			x.isEnabled=isEnabled
		})
		/*
		this.enabledStyles.forEach(function(x){
			self.register(x.name)
		})*/
	},
	savePref: function(){
		var arr=[]
		styleList.map(function(x){if(x.isEnabled)arr.push(x.name)})
		this.enabledStyles=arr
		setPref(this.basePrefName, this.enabledStyles.length?this.enabledStyles.join(','):'')
	},
	register:function(name){
		var uri=ios.newURI(this.mainJarPath+name, null, null);
		if (sss.sheetRegistered(uri, sheetTypes.agent))
			sss.unregisterSheet(uri, sheetTypes.agent);
		sss.loadAndRegisterSheet(uri, sheetTypes.agent)
	},
	isStyleRegistered:function(name){
		var uri=ios.newURI(this.mainJarPath+name, null, null);
		return sss.sheetRegistered(uri, sheetTypes.agent)		
	},
	unregister:function(name){
		var uri=ios.newURI(this.mainJarPath+name, null, null);
		if (sss.sheetRegistered(uri, sheetTypes.agent))
			sss.unregisterSheet(uri, sheetTypes.agent);
	},
	isStyleEnabled: function(style){
		return this.enabledStyles.indexOf(style.name)>-1
	},
	toggleEnabled: function(style){
		style.isEnabled=!style.isEnabled		
		if(style.isEnabled)
			this.register(style.name)
		else
			this.unregister(style.name)		
		
		this.savePref()
	}


}
	initializeables.push(jarRegistrar)
 /***main object*/

cssMirror={
	initialize: function(aceWindow) {
		// fixme
		codebox = Firebug.Ace.win2.editor
		this.editor = codebox
		
	},
	
	toggle: function(){
		jarRegistrar.toggleEnabled(gstyle)
	},
	preview: function(){
		dataStyleRegistrar.preview()
	},
	unpreview: function(){
		dataStyleRegistrar.unpreview()
	},
	openStyle: function(event){
		var tree = defaultFileComponent.tree;
		var i=tree.currentIndex
		var style=styleList[i]
		
		if(!style)
			return
		
		if(gstyle.code!=codebox.value){
			gstyle.dirty=true
			gstyle.code=codebox.value			
		}
			
		if(cssMirror.activeURL)
			cssMirror.unpreview()
		if(!style.code)
			style.code=makeReq(style.spec)
		codebox.value=style.code
		gstyle=style
		cssMirror.updateSaveButton()
		document.getElementById("ToggleEnabled").checked=style.isEnabled


	},
	get activeURL(){
		return dataStyleRegistrar.activeURL
	},
	createStyle: function(){
		defaultFileComponent.createStyle()
	},
	deleteStyle: function(){
		defaultFileComponent.deleteStyle()
	},
	saveStyle: function(){
		defaultFileComponent.saveStyle(gstyle)
		this.updateSaveButton()
	},
	updateSaveButton: function(){
		saveButton=document.getElementById('save-button')
		saveButton.disabled=!gstyle.dirty
		if(!gstyle.dirty)
			codebox.addEventListener('input',cssMirror.saveButtonListener,false)
	},
	saveButtonListener: function(){		
		codebox.removeEventListener('input',cssMirror.saveButtonListener,false)
		gstyle.dirty=true;
		cssMirror.updateSaveButton()
	}
}

