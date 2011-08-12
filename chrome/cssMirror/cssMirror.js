const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import('resource://shadia/main.js', window).addDevelopmentUtils(window)
getCssMirrorDir=$shadia.getCssMirrorDir
getCssMirrorJarPath=$shadia.getCssMirrorJarPath

ios = Services.io
sss = Services.sss
consoleService = Services.console



/***/

var initializeables=[]
function initialize(){
	codebox=document.getElementById('codebox');
	codeboxEditor.init()
	//initServices()	
	for each(var i in initializeables)
		i.initialize()
/*	initFinder(codebox)
	initAutocomplete()*/
}
window.addEventListener('load', function(){
		removeEventListener('load', arguments.callee, false);
		initialize()
	}, false);

/***************************************************************
 *error listener
 *
 */
function goToErrorLine(a,b){
	codeboxEditor.selectLines(a,b-1,a,b+1)
}
/*codeboxEditor.selectLines(edu.nthLine(a),b,edu.nthLine(a),b)
ed=gBrowser.contentWindow.wrappedJSObject.editor.editor
	edu=gBrowser.contentWindow.wrappedJSObject.editor
*/
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


sheetTypes={agent: sss.AGENT_SHEET, user: sss.USER_SHEET}
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


// codebox shortcuts
keyHandler={
	init: function(){
		codebox.addEventListener("keydown", this, true);
		codebox.addEventListener("keypress", this.keypress, true);
		//codebox.addEventListener("keyup", this, true);
		dump(125)
	},
	pressed:false,
	stopEvent:function(e){
		e.preventDefault();e.stopPropagation();
	},
	handleEvent:function(e){
		dump(e.which,e.keycode,e.charcode)
		if(e.ctrlKey) switch(e.which){
			case KeyboardEvent.DOM_VK_K:
			case KeyboardEvent.DOM_VK_SPACE:
				//autocompleter.toggleMode()
				startCodeCompletion();
				this.stopEvent(e)
				break
			case KeyboardEvent.DOM_VK_RETURN:
				cssMirror.preview();
				this.stopEvent(e)
				break
			case KeyboardEvent.DOM_VK_ESCAPE:
				cssMirror.unpreview();
				this.stopEvent(e)
				break
			case KeyboardEvent.DOM_VK_DOWN:
				EJS_nextCommandFromHistory();
				this.stopEvent(e)
				break
			case KeyboardEvent.DOM_VK_UP:
				EJS_previousCommandFromHistory();
				this.stopEvent(e)
				break
		}
		if(e.shiftKey) switch(e.which){
			case KeyboardEvent.DOM_VK_RETURN:
				cssMirror.unpreview();
				this.stopEvent(e)
				break
			case KeyboardEvent.DOM_VK_ESCAPE:
				cssMirror.unpreview();
				this.stopEvent(e)
				break
		}
	},
	keypress:function(e){//tab duplicate
		if ((e.keyCode == e.DOM_VK_TAB) && !(e.ctrlKey || e.altKey || e.metaKey)) {//tab key
			//var start = t.selectionStart, end = t.selectionEnd;
			var ed=codebox.editor
			var sel=ed.selection
			var text=sel.toString()
			var selCon=ed.selectionController
			if(!text){
				insertText('\t', codebox)
			}else{
				var start, end = codebox.selectionEnd;
				sel.collapseToStart()
				selCon.intraLineMove(false,false)
				start = codebox.selectionStart
				codebox.selectionEnd = end

				text = codebox.value.slice(start, end)
				text = e.shiftKey?text.replace('\n\t','\n','g').replace(/^\t/,''):
								'\t'+text.replace('\n','\n\t','g')
				//dump(text.toSource())
				insertText(text, codebox)
				codebox.selectionStart=start
			}

			e.stopPropagation();
			e.preventDefault();
		}else if(String.fromCharCode(e.charCode).toLowerCase()=='d'&& e.ctrlKey){
			var ed=codebox.editor
			var sel=ed.selection
			var text//=sel.toString()
			var selCon=ed.selectionController
			if(!sel.isCollapsed()){
				selCon.intraLineMove(false,false)
				selCon.intraLineMove(true,true)
				//text=sel.toString()
				text=codebox.value.slice(codebox.selectionStart,codebox.selectionEnd)
				sel.collapseToEnd()
				insertText('\n'+text, codebox)
			}else{
				text=codebox.value.slice(codebox.selectionStart,codebox.selectionEnd)

				sel.collapseToEnd()
				insertText(text, codebox)
			}
			e.stopPropagation();
			e.preventDefault();
		}else
			sillyParser.complete()
	},
}

function insertText(iText, elem){
	elem.editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(iText);
}

codeboxEditor={
	init:function(){
		keyHandler.init()
	},
	insertText:function(text){
		codebox.editor.insertText||codebox.editor.QueryInterface(Ci.nsIPlaintextEditor)
		codebox.editor.insertText(text)
	},
	deleteText:function(){
		//codebox.editor.deleteSelection(EJS_cntJsCode.editor.ePreviousWord)
	},
	selectLines:function(i,i0,j,j0){
		dump(i,i0,j,j0)
		var rel=codebox.editor.rootElement
		rel.normalize()
		var a=rel.children[i].previousSibling,
			b=rel.children[j].previousSibling
			r=codebox.editor.selection.getRangeAt(0)
		//modify var l=a.nodeValue.
		//scrollSelectionIntoView(in short type, in short  region, in boolean isSynchronous)
		r.setStart(a,Math.min(a.length,i0))
		r.setEnd  (b,Math.min(b.length,j0))
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

sillyParser={
	parse: function(){
		var rx=/[\w$\-\[\]\(\)]/,i0,i
		var skipWord=function(){i0=i;
			while(rx.test(prev=str.charAt(i)))i--;
		}
		str=codebox.value
		i=codebox.selectionStart-1
		prev=str.charAt(i)

		//*************
		skipWord()
		curWord=str.substring(i+1,i0+1)
		termChar=prev
		//****************
		var colonSeen, mode
		if(prev==':'&&str.charAt(i-1)==':'){
			termChar='::'
			mode='selector'
			return [mode,termChar,curWord]
		}
		if(prev==' '){
			var j=i
			while(str.charAt(--j)==' ');
			if(str.charAt(j)&&!rx.test(str.charAt(j)))termChar=str.charAt(j)
		}
		if(prev==':')
			colonSeen=true

		while(prev=str.charAt(i--)){
			//dump(prev,i)
			if(prev=='}'){
				mode='selector';
				return [mode,termChar,curWord]
			}else if(prev==':'){
				colonSeen=true
				iColon=i
			}else if(prev==';'||prev=='{'){
				mode=colonSeen? 'propValue' : 'propName'
				if(colonSeen){
					return [mode,termChar,curWord,str.substring(i+2, iColon+1).trim()]
				}
				return [mode,termChar,curWord]

			}
		}
		return  ['selector',termChar,curWord]

	},

	complete: function(im){
		var t=Date.now()
		clearTimeout(this.timeout)
		if(!im){
			this.timeout=setTimeout(function(){sillyParser.complete(true)},100)
			return
		}
		var p=this.parse()

		document.getElementById('autobox').value=p.join('\n')
		completionProvider.tree=document.getElementById('autotree')
		dump(t-Date.now())
		completionProvider[p[0]](p)
		completionProvider.setView()
	},

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

autocompleter={
	mode:false,
	toggleMode: function(all){
		if(typeof all=='undefined')
			this.mode=!this.mode
		else
			this.mode=all
		if(this.mode){
			this.tree.width=620
			this.tree.setAttribute('hidecolumnpicker',false)
			this.tree.columns[2].element.width=32

			this.tree.columns[0].element.setAttribute('hideheader',false)
			this.tree.columns[1].element.setAttribute('hideheader',false)
			this.tree.columns[1].element.hidden=false
			this.tree.columns[2].element.setAttribute('hideheader',false)
		}else{
			this.tree.width=280
			this.tree.columns[2].element.width=32
			this.tree.setAttribute('hidecolumnpicker',true)
			this.tree.columns[0].element.setAttribute('hideheader',true)
			this.tree.columns[1].element.setAttribute('hideheader',true)
			this.tree.columns[1].element.hidden=true
			this.tree.columns[2].element.setAttribute('hideheader',true)
		}

	},
	create: function(inputField,mode){
		if(!this.panel){//get domNodes
			this.inputField=inputField;
			this.panel=document.getElementById("autocomplatePanel")
			this.tree=this.panel.getElementsByTagName('tree')[0]
			this.number=this.panel.getElementsByTagName('label')[0]

			this.bubble=document.getElementById("autocomplate-bubble")
			//set handlers
			this.panel.setAttribute('onpopupshown','autocompleter.setView(0)')
			this.tree.setAttribute('ondblclick','autocompleter.insertSuggestedText(),autocompleter.finish()')
			this.tree.setAttribute('onselect','autocompleter.onSelect()')
		}
		try{this.toggleMode(mode)}catch(e){}

		this.inputField.addEventListener("keypress", this, true);
	},
	start:function(evalObj,filterText,posX,posY){
			dump('start',posX,posY)

		if(typeof posX=='undefined'||typeof posY=='undefined'){
			let bo=this.panel.boxObject
			posX=bo.screenX;posY=bo.screenY;

		}
		dump('start',posX,posY);
		this.object=evalObj
		this.text=filterText
		var t=Date.now()
		this.unfilteredArray=getProps(evalObj)

		if(this.specFunc)
			this.getSpecialEntries()
		dump('propsTime',t-Date.now())

		this.filterText=filterText
		this.filter(this.unfilteredArray,filterText)

		if(this.panel.state=='open'){
			this.setView(0)
			this.panel.moveTo(posX,posY)
		}else
			this.panel.showPopup(null,posX,posY, "popup")
	},
	getSpecialEntries: function(){
		var [spo,funcName]=this.specFunc
		var ans=[]
		try{
			if(funcName=='QueryInterface'){
				var spo = EJS_evalStringOnTarget(spo)
				supportedInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=="getInterface"){
				var spo = EJS_evalStringOnTarget(spo)
				supportedgetInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=='getElementById'){
				ans=getIDsInDoc()
			}else if(funcName=="getAttribute"||funcName=="setAttribute"||funcName=="hasAttribute"){
				var spo = EJS_evalStringOnTarget(spo)
				var att=spo.attributes
				for(var i=0;i<att.length;i++){
					var x=att[i]
					ans.push({name:'\u2555"'+x.nodeName+'")',comName: '"'+x.nodeName.toLowerCase(),description:x.value, depth:-1,special:true})
				}
			}
		}catch(e){Cu.reportError(e)}
		this.unfilteredArray=ans.concat(this.unfilteredArray)
	},
	setView: function(si){
		if(typeof si!='number')
			si=this.tree.currentIndex
		this.tree.view=new treeView(this.sortedArray)
		this.tree.view.selection.select(si);
        this.tree.treeBoxObject.ensureRowIsVisible(si);
		this.number.value=si+':'+this.sortedArray.length+'/'+this.unfilteredArray.length
	},
	finish:function(i){
		this.hidden=true
		this.inputField.removeEventListener("keypress", this, true);
		window.removeEventListener("mousedown",this.u,true)

		this.panel.hidePopup()
	},

	filter:function(data,text){
		var table =[];
		if(!text){
			data.forEach(function(val) {table.push(val)})
			table.sort()
			this.sortedArray=table
			return;
		}
		var filterText=text.toLowerCase()
		var filterTextCase=this.text

		//**funcs*****/
		function springyIndex(val){
			var lowVal=val.comName
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

		}
		var sortVals=['priority','depth','comName']

		data.forEach(springyIndex)
		table.sort(function (a, b) {
			if(!a.special&&b.special) return 1;
			if(a.special&&!b.special) return -1;//???
			for each(var i in sortVals){
			  if (a[i]<b[i]) return -1;
			  if (a[i]>b[i]) return 1;
			}
			return 0;
		})
		this.sortedArray=table
	}

	,handleEvent: function(event){
		dump('handleEvent---------',event.charCode,String.fromCharCode(event.charCode),event.ctrlKey,event.altKey)
		if(String.fromCharCode(event.charCode)=='t'&&event.ctrlKey){
			this.toggleMode()
			event.preventDefault();event.stopPropagation();
		}
		var t
		if(event.ctrlKey||event.altKey){
			if(event.charCode!=0&&(t=String.fromCharCode(event.charCode))){
				if (t=='.'){//complete object and start inspecting it
					var o=this.sortedArray[this.tree.currentIndex]
					if(o){
						this.insertSuggestedText(t)
						this.start(o.object,"")
					}
				}
			}
			return;
		}
		switch(event.keyCode){
			case KeyEvent.DOM_VK_HOME:
				this.moveTreeSelectionBig('top');
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_END:
				this.moveTreeSelectionBig('end');
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_UP:
				this.moveTreeSelection(-1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				this.moveTreeSelection(1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_BACK_SPACE:
				this.text=this.text.substr(0,this.text.length-1)
				this.filter(this.unfilteredArray,this.text);
				this.setView(0);
				break
			case KeyEvent.DOM_VK_RETURN:
				this.insertSuggestedText();
				this.finish()
				event.preventDefault();event.stopPropagation();
				break
			case 46:
			this.startMain(this.object[this.selected()],"")
				break;
			case KeyEvent.DOM_VK_RIGHT:
				this.finish();break
			case KeyEvent.DOM_VK_RIGHT:
			default:

				if(event.charCode==0){
					this.finish();event.preventDefault();event.stopPropagation();break
				}
				var t=String.fromCharCode(event.charCode)
				if (!event.ctrlKey&&/[; \+\-\*\:;\]\)\(\)\}\{\?]/.test(t))
					this.finish()

				this.text+=t;
				dump('-===>',t,this.text)

				this.filter(this.unfilteredArray,this.text);
				this.setView(0)
				//break
		}
	},
/* listbox{
-moz-user-focus:none;
}

*/
	moveTreeSelectionBig: function(to){
		var tree=this.tree,view=tree.view
		switch(to){
			case 'end':var c=view.rowCount-1;break
			case 'top':var c=0;break
			case 'pup':var c=view.rowCount-1;break
			default: return
		}
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c)//(c>0?c:0)
	}
	,moveTreeSelection: function(direction){
		var tree=this.tree,view=tree.view,c=view.selection.currentIndex
		c+=direction
		if(c>=view.rowCount)	c=-1
		if(c<-1)				c=view.rowCount-1
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c>=0?c:(direction>0?0:view.rowCount-1))
	},
	selectedText: function(){
		var c=this.tree.view.selection.currentIndex
		if(c<0) return
		return this.sortedArray[c].name
	},
	insertSuggestedText: function(additionalText){
		var c=this.tree.view.selection.currentIndex
		if(c<0) return
		var c=this.sortedArray[c]
		var isSpecial=c.special
		var text=c.name

		var l=this.text.length
		if(isSpecial){
			text=text.substr(1)
		}else if(/^\d*$/.test(text)){
			text='['+text+']'
			l++
		}else if(!/^[a-z$_][a-z$_0-9]*$/i.test(text)){
			text='["'+text+'"]'
			l++
		}
		if(additionalText)
			text=text+additionalText
		this.inputField.selectionStart=this.inputField.selectionStart-l;
		insertText(text, this.inputField)
	}


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
		var name=prompt('enter name')
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
		styleList=getDirEntries(getCssMirrorJarPath())
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
	var i=tree.currentIndex
	var style=styleList[i]

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
	var  jarFile=getCssMirrorDir()
	syncWriteToJar(jarFile, entryPath, writeStringToJar, data, Ci.nsIZipWriter.COMPRESSION_FASTEST)
}


function importFromStylish(){
	var service= Cc["@userstyles.org/style;1"].getService(Ci.stylishStyle)
	var styleList=service.list(service.REGISTER_STYLE_ON_CHANGE,{})
	var service= Cc["@userstyles.org/style;1"].getService(Ci.stylishStyle)

	for(var i=0;i<styleList.length;i++){
		var st=styleList[i]
		st.name
		st.code
		st.enabled
		writeData(st.code,st.name+'.css')
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