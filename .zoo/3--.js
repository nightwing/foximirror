var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Services.jsm');
Cu.import('resource://xqjs/Preferences.jsm');

domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);
/***************************************************/
var mWindow=null, mNode,
inspect=function(aWindow,aNode){
	if(aWindow!==mWindow){	
		mWindow=aWindow
		domViewer.setWindow(aWindow,aNode)
	}else
		domViewer.setNode(aNode)
}
//mWindow.document.querySelector('#cmd_options')
/******************************************************************************
 * TreeView object to manage the view of the DOM tree. Wraps and provides an
 * interface to an inIDOMView object
 */
domViewer={
	initialize: function(aWindow){
		this.hiddenTree = document.getElementById("domViewer-hidden-tree");
		//this.treeBody = document.getElementById("domViewer-tree-body");
		this.mDOMView = Cc["@mozilla.org/inspector/dom-view;1"].createInstance(Ci.inIDOMView);
		this.mDOMView.showSubDocuments    =true;
		this.mDOMView.showAnonymousContent=true
		this.mDOMView.showWhitespaceNodes =false
		this.mDOMView.showAccessibleNodes =false
		this.mDOMView.whatToShow = NodeFilter.SHOW_ALL;
		//this.mDOMView.whatToShow |= NodeFilter.SHOW_PROCESSING_INSTRUCTION
		this.mDOMView.whatToShow &= ~NodeFilter.SHOW_ATTRIBUTE;
		this.hiddenTree.view = this.mDOMView;	  
		this.mainTree = document.getElementById("domViewer-main-tree");
		this.mainTree.view=null
		domSearch.initialize()
	},
	
	setWindow: function(aWindow,aNode){
		this.mainTree.view=null
		this.contentWindow = aWindow;
		this.mDOMView.rootNode = aWindow.document;
		this.mDOMView.rebuild();
		//this.mainTree.view=new copyView(this.hiddenTree.view,this.hiddenTree,this.mainTree)
		if(!aNode){
			aNode=aWindow.document.documentElement
			if(aNode.firstChild)aNode=aNode.firstChild
		}
		this.setNode(aNode)
		mWindow=aWindow
	},
	setCopyTree: function(){
		this.mainTree.view=new copyView(this.hiddenTree.view,this.hiddenTree,this.mainTree)
	},
	destroy: function(){
		this.hiddenTree.treeBoxObject.view = null;
		this.mainTree.treeBoxObject.view = null;
		this.mainTree.view=null
	},
	
	setNode: function (aNode){
		if(!aNode){
			this.mDOMView.selection.select(null);
			return false;      
		}
		// Keep searching until a pre-created ancestor is found, then 
		// open each ancestor until the found element is created.
		let domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);
		let line = [];
		let parent = aNode;
		let index = null;

		while(parent){
			index = this.mDOMView.getRowIndexFromNode(parent);
			line.push(parent);
			if(index < 0){// Row for this node hasn't been created yet.
				parent = domUtils.getParentForNode(parent, this.mDOMView.showAnonymousContent);
			}else
				break;			
		}
		// We have all the ancestors, now open them one-by-one from the top
		// to bottom.
		let lastIndex;
		let view = this.hiddenTree.treeBoxObject.view;
		for(let i = line.length - 1; i >= 0; --i){
			index = this.mDOMView.getRowIndexFromNode(line[i]);
			if(index < 0){// Can't find the row, so stop trying to descend.
				break;
			}
			if(i > 0 && !view.isContainerOpen(index)){
				view.toggleOpenState(index);
			}
			lastIndex = index;
		}

		this.mainTree.view=new copyView(this.hiddenTree.view,this.hiddenTree,this.mainTree)
		if(lastIndex >= 0){
			this.selectedRow = lastIndex;
			this.mainTree.view.selection.select(lastIndex)
			this.mainTree.treeBoxObject.ensureRowIsVisible(lastIndex)
			return true;
		}
		return false;
	}

	,closeAllButCurrent:function(){
		this.mainTree.view=null
		this.mDOMView.rebuild()
		this.setNode.mNode()
	},
	changeWhatToShow:function(data){
		domViewer.mDOMView.showWhitespaceNodes=false		
		this.mainTree.view=null
		this.mDOMView.rebuild()
		this.setNode.mNode()
	},
	currentDomNode:function(){
		return this.mDOMView.getNodeFromRowIndex(this.mainTree.currentIndex)||mNode;
	},
	currentSearchNode:function(){return domSearch.activeNodeList[this.mainTree.currentIndex]||mNode},
	currentNode:function(){
		return this.mDOMView.getNodeFromRowIndex(this.mainTree.currentIndex)||mNode;
	}
};

/******************************************************************************
 *  domViewer utils
 */
function copyView(origView,tree2,copyTree){
	this.rowCount = origView.rowCount;
	this.getCellText = function(row, col){
		let na=domViewer.mDOMView.getNodeFromRowIndex(row);
		na=domViewerSummary(na)
		return na;
	};
	this.getCellValue = function(row, col){return '1';};
	this.setTree = function(treebox){this.treebox = treebox;};
	this.isEditable = function(row, col){return false;};
	
	this.toggleOpenState= function(row){
		
		//save state
		var origRow=copyTree.treeBoxObject.getFirstVisibleRow()
		var selIndex=copyTree.currentIndex
		tree2.treeBoxObject.scrollToRow(origRow)
		origView.selection.select(selIndex)
		//
		origView.toggleOpenState(row)		
		copyTree.view=new copyView(tree2.view,tree2,copyTree)
		//reset state
		origRow=tree2.treeBoxObject.getFirstVisibleRow()		
		copyTree.treeBoxObject.scrollToRow(origRow)
		selIndex=tree2.currentIndex
		//dump('sel ',selIndex)
		copyTree.view.selection.select(selIndex)
		
	};
	//var checkRebuild=function(i){if(origView.rowCount!=copyTree.view.rowCount) rebuild(i)}
	var rebuild=function(i){
		//dump(1,'rebuuild------',origView.rowCount,copyTree.view.rowCount,i)
		var origRow=copyTree.treeBoxObject.getFirstVisibleRow()
		var selIndex=copyTree.currentIndex
		tree2.treeBoxObject.scrollToRow(origRow)
		//origView.selection.select(selIndex)
		copyTree.view=new copyView(tree2.view,tree2,copyTree)
		
		origRow=tree2.treeBoxObject.getFirstVisibleRow()
		//alert(origRow)
		copyTree.treeBoxObject.scrollToRow(origRow)
		//selIndex=tree2.currentIndex
		//dump('sel ',selIndex)
		copyTree.view.selection.select(selIndex)
	}

	this.isContainer=       function(row){ if(origView.rowCount!=copyTree.view.rowCount)rebuild();return origView.isContainer(row);};
	this.isContainerOpen=   function(row){ return origView.isContainerOpen(row); };
	this.getLevel=          function(row){ return origView.getLevel(row); };
	this.isContainerEmpty=  function(row){ return origView.isContainerEmpty(row); };
	this.hasNextSibling= function(row,col){ return origView.hasNextSibling(row,col); };
	this.getParentIndex=     function(row){ return origView.getParentIndex(row); };

	this.isSeparator = function(row){return false; };
	this.isSorted =    function(){return false; };
	this.getImageSrc = function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
		origView.getCellProperties(row,tree2.columns.getColumnAt(0),props);
	};
	this.getCellProperties = function(row,col,props){		
		origView.getCellProperties(row,tree2.columns.getColumnAt(0),props);
	};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader = function(col, elem){};
	return this
}

function plainOneColumnView(dataTable){
	this.rowCount = dataTable.length;
	this.getCellText = function(row, col){return dataTable[row];};
	this.getCellValue = function(row, col){return 1;};
	this.setTree = function(treebox){this.treebox = treebox;};
	this.isEditable = function(row, col){return false;};
	
	this.toggleOpenState=     function(row){};
	
	this.isContainer=        function(row){ return false};
	this.isContainerOpen=    function(row){ return false};
	this.getLevel=           function(row){ return 0 };
	this.isContainerEmpty=   function(row){ return true };
	this.hasNextSibling=     function(row,col){ return false };
	this.getParentIndex=     function(row){ return 0; };

	this.isSeparator =       function(row){return false; };
	this.isSorted =          function(){return false; };
	this.getImageSrc =       function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties =  function(row,props){};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader =       function(col, elem){};
	return this
}

//generic custom tree view stuff
function plainOneColumnView(table){
	this.rowCount = table.length;
	this.getCellText = function(row, col){return domViewerSummary(table[row]);};
	this.getCellValue = function(row, col){return ;};
	this.setTree = function(treebox){this.treebox = treebox;};
	this.isEditable = function(row, col){return false;};
	
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
		/* if((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
					  getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		} */
	};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader = function(col, elem){};
}

domViewerSummary= function(el){
	var name=''
	//typeof el==='object'
	if(el.nodeType==7){
		name+=el.target+' ->'+el.data
	}else if(el.nodeType==9){
		name+=el.nodeName+': '+el.title +'->'+el.documentURI
	}else{
		if(el.nodeName)
			name+=el.nodeName
		if(el.id)
			name+=" #"+el.id		
		if(el.className)
			name+="."+el.className.toString().replace(" ",".",'g')
		if(el.nodeValue)
			name+="="+el.nodeValue
		else if(el.value)
			name+=" ="+el.value
		else if(el.childElementCount==0&&el.textContent)
			name+=' ="'+el.textContent.substring(0,100)+'"'
		if(typeof el.hasAttribute=='function' &&el.hasAttribute('src'))
			name+="->"+el.getAttribute('src')
		if(el.nodeName=='key'){
			name+=domViewerKeySummary(el)
		}			
	}
	return name
}


domViewerKeySummary=function(el){
	var name=''
	if(el.hasAttribute('key'))
		name+=' '+el.getAttribute('key')
	if(el.hasAttribute('keycode'))
		name+=' '+el.getAttribute('keycode')
	if(el.hasAttribute('modifiers'))
		name+=' '+el.getAttribute('modifiers')
	/*if(el.hasAttribute('command'))
		name+=' '+el.getAttribute('command')*/
	return name
}

/**********************************************
 * dom search and xpath
 */
 
domSearch={
	initialize: function(aWindow){
		this.findbar = document.getElementById('domViewerSearch');
		this.nodeCount = this.findbar.children[1];
		this.textbox = this.findbar.children[0];
		this.textbox.setAttribute('oninput','domSearch.onIninput(this.value)')
		this.textbox.setAttribute('oncommand','domSearch.onIninput(this.value)')

	},
	onIninput: function(xpath){		
		xpath=this.parseXPATH2(xpath)
		if(!xpath){
			if(this.activeNodeList){
				domViewer.setNode(mNode)
				this.activeNodeList=false
				domViewer.currentNode=domViewer.currentDomNode
				domViewer.mainTree.removeAttribute('ondblclick')
			}
			return
		}
		dump('--->',xpath)	
		result=this.searchDocument(xpath, mNode.ownerDocument)
		this.nodeCount.value=result.snapshotLength
		this.activeNodeList= [];  
		for(var i = 0; i < result.snapshotLength; i++){  
			this.activeNodeList[i] = result.snapshotItem(i);  
		}  
		domViewer.mainTree.view=new plainOneColumnView(this.activeNodeList)	
		domViewer.currentNode=domViewer.currentSearchNode
		domViewer.mainTree.setAttribute('ondblclick',"domSearch.textbox.value=''")
	},
	
	handleEvent: function(event){
	},
	
	parseXPATH2:function(str){
		var i=0,i0=0,next=str.charAt(i)
		if(next=='/')
			return this.isValidXpath(str)
		//
		var rx=/[\w$-]/
		var skipWord=function(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		var parseAttrs=function(){i0=i;
			while(next){
				if(next=='.'){
					skipWord()
					classes.push(str.substring(i0,i));
						}else if(next=='['){
					skipWord()
					attrs.push(str.substring(i0,i));
				}else if(next=='&'){
					mode=' and '
				}
				next=str.charAt(i++)
			}
		}
		
		var name,classes=[],id,attrs=[],mode=' or '
		while(next){
			if(rx.test(next)){
				skipWord()
				name=str.substring(i0,i);
			}else if(next=='#'){
				skipWord()
				id=str.substring(i0,i);
			}else if(next=='.'){
				skipWord()
				classes.push(str.substring(i0,i));
					}else if(next=='['){
				skipWord()
				attrs.push(str.substring(i0,i));
			}else if(next=='&'){
				mode=' and '
			}
			next=str.charAt(i++)
		}
		var ansPath=[]
		if(name&&!id&&classes.length==0){
			id=name;classes=[name]
		}
		if(name)
			ansPath.push("contains(name(), '"+name+"')")
		if(id)
			ansPath.push("contains(@id, '"+id+"')")
		if(classes)
			classes.forEach(function(val){if(val){ansPath.push("contains(@class, '"+val+"')")}})
		if(!ansPath.length)
			return null
		return '//*['+ansPath.join(mode)+']'
	},

	isValidXpath:function(anXpath){
		if (!anXpath || anXpath=='/' || anXpath=='.') return;    
		// if (!xpathEvaluator) 
		xpathEvaluator = new XPathEvaluator(); 
		try{
			var nsResolver=xpathEvaluator.createNSResolver(document.documentElement)
			xpathEvaluator.createExpression(anXpath, nsResolver);
			return anXpath
		}catch(ex){
			return null
		}
	},
	searchDocument: function(path, aNode){
		var xpe = new XPathEvaluator();  
		var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?aNode.documentElement : aNode.ownerDocument.documentElement);  
		return result = xpe.evaluate(path, aNode, nsResolver,  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
	}
	
};

function evaluateXPath(aNode, aExpr) {  
	var xpe = new XPathEvaluator();  
	var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?  
			aNode.documentElement : aNode.ownerDocument.documentElement);  
	var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);  
	var found = [];  
	var res;  
	while (res = result.iterateNext())  
		found.push(res);  
	return found;  
}  
function docEvaluateArray (expr, doc, context, resolver) {  
     doc = doc ? doc : (context ? context.ownerDocument : document);  
     resolver = resolver ? resolver : null;  
     context = context ? context : doc;   
       
     var result = doc.evaluate(expr, context, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
     var a = [];  
     for(var i = 0; i < result.snapshotLength; i++) {  
         a[i] = result.snapshotItem(i);  
     }  
     return a;  
 } 

/******************************************************************************
 * TreeView object to manage the view of the DOM tree. Wraps and provides an
 * interface to an inIDOMView object
 *
 * TreeView object to manage the view of the DOM tree. Wraps and provides an
 * interface to an inIDOMView object
 */
function init2(){	
	domViewer.initialize()
	computedStyleViwer.initialize()
	
	if(!window.arguments){
		winService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var fWins=winService.getEnumerator('');
		while(fWins.hasMoreElements()){			
			mWindow=fWins.getNext()			
		} 
		winService.getZOrderDOMWindowEnumerator('', true);
		domViewer.setWindow(mWindow)
	}else{		
		inspect(window.arguments[0],window.arguments[1])
	}	
	
	
	//dump(window.arguments,window.arguments[0],window.arguments[1])
}

function domViewerClick(event){	
	mNode=domViewer.currentNode()
	//subViewer.setNode
	insertAddrs(mNode)	
}

sayAttrs=function(mNode){
	if(!mNode.attributes){
		return '<div class="cssProp"><span class="cssPropName">text</span>= <span class="span.cssPropVal">'+mNode.nodeValue+'</span></div>'
	
	};
	var ans=['<span class="selector">'+mNode.nodeName+'</span>']
	for(var i=0;i<mNode.attributes.length;i++){
		ans.push('<span class="cssPropName">'+mNode.attributes[i].name+'</span>= <span class="span.cssPropVal">'+mNode.attributes[i].value.toString()+'</span>')
	}
	ans.push('<span class="moreinfo">xmlns= '+mNode.namespaceURI)
	return '<div>'+ans.join('</div><div class="cssProp">')+'</div>'
}
saveAttrs=function(mNode,text){
	var attrs=text.split('\n')
	for(var i=1;i<attrs.length-2;i++){
		mNode.setAttribute.apply(mNode,attrs[i].split(/= */))
	}
}

cssSelector= function(el){
	var name=''
	//typeof el==='object'
	if(el.nodeType==7){
		name+=el.target+' ->'+el.data
	}else{
		if(el.nodeName)
			name+=el.nodeName
		if(el.id)
			name+="#"+el.id		
		if(el.className)
			name+="."+el.className.toString().replace(" ",".",'g')		
	}
	return name
}


sayParents=function(mNode){
	var parent=mNode
	var ans=[]
	while(parent){//&&parent.nodeType==1
		ans.push(cssSelector(parent))
		//dump(parent)
		parent=parent.parentNode
	}
	return '<div class="parents"><a11> \u25c4 </a11><a>'+ans.join('</a><a11> \u25c4 </a11><a>')+'</a></div>'
}

sayCSS=function(mNode){
	/*if(!mNode.attributes)
		return false;*/
	var inspectedRules=domUtils.getCSSStyleRules(mNode)
	if(!inspectedRules)
		return
	
	var ans=[], rules=[]
	var rule
	if(mNode.style&&(rule=mNode.style.cssText)){
		ans.push('element.style {',breakRule2(rule),'<div class="ruleEnd">} </div>');
	}	
	for(var i = inspectedRules.Count()-1; i >=0 ; --i){
		var rule= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule);
		var href=rule.parentStyleSheet.href;  // Null means inline
		if(!href)href=mNode.ownerDocument.location.href//change to stylesheet
		var ruleLine = domUtils.getRuleLine(rule);
		var id=ruleLine+(href.length<100?href:rule.selectorText)
		if(rules.indexOf(id)<0){
			rules.push(id)
			href='<a1>'+ruleLine+(href[0]=='d'?'/data:':href.substr(href.lastIndexOf('/'))/**/)+'</a1>'

			ans.push("<span class='selector'>"+rule.selectorText+'</span>{',breakRule2(rule.cssText),'<div class="ruleEnd">} '+href+'</div>')
		}else{ans.push('<div>'+id+'</div>')}
	}
	//inspectElInJS(rule)
	return '<div >'+ans.join('</div><div>')+'</div>'
}

breakRule=function(cssText){
	return cssText.replace(';',';<br>','g').replace('{ ','{<br>','g')
}

breakRule2= function(cssText){
	var props = [];
	cssText=cssText.substr(cssText.indexOf('{')+1)
	var lines = cssText.match(/(?:[^;\(]*(?:\([^\)]*?\))?[^;\(]*)*;?/g);
	var propRE = /\s*([^:\s]*)\s*:\s*(.*?)\s*(! important)?;?$/;
	var propRE = /\s*([^:\s]*)\s*:\s*(.*?)\s*;?$/;
	var line,i=0;
	while(line=lines[i++]){
		m = propRE.exec(line);
		if(!m)
			continue;
		//var name = m[1], value = m[2], important = !!m[3];
		/*if (m[2])this.addProperty(m[1], m[2], !!m[3], false, inheritMode, props);*/
		props.push("<span class='cssPropName'>"+m[1]+"</span>: <span class='cssPropVal'>"+m[2]+"</span>;")
	};
	
	return "<div class='cssProp'>"+props.join("</div><div class='cssProp'>")+'</div>';
},



insertAddrs=function(mNode){
	//document.getElementById('tb2').value=sayAttrs(mNode)||domViewerSummary(mNode)
	//document.getElementById('content-primary').contentDocument.body.innerHTML=sayAttrs(mNode)
	//computedStyleViwer.compCSS(mNode)
	//document.getElementById('content-primary').contentDocument.body.innerHTML=computedStyleViwer.compCSS(mNode)
	switch(mNode.nodeType){
		case 1:viewDoc.body.innerHTML=[sayAttrs(mNode),sayParents(mNode),sayCSS(mNode)].join('<div class="ruleEnd"></div>');break//ELEMENT_NODE
		//case 2 ATTRIBUTE_NODE
		case 3://TEXT_NODE
		case 4://CDATA_SECTION_NODE: 4  
		case 8://COMMENT_NODE: 8  
			viewDoc.body.textContent=mNode.nodeValue
			break
		default:
		viewDoc.body.textContent=domViewerSummary(mNode)
				//ENTITY_REFERENCE_NODE:
				//ENTITY_NODE: 
				//PROCESSING_INSTRUCTION_NODE: 
				//DOCUMENT_NODE: 9  number
				//DOCUMENT_TYPE_NODE: 10  number
				//DOCUMENT_FRAGMENT_NODE: 11  number
				//NOTATION_NODE: 12  number
	}
}
	
attributeViewer={
	setNode: function(mNode){
		viewDoc.body.innerHTML=sayAttrs(mNode)
	}
	
}
styleViewer={
	setNode: function(mNode){
		viewDoc.body.innerHTML=sayCSS(mNode)
	}
	
}
subViewer=attributeViewer
	
	

computedStyleViwer={
	initialize:function(){
		this.element=document.documentElement.appendChild(document.createElement('box'))
		var a=document.getElementById('subpantabs')
		var b=createElement('toolbarbutton',{label:'attributeViewer',oncommand:"subViewer=attributeViewer;subViewer.setNode(mNode)"})
		a.appendChild(b)
		var b=createElement('toolbarbutton',{label:'styleViewer',oncommand:"subViewer=styleViewer;subViewer.setNode(mNode)"})
		a.appendChild(b)		
		var b=createElement('spacer')
		a.appendChild(b)
		for(let i in contentStates){
			var b=createElement('toolbarbutton',{label:i,oncommand:'setContentState("'+i+'")',type:'checkbox'})
			a.appendChild(b)
		
		}
		
		viewDoc=document.getElementById('content-primary').contentDocument
		link=viewDoc.createElement('link')
	},
	compCSS: function(mNode){
		var ans=[]
		var o1=mWindow.getComputedStyle(mNode,""),
			o2=mWindow.getComputedStyle(mNode,":hover"),
			o3=mWindow.getComputedStyle(mNode,":focus"),
			o4=mWindow.getComputedStyle(mNode,":active"),
			o5=window.getComputedStyle(this.element,"")

		for(i in o1)
			if(o1[i]!=o2[i])
				ans.push(i+" : "+o1[i]+"  "+o2[i]+' 2')
		ans.push('----------------------------')
		for(i in o1)
			if(o1[i]!=o3[i])
				ans.push(i+" : "+o1[i]+"  "+o3[i]+' 3')
		ans.push('----------------------------')
		for(i in o1)
			if(o1[i]!=o4[i])
				ans.push(i+" : "+o1[i]+"  "+o4[i]+' 4')
		ans.push('----------------------------')
		for(i in o1)
			if(o1[i]!=o5[i])
				ans.push(i+" : "+o1[i]+"  "+o5[i]+' 5')
		ans.push('----------------------------')
		for(i in o1)
			ans.push(i+" : "+o1[i])
		return '<div >'+ans.join('</div><div>')+'</div>'
	}
}

contentStates={active: 0x01,focus: 0x02, hover: 0x04}

setContentState=function(state){
	domUtils.setContentState(mNode,contentStates[state])
	insertAddrs(mNode)
}


/***
 *
 */
function createElement(name, atrs){
  var lm = document.createElement(name);
  for(let key in atrs) lm.setAttribute(key, atrs[key]);
  return lm;
}
function empty(lm){
  while(lm.hasChildNodes()) lm.removeChild(lm.lastChild);
  return lm;
}


dump= function(){
    var aMessage = "aMessage: ";
    for(var i = 0; i < arguments.length; ++i){
        aMessage += arguments[i] + " , ";
    }
    var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("" + aMessage);
}
/************************/


function viewFileURI(selectedURI,lineNumber){   
    if ("viewSource" in gViewSourceUtils) {
        gViewSourceUtils.viewSource(selectedURI, null, null, lineNumber);
    } else {
        openDialog("chrome://global/content/viewSource.xul", "_blank", "all,dialog=no", selectedURI, null, null, lineNumber, null);
    }
}



function SRVr_CmdViewSelectedFileURI() {
    var rule = this.getSelectedRule();
    if (!rule || !rule.parentStyleSheet || !rule.parentStyleSheet.href) {
        return;
    }
    var selectedURI = rule.parentStyleSheet.href;
    var lineNumber = rule.type == CSSRule.STYLE_RULE ? this.mRuleView.mDOMUtils.getRuleLine(rule) : null;
    if ("viewSource" in gViewSourceUtils) {
        gViewSourceUtils.viewSource(selectedURI, null, null, lineNumber);
    } else {
        openDialog("chrome://global/content/viewSource.xul", "_blank", "all,dialog=no", selectedURI, null, null, lineNumber, null);
    }
}







/**

st=parseInt('25b7',16)-100
en=st+200
st=0;en=10000
d=[]
for(var i=st;i<en;i++)
d.push( [i.toString(16),String.fromCharCode(i)])
d.join('\n')

//*[contains(@id,'urlba')]
//*[contains(name(),'dy')]

t=Date.now()
docEvaluateArray("//*[contains(name(),'a') or contains(@id,'a') or contains(@class,'a')]",doc)
t-Date.now()





t=Date.now()
evaluateXPath(document,"*[contains(name(.),'a')]")

"//*[contains(name(),'a') or contains(@id,'a') or contains(@class,'a')]"

/* XPathResult




 
 
 a=shadia.toUp(window.frames[5].document)
//shadia.domi(a)
for(var i=0;i<window.frames.length;i++){
  var w=window.frames[i].document
  print(jn.inspect(shadia.toUp(w))+'->'+w.location+'->'+w.title)
}
 
 
 
 
 

openDialog('chrome://stylishmirror/content/CodeMirror')




		winService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var fWins=winService.getEnumerator('');
		while(fWins.hasMoreElements()){			
			mWindow=fWins.getNext()			
		}









	var rs=document.documentElement.getClientRects(),bigI=0,bigV=rs[0].width
	for(var i=rs.length-1;i>=0;i--)
		if(rs[i].width>bigV){
			bigI=i,bigV=rs[i].width
		}
	rs=rs[bigI]
	var cor=rs.height/2
	this.box.style.left  =(rs.left-cor )+"px";
	this.box.style.top   =(rs.top      )+"px";
	this.box.style.left  =(cor         )+"px";
	this.box.style.height=(rs.width+cor)+"px";









*/


/*domUtils.setContentState(mNode,STATE_ACTIVE)
domUtils.getContentState(mNode)*/
// See: http://mxr.mozilla.org/mozilla1.9.2/source/content/events/public/nsIEventStateManager.h#153

