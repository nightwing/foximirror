//ensure no other instances of cssmirror are open
 (function(){
	var e = Services.wm.getEnumerator(null)

	while(e.hasMoreElements()){
		var w = e.getNext()
		
		if(w==window)
			continue
		if(w.location.href == window.location.href){
			w.focus()        
			window.close()
			return
		}
	}
})() 

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
	errors:[],
	reportError:function(message){		
		try{
			var error=message.QueryInterface(Components.interfaces.nsIScriptError);
		}catch(e){
			var error={lineNumber:0, columnNumber:0, errorMessage:message}
		}
		this.errors.push({
			row: error.lineNumber,
			column: error.columnNumber,
			text: error.errorMessage,
			type: error.flags&error.errorFlag?'error':"warning",
			lint: 'error'
		})
	},
	clearErrors:function(){
		this.errors = []		
	},
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIConsoleListener, Ci.nsISupports]),
	observe: function(message) {
		try{
			this.reportError(message)
		}catch(e){}
	},
	
	checkForErrors:function(context,funcToCheck,args){
		//t=Date.now()
		this.clearErrors()
		consoleService.registerListener(this);
		try{
			funcToCheck.apply(context,args||[])
		}catch(e){
			// only looking for css errors
		}finally{
			consoleService.unregisterListener(this)
		}
		
		//errorListener.reportError(t-Date.now())
	},
}


sheetTypes = {agent: sss.AGENT_SHEET, user: sss.USER_SHEET}
dataStyleRegistrar={
	initialize: function() {
		$shadia.editGlue.setDataSource('cssMirror',  this.getCode)
		this.uri = ios.newURI('edit:@cssMirror`preview.css',null,null)
	},
	activeURLList: {},
	shutdown: function() {
		this.unregister()
		$shadia.editGlue.removeDataSource('cssMirror');
	},
	getCode:function() {
		return codebox.session.getValue()
	},
	activeSheetType: sheetTypes.agent,
	
	addUri: function(name) {
		return this[name] = Services.io.newURI('edit:@cssMirror`'+name, null, null)
	},
	register:function() {
		this.unregister()
		sss.loadAndRegisterSheet(this.uri, this.activeSheetType)
	},
	unregister:function(name) {
		if (this.uri && sss.sheetRegistered(this.uri, this.activeSheetType))
			sss.unregisterSheet(this.uri, this.activeSheetType);
	},
	changeSheetType: function(aType) {
		if (this.uri&&sss.sheetRegistered(this.uri, this.activeSheetType)){
			sss.unregisterSheet(this.uri, this.activeSheetType);
			this.activeSheetType=aType
			sss.loadAndRegisterSheet(this.uri, this.activeSheetType)
		} else
			this.activeSheetType=aType
	},
	preview:function() {
		//t=Date.now()
		errorListener.clearErrors()
		errorListener.checkForErrors(this, this.register)
		
		setTimeout(function() {
			$('unpreview-button').hidden=false;
			codebox.session.setAnnotations(errorListener.errors);
		}, 200)
	},
	unpreview:function() {
		this.unregister()
		errorListener.clearErrors()
		setTimeout(function()$('unpreview-button').hidden=true, 200)
	},
	getDataUrl: function() {
		var code=this.getCode()
		if (!code)
			return null;
		// this will strip new lines rather than escape - not what we want
		//return this.ios.newURI("data:text/css," + nameComment + this.code.replace(/\n/g, "%0A"), null, null);
		return ios.newURI("data:text/css," + encodeURIComponent(code), null, null);
	},
}
	initializeables.push(dataStyleRegistrar)

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


/***************************************************************
 *   tree and save
 */
var gstyle={}
defaultFileComponent={
	openStyle: function(style){
		
		
	},
	createStyle: function(){
		cssMirror.openStyle()
		styleList.push(gstyle)
		this.resetView()
		return gstyle
	},
	initialize: function(){
		this.tree= treeOnSelectHandler.addTree('style-list-tree', function(tree){
			var tree = defaultFileComponent.tree;
			var i = tree.currentIndex
			var style = styleList[i]
			cssMirror.openStyle(style)
		})
		styleList = getDirEntries(getCssMirrorJarPath())
		this.resetView()
		//
		
	},
	resetView: function(){
		this.tree.view=new plainFilterView(styleList)
		this.tree.view.selection.select(styleList.indexOf(gstyle))
	},
	getUniqueName: function(){
		var name = 'untitled-'
		var i = 0, used = [], m
		for each(var s in styleList){
			var m = s.name.match(/untitled-(\d+)(\.|$)/)
			if (m) {
				used.push(parseInt(m[1]))				
			}
		}
		if (used.length) {
			used.sort()
			i = used[used.length-1] + 1
		}
        return name + i	+ '.css'		
	},
	saveStyle: function(style){
		var name = style.name
		if(!name){
			var out = {value:this.getUniqueName()}
			var proceed = Services.prompt.prompt(window,"css:mirror","pick a name",out,'',{})
			if(!proceed)	
				return
			name = out.value
		}
		if (!name)
			return
		if (!/\.css$/.test(name))
			name = name + ".css"
		style.code = codebox.session.getValue()
		style.name = name
		style.spec = getCssMirrorJarPath()+name
		
		writeData(style.code, name)
		style.dirty = false
		
		this.resetView()
	},
	removeStyle: function(style){
		if(!style||style.name)
			return
		var jarFile = getCssMirrorDir()
		syncWriteToJar(jarFile, style.name, removeEntryFromJar, data)
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
	var row = {};
    var col = {};
    var obj = {};
    var b = defaultFileComponent.tree.treeBoxObject
    b.getCellAt(event.clientX, event.clientY, row, col, obj);
      
	col.value.id == 'isEnabled'
     
	row.value 
	
	defaultFileComponent.setE

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
				self.enabledStyles.push(x.name)
				isEnabled=true
			} 
			x.isEnabled=isEnabled
		})		
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
		
		//add shortcuts
		codebox.addCommands({
			execute: FBL.bind(this.preview, this),
		});
		aceWindow.canon.addCommand({
			name: "unpreview",
			bindKey: {
				win: "Esc",
				mac: "Esc",
				sender: "editor"
			},
			exec: FBL.bind(this.unpreview, this)
		});
		
		addCSSBehaviour(aceWindow.require, aceWindow.modeCache.get("css"))
		
		this.openStyle()
	},
	
	toggle: function(i){
		jarRegistrar.toggleEnabled(i==null?gstyle:i)
	},
	preview: function(){
		dataStyleRegistrar.preview()
	},
	unpreview: function(){
		dataStyleRegistrar.unpreview()
	},
	openStyle: function(style) {
		if(!codebox.session)
			return
			
		var newCode = codebox.session.getValue()
		if (gstyle.code != newCode){
			gstyle.dirty = true
			gstyle.code = newCode
		}
		if(cssMirror.activeURL)
			cssMirror.unpreview()

		if(!style) {
			let name = defaultFileComponent.getUniqueName()
			style = {name:name,code:'/*** '+ name +' created by sorCereSS ***/\n{}',spec:'',dirty:true}
		}
		if(!style.code)
			style.code = style.spec ? makeReq(style.spec) : ''
		if(!style.session)			
			style.session = Firebug.Ace.win2.createSession(style.code, style.spec, 'text/css')
		
		codebox.setSession(style.session)
		gstyle = style
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
		var proceed = Services.prompt.confirm(window,"css:mirror","are you sure?")
		if(!proceed)	
			return
		defaultFileComponent.removeStyle(gstyle)
	},
	saveStyle: function(){
		defaultFileComponent.saveStyle(gstyle)
		this.updateSaveButton()
	},
	updateSaveButton: function(){
		saveButton=document.getElementById('save-button')
		saveButton.disabled=!gstyle.dirty
		if(!gstyle.dirty)
			codebox.addEventListener('change',cssMirror.saveButtonListener,false)
	},
	saveButtonListener: function(){		
		codebox.removeEventListener('change',cssMirror.saveButtonListener,false)
		gstyle.dirty=true;
		cssMirror.updateSaveButton()
	}
}



/************************************************/
addCSSBehaviour = function(require, mode){
	mode.$behaviour = new (require("ace/mode/behaviour/cstyle").CstyleBehaviour)();
	mode.$behaviour.add("important", "insertion", function (state, action, editor, session, text) {
        if (text == '!') {
            var cursor = editor.getCursorPosition();
            var char = session.getLine(cursor.row)[cursor.column];
            
            return {
                text: char == ';'?'!important': '!important;',
                selection: false
            }            
        }
	})

	mode.$behaviour.add("important", "deletion", function (state, action, editor, session, range) {
		var selected = session.doc.getTextRange(range);
		dump(selected, range)
		if (!range.isMultiLine() && selected == "!") {
			var cursor = range.end;
			var lineEnd = session.getLine(cursor.row);
			if(lineEnd.substr(cursor.column, 9) == "important"){
				range.end.column+=9
				return range                
			}
		}
		return false;
	})
}

