const Cc = Components.classes;
const Ci = Components.interfaces;

[ ["gBrowser",          "content"],
  ["gViewSourceBundle", "viewSourceBundle"]
].forEach(function ([name, id]) {
  window.__defineGetter__(name, function () {
    var element = document.getElementById(id);
    if (!element)
      return null;
    delete window[name];
    return window[name] = element;
  });
});
onLoad=function(){
	codebox=document.getElementById('codebox');
	if(window.arguments=="undefined"||!window.arguments)
		initTree()
	initFinder(codebox)
	dump(window.arguments)
	initAutocomplete()
}
/*window.addEventListener('load', function(){
	removeEventListener('load', arguments.callee, false);
   onLoad()
}, false);*/


/**stylish style listener*/
stylish={
	service: Components.classes["@userstyles.org/style;1"].getService(Components.interfaces.stylishStyle),
	sh: function(){
		return this.service.findForUrl(content.location.href, this.service.REGISTER_STYLE_ON_CHANGE, true, {})[0]
	},	
	openEditForStyle: function(style){
		gStyle=	style		
		gCode=style.code
		codebox.value=this.getInfo(style)+'\n\n'+style.code
		
		this.unpreview()
		
		document.getElementById('ToggleEnabled').checked=gStyle.enabled
	},
	getCode:function(){
		return codebox.value
	},
	infoDelimiter: '\n **--------------------~~~~~-------------------**/',	
	getInfo: function(style){
		var info='/** '+style.name
		if(style.updateUrl)
			info+='\n **updateUrl: '+style.updateUrl
		info+=this.infoDelimiter
		return info	
	},
	setInfo: function(style,str){		
		var info=str.trim().split(/\n/)
		var name=info[0].substr(3).trim()
		style.name=name?name:'untitled 1'
		
		name=info[1]
		if(!name)return
		name=name.trim().substr(2)		
		var i=name.indexOf(':')
		if(name.substr(i).trim()=="updateUrl")
			style.updateUrl = name.substring(0,i)
	},
	saveStyle: function(){
		var code=codebox.value;
		var ind=code.indexOf(this.infoDelimiter)		
		var newInfo=code.substring(0, ind).trim()		
		code=code.substr(ind+this.infoDelimiter.length).trim()		
		this.setInfo(gStyle,newInfo)
		gStyle.code=code
		gStyle.setPreview(false)		
		gStyle.save()
		initTree()
	},	
	createStylihStyle:function(){	
		var style = Components.classes["@userstyles.org/style;1"].createInstance(Components.interfaces.stylishStyle);
		style.mode = style.CALCULATE_META | style.REGISTER_STYLE_ON_CHANGE;
		style.init(null, null, null, "unsaved style", '', false, "");
	
		style.enabled=false
		style.code='';
		//style.setPreview(false);
		style.enabled=true
		style.save()
		initTree()
		this.openEditForStyle(style)
	},
	toggle:function(){		
		gStyle.enabled=!gStyle.enabled
		gStyle.save()
	},
	
	register:function(){
		if(this.activeURL)
			this.unregister()
		this.activeURL=this.getDataUrl()
		this.activeURL&&sss.loadAndRegisterSheet(this.activeURL, sss.AGENT_SHEET)
	},
	unregister:function(){
		if (this.activeURL&&sss.sheetRegistered(this.activeURL, sss.AGENT_SHEET))
			sss.unregisterSheet(this.activeURL, sss.AGENT_SHEET);
		this.activeURL=''
	},	
	preview:function(){
		//t=Date.now()
		errorListener.clearErrors()
		var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		consoleService.unregisterListener(errorListener)
		consoleService.registerListener(errorListener);
		try{
			this.register()
		}catch(e){}
		//errorListener.reportError(t-Date.now())
		consoleService.unregisterListener(errorListener)
		document.getElementById('unpreview-button').style.display=''
	},
	unpreview:function(){
		this.unregister()
		errorListener.clearErrors()
		document.getElementById('unpreview-button').style.display='none'
	},
	getDataUrl: function(){
		var code=this.getCode()
		if (!code)
			return null;
		//var nameComment = this.name ? "/*" + this.name.replace("* /", "") + "* /" : "";
		// this will strip new lines rather than escape - not what we want
		//return this.ios.newURI("data:text/css," + nameComment + this.code.replace(/\n/g, "%0A"), null, null);
		return ios.newURI("data:text/css," + encodeURIComponent(code), null, null);
	}	
}
ios= Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService)
sss= Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService)

/***************************************************************
 *error listener
 *
 */
function hig(a,b){
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
		errors.style.display = "block";errors=errors.firstChild
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
	}
}
function checkForErrors2() {
	try{
		var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
		consoleService.registerListener(errorListener);
		//var pi=document.getElementById('pi')
		if(!pi){
			piframe=document.createElementNS('http://www.w3.org/1999/xhtml','iframe')
			piframe.height='0'
			document.documentElement.appendChild(piframe)
			pi=piframe.contentDocument.createElementNS('http://www.w3.org/1999/xhtml','style')
			pi.id='pi'		
			piframe.contentDocument.document.documentElement.appendChild(pi)
		}
		pi.textContent=styleCode
	}catch(e){}
	consoleService.unregisterListener(errorListener)		
}



/***************************************************************
 *   tree
 */

initTree=function(){
	tree=document.getElementById('tree')
	styleList=stylish.service.list(stylish.service.REGISTER_STYLE_ON_CHANGE,{})
	tree.view=new plainFilterView(styleList)
}

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

//
function onTreeClicked(event){
	var tree = document.getElementById("tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };	
	try{
		tbo.getCellAt(event.clientX, event.clientY, row, col, child);
		var cellText = tree.view.getCellText(row.value, tbo.columns[0]);
	}catch(e){return}
	stylish.openEditForStyle(styleList[row.value])
	/*if(event.detail==2){
		target=target[cellText]
		
		data=getProps(target)
		inputFilter({target:document.getElementById("filter")})
	}else
	targetPropName=cellText;
	targetProp=target[cellText];
	answer.value=targetProp;*/
	
}


/*****************************************************************************/
function toggleWrap(event){	
	let wr=(codebox.hasAttribute('wrap')&&(codebox.getAttribute('wrap')=='off'))?'on':'off'	
	codebox.setAttribute('wrap',wr)	
	codebox.editor.QueryInterface(Ci.nsIPlaintextEditor).wrapWidth= wr=='off'?-1:1
}


var treeView = {
  childData : {
    Solids: ["Silver", "Gold", "Lead"],
    Liquids: ["Mercury"],
    Gases: ["Helium", "Nitrogen"]
  },

  visibleData : [
    ["Solids", true, false],
    ["Liquids", true, false],
    ["Gases", true, false]
  ],

  treeBox: null,
  selection: null,

  get rowCount()                     { return this.visibleData.length; },
  setTree:     function(treeBox)     { this.treeBox = treeBox; },
  getCellText: function(idx, column) { return this.visibleData[idx][0]; },
  isContainer: function(idx)         { return this.visibleData[idx][1]; },
  isContainerOpen:  function(idx)    { return this.visibleData[idx][2]; },
  isContainerEmpty: function(idx)    { return false; },
  isSeparator: function(idx)         { return false; },
  isSorted:    function()            { return false; },
  isEditable:  function(idx, column) { return false; },

  getParentIndex: function(idx){
    if (this.isContainer(idx)) return -1;
    for (var t = idx - 1; t >= 0 ; t--) {
      if (this.isContainer(t)) return t;
    }
  },
  getLevel: function(idx){
    if (this.isContainer(idx)) return 0;
    return 1;
  },
  hasNextSibling: function(idx, after){
    var thisLevel = this.getLevel(idx);
    for (var t = after + 1; t < this.visibleData.length; t++) {
      var nextLevel = this.getLevel(t);
      if (nextLevel == thisLevel) return true;
      if (nextLevel < thisLevel) break;
    }
    return false;
  },
  toggleOpenState: function(idx){
    var item = this.visibleData[idx];
    if (!item[1]) return;

    if (item[2]){
      item[2] = false;

      var thisLevel = this.getLevel(idx);
      var deletecount = 0;
      for (var t = idx + 1; t < this.visibleData.length; t++) {
        if (this.getLevel(t) > thisLevel) deletecount++;
        else break;
      }
      if(deletecount){
        this.visibleData.splice(idx + 1, deletecount);
        this.treeBox.rowCountChanged(idx + 1, -deletecount);
      }
    }
    else{
      item[2] = true;

      var label = this.visibleData[idx][0];
      var toinsert = this.childData[label];
      for (var i = 0; i < toinsert.length; i++) {
        this.visibleData.splice(idx + i + 1, 0, [toinsert[i], false]);
      }
      this.treeBox.rowCountChanged(idx + 1, toinsert.length);
    }
    this.treeBox.invalidateRow(idx);
  },

  getImageSrc: function(idx, column) {},
  getProgressMode : function(idx,column) {},
  getCellValue: function(idx, column) {},
  cycleHeader: function(col, elem) {},
  selectionChanged: function() {},
  cycleCell: function(idx, column) {},
  performAction: function(action) {},
  performActionOnCell: function(action, index, column) {},
  getRowProperties: function(idx, column, prop) {},
  getCellProperties: function(idx, column, prop) {},
  getColumnProperties: function(column, element, prop) {},
};

function init() {
  document.getElementById("elementList").view = treeView;
}

/****************************************
 *                                      
 *                                        
 ****************************************/


/***/
var finder=function(textArea){
	aWindow=this.editor=gBrowser.contentWindow.wrappedJSObject.editor.frame.contentWindow
	if(typeof Ci =="undefined")
		Ci = Components.interfaces;
	nsiSelCon=Components.interfaces.nsISelectionController 
	doc1=this.editor.document
this.editor.rootElement=doc1.body
	this._searchRange = doc1.createRange()
	this._searchRange.selectNodeContents(this.editor.rootElement);

var docShell = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                                .getInterface(Ci.nsIWebNavigation)
                                .QueryInterface(Ci.nsIDocShell);
this.editor.selectionController= docShell.QueryInterface(Ci.nsIInterfaceRequestor)
                                   .getInterface(Ci.nsISelectionDisplay)
                                   .QueryInterface(Ci.nsISelectionController);
	
	this.selCon=this.editor.selectionController
	this.seltype=Ci.nsISelectionController.SELECTION_IME_RAWINPUT
	this.findSelection = this.selCon.getSelection(this.seltype);
	
	this.selCon.setDisplaySelection(Ci.nsISelectionController.SELECTION_ON);
	this.selCon.setCaretVisibilityDuringSelection(true);
	
	this.finder=Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance(Components.interfaces.nsIFind)
	this.finder.caseSensitive = false
	
	
	this.selCon.getSelection(1).QueryInterface(Ci.nsISelectionPrivate).addSelectionListener(this)
	textArea.addEventLis
}
finder.prototype={
	notifySelectionChanged:function(){		
		var text=this.selCon.getSelection(1).toString()		
		if(text!==this.text){
			if(this.timeout){
				clearTimeout(this.timeout)
			}
			if(this.active)
				this.findSelection.removeAllRanges()
			var self=this
			this.text=text
			if(text)
				this.timeout=setTimeout(function()self.addRanges(text), text.length<3?300:100)
		}
	},
	addRanges:function(text){	
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
		this.timeout=''
	}

}



var finder1=function(textArea){
	this.editor=textArea.editor
	if(typeof Ci =="undefined")
		Ci = Components.interfaces;
	nsiSelCon=Components.interfaces.nsISelectionController 
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
}
finder1.prototype={
	handleEvent:function(e){
		if(this.timeout)
			clearTimeout(this.timeout)		
		if(this.active&&e.originalTarget===this.editor.rootElement)
			this.findSelection.removeAllRanges()
	},
	notifySelectionChanged:function(){	
			codeCompletion()//-------------------
		var text=this.selCon.getSelection(1).toString()		
		if(text!==this.text){
			if(this.timeout){
				clearTimeout(this.timeout)
			}
			if(this.active)
				this.findSelection.removeAllRanges()
			var self=this
			this.text=text
			if(text)
				this.timeout=setTimeout(function()self.addRanges(text), text.length<3?300:100)
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
		this.timeout=''
		dump('oldmethod--',t-Date.now());t=Date.now()
		
		//dump(t-Date.now());t=Date.now()
		/*this.addRangeszap=this.addRanges
		this.addRanges=this.addRanges2
		this.addRanges2=this.addRangeszap*/
		//dump(t-Date.now())
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
		allDocEnd=cpd._searchRange.cloneRange(); allDocEnd.collapse(dir)
		sel=cpd.editor.selection
		curEnd=sel.getRangeAt(0).cloneRange()
		curEnd.collapse(next?dir:!dir)
		cpd.finder.findBackwards=dir
		curEnd=cpd.finder.Find(text, cpd._searchRange, curEnd, allDocEnd)
		if(curEnd){
			sel.removeAllRanges()
			sel.addRange(curEnd)
		}else{
			curEnd=sel.getRangeAt(0).cloneRange()
			curEnd.collapse(!dir)
			allDocEnd=cpd._searchRange.cloneRange(); allDocEnd.collapse(!dir)
			curEnd=cpd.finder.Find(text, cpd._searchRange, allDocEnd, curEnd)
		}
		if(curEnd){
			sel.removeAllRanges()
			sel.addRange(curEnd)
		}
		cpd.selCon.setDisplaySelection(cpd.selCon.SELECTION_ATTENTION)
		cpd.editor.selectionController.scrollSelectionIntoView(1, 0, false);
	}
	/*
	typeAheadFind:function(text,dir,next){
		var sel=cpd.editor.selection
		if(!text){
			sel.removeAllRanges()
			return
		}
		allDocEnd=cpd._searchRange.cloneRange(); allDocEnd.collapse(dir)
		curEnd=sel.getRangeAt(0).cloneRange()
		curEnd.collapse(next?dir:!dir)
		cpd.finder.findBackwards=dir
		curEnd=cpd.finder.Find(text, cpd._searchRange, curEnd, allDocEnd)
		if(!curEnd){//search again from the start
			curEnd=sel.getRangeAt(0).cloneRange()
			curEnd.collapse(!dir)
			allDocEnd=cpd._searchRange.cloneRange(); allDocEnd.collapse(!dir)
			curEnd=cpd.finder.Find(text, cpd._searchRange, allDocEnd, curEnd)
		}
		sel.removeAllRanges()
		if(curEnd){			
			sel.addRange(curEnd)
		}
		cpd.selCon.setDisplaySelection(cpd.selCon.SELECTION_ATTENTION)
		cpd.editor.selectionController.scrollSelectionIntoView(1, 0, false);
	}*/
}

var initFinder=function(textArea){
	cpd=new finder1(textArea)
	var fbt=document.getElementById('findbar')
	fbt.setAttribute('onkeypress','cpd.typeAheadFind(this.value,true,0)')
}


/* 

var finder = {
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsITypeAheadFind, Components.interfaces.nsISupports]),
	nsITAF: Components.interfaces.nsITypeAheadFind,

	init: function(docshell) {},

	find: function(s, linksOnly) {
		this.searchString = s;
		return this.findFromIndex(0, false);
	},

	findAgain: function(backwards, linksOnly) {
		return this.findFromIndex(codeE.selectionStart + (backwards ? 0 : 1), backwards);
	},

	findFromIndex: function(index, backwards) {
		var start = backwards ? codeE.value.substring(0, index).lastIndexOf(this.searchString) : codeE.value.indexOf(this.searchString, index);
		var result;
		if (start >= 0) {
			result = this.nsITAF.FIND_FOUND;
		} else if (index == 0) {
			result = this.nsITAF.FIND_NOTFOUND;
		} else {
			// try again, start from the start
			start = backwards ? codeE.value.lastIndexOf(this.searchString) : codeE.value.indexOf(this.searchString);
			result = start == -1 ? this.nsITAF.FIND_NOTFOUND : this.nsITAF.FIND_WRAPPED;
		}
		codeE.editor.selection.removeAllRanges();
		if (start >= 0) {
			codeE.setSelectionRange(start, start + this.searchString.length);
			codeE.editor.selectionController.setDisplaySelection(2);
			codeE.editor.selectionController.scrollSelectionIntoView(1, 0, false);
		} else
			codeE.setSelectionRange(0, 0);
		return result;
	},

	setDocShell: function(docshell) {},
	setSelectionModeAndRepaint: function(toggle) {},
	collapseSelection: function(toggle) {},

	searchString: null,
	caseSensitive: false,
	foundLink: null,
	foundEditable: null,
	currentWindow: null
}


 */
 

/****************************************
 *                                      
 */
actions={
	reload:function(){document.location=document.location},
	reopen:function(){window.openDialog(document.location)}	
}
actionNames={reload:'r',reopen:':)'}
initActionBar=function(el){
	for(let i in actions){
		var newEl=document.createElement('button')
		newEl.setAttribute('onclick', "actions['"+i+"']()");
		newEl.setAttribute('label', actionNames[i]||i);
		newEl.setAttribute('tooltiptext', actions[i].toString());

		el.appendChild(newEl)
	}
	//el.removeChild(el)
}

dump= function(){
    var aMessage = "aMessage: ";
    for (var i = 0; i < arguments.length; ++i) {
        aMessage += arguments[i] + " , ";
    }
    var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("" + aMessage);
}

errorConsole=function(){toOpenWindowByType("global:console", "chrome://global/content/console.xul");}

function toOpenWindowByType(inType, uri, features) {
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
    var topWindow = windowManagerInterface.getMostRecentWindow(inType);
    if (topWindow) {
        topWindow.focus();
    } else if (features) {
        window.open(uri, "_blank", features);
    } else {
        window.open(uri, "_blank", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
    }
}

/************************************
 *
 *
 *
 ***************************************/
 
 codeboxEditor={
	init:function(){
		
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
 
 
function codeCompletion(){
	var editor=codebox.editor
	editor.rootElement.normalize()
	var selection = editor.selection//.getRangeAt(0);
	var range = selection.getRangeAt(0);
	var evalString2= [ range.startContainer, range.startOffset,range.endContainer, range.endOffset
	,range.startContainer.parentNode, range.startContainer.previousSibling
	].join('\n');	
	
	var line=range.startContainer,ind=range.startOffset
	if(line&&line.nodeType!=3){
		line=line.childNodes[range.startOffset]
		ind='a'
	}while(line&&line.nodeType!=3)
		line=line.previousSibling
	if(line){
		var  evalString=line.nodeValue 
		if(ind==='a')ind=evalString.length
	}else {
		var  evalString=''
		ind=0
	}
	
	dump(evalString,ind)
	//if(ind>=evalString.length)ind=evalString.length-1
	var a=parseJSFragment(evalString,ind)
	evalString=evalString+'\n'+a
	var filterText=a[1]
	
	
	var styleList=[]
	for(i in gCSSProperties){		
		styleList.push(i)
	}
	styleList=filter(styleList,filterText)
	
	var styleList2=[]
	for each(i in styleList){		
		styleList2.push({name:i})
	}
	document.getElementById('autotree').view=new plainFilterView(styleList2)
	report(evalString+'\n\n'+filterText+'\n\n'+evalString2)
}

	filter=function(propsArray,filterText){	
		if(!filterText){			
			propsArray.sort()
			return propsArray
		}
		var table = [];
		propsArray.forEach(function(val) {			
			var priority=0,lastI=0,ind1=0;			

			for(var j=0;j<filterText.length;j++){
			
				lastI = val.indexOf(filterText[j],ind1);
				
				priority += lastI-ind1
				ind1 = lastI+1;
				if(lastI===-1)
					break;
			}
			if (lastI != -1) {			
				table.push([priority,val.length,val]);
			}
		})
		table.sort(function (a, b) {
			for(i in a){
			  if (a[i]<b[i]) return -1;
			  if (a[i]>b[i]) return 1;
			}
			return 0;
		})
		var propsArray=[]
		table.forEach(function(val) {propsArray.push(val[2])})	
		return propsArray
	}



parseJSFragment= function(evalString,ind){
	var i=ind
	if(i==0) return ['property','',evalString]
	else i=i-1
	
	var rx=/[\w$-]/
	var next,it
	var skipWord=function(dir){it=i
			while(rx.test(next=evalString.charAt(i)))i+=dir;
			i-=dir
		}
	skipWord(-1)
	var ws=i,wm=it+1
	var preword=evalString.substring(ws,wm)	
	i=wm
	skipWord(1)
	var we=i+1
	var postword=evalString.substring(it,we)
	

	
	return ['property',preword,postword];
}
 
 
 initAutocomplete=function(){
	codebox.addEventListener('mouseup',codeCompletion ,false)
	codeboxEditor.init()
 }
 
 
 scrollNumbers= function(text,offset,amount){ 
		var m=parseInt(text.charAt(offset))
		if(isNaN(m))
			m=parseInt(text.charAt(++offset))
		if(isNaN(m))
			m=parseInt(text.charAt(offset-=2))
		if(isNaN(m))
			return
		var len=1,max=10,m1
		m=m+amount	
		while(m>=max){
			++len;--offset;
			m1=parseInt(text.charAt(offset))
			if(isNaN(m1)){
				len--;offset++;break;
			}		
			m=max*m1+m
			max=10*max
		}
		while(m<0){
			++len;--offset;
			m1=parseInt(text.charAt(offset))
			if(isNaN(m1)){			
				len--;offset++;break;
			}		
			m=max*m1+m
			max=10*max
		}
		if(m<0)m=0
		return text.substring(0,offset)+m+text.substr(offset+len) 
	}
 
 //
function onTreeClicked(event){
	var tree = document.getElementById("tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };	
	try{
		tbo.getCellAt(event.clientX, event.clientY, row, col, child);
		var cellText = tree.view.getCellText(row.value, tbo.columns[0]);
	}catch(e){return}
	stylish.openEditForStyle(styleList[row.value])
	/*if(event.detail==2){
		target=target[cellText]
		
		data=getProps(target)
		inputFilter({target:document.getElementById("filter")})
	}else
	targetPropName=cellText;
	targetProp=target[cellText];
	answer.value=targetProp;*/
	
}


autocompleter={
	create: function(inputField){
		this.inputField=inputField;
		this.panel=document.getElementById("autocomplate")
		this.panel.setAttribute('noautohide', 'true')
		this.panel.setAttribute('noautofocus', 'true')
		this.panel.showPopup(inputField,bo.screenX+bo.width,bo.screenY, "popup")
		this.elem.addEventListener("keypress", this, true);
	},
	clear:function(elem){
		while (elem.firstChild) {
				elem.removeChild(elem.firstChild)
			}
	},
	fill:function(array,text){
 		var container=this.panel.firstChild
		this.clear(container);
		var mi = document.createElement("label")
		mi.setAttribute("value",text)
		container.appendChild(mi)
		if(array.length==0){
			mi.setAttribute("value", "")
			mi.index=0
			return
		}
		var listbox=this.listbox=document.createElement("listbox")
		container.appendChild(listbox)
		listbox.setAttribute("onclick","autocompleter.doComplete(this.selectedItems[0].value)")
		for(var i=0; i<array.length; i++) {
			listbox.appendItem(array[i], i)
		}
	},
	doComplete:function(i){
		EJS_appendToConsole(this.activeArray[i])
	}



/* listbox{
-moz-user-focus:none;
} */

}
 
 
report=function(text){
	document.getElementById('autobox').value=text
	
}

/* 	var selection = window.getSelection();
			var range = selection.getRangeAt(0);
			var sel = {start: {node: range.startContainer, offset: range.startOffset},
						end: {node: range.endContainer, offset: range.endOffset}};			
			var ind = gURLBar.urlSplitter.inds
 */
function normalize(point,end) {
	while (point.node.nodeType != 3 ){
		var newNode = point.node.childNodes[point.offset] 
		while(!newNode){
			if(point.node===gURLBar.selector.p1){
				return ind[ind.length-1]
			}else{newNode = point.node.nextSibling;}
			if(!newNode)
				point.node = point.node.parentNode;
		}
		while(newNode.firstChild){
			newNode = newNode.firstChild
		}
		point.node = newNode;
	}
	var i=point.node.parentNode.index
	return  ind[i]+point.offset
}




 
 
 
 