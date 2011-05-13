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
deadLight={
	toggle:function(act){
		if(typeof act=='undefined')act=this.active
		if(act)
			domViewer.mainTree.removeEventListener('mousemove',this,false)
		else
			domViewer.mainTree.addEventListener('mousemove',this,false)
		this.active=!act		
	},
	handleEvent:function(event){
		var tbo = domViewer.mainTree.treeBoxObject;		
		var row = { }, col = { }, child = { };
		tbo.getCellAt(event.clientX, event.clientY, row, col, child);
		var i=row.value;
		if(i<0) return
		var node=domViewer.mDOMView.getNodeFromRowIndex(i)
		if(mWindow.shadia)
			mWindow.shadia.inspectingLight(node)
		else
			shadowInspector.injectShadia(mWindow)
	}
}

function copyView(origView,tree2,copyTree){
	this.rowCount = origView.rowCount;
	this.getCellText = function(row, col){
		let na=domViewer.mDOMView.getNodeFromRowIndex(row);
		na=domNodeSummary(na)
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

function plainOneColumnView(table){
	this.rowCount = table.length;
	this.getCellText = function(row, col){return domNodeSummary(table[row]);};
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

function domSearchView(table){
	this.rowCount = table.length;
	this.getCellText = function(row, col){return domNodeSummary(table[row]);};
	this.getCellValue = function(row, col){return ;};
	this.setTree = function(treebox){this.treebox = treebox;};
	this.isEditable = function(row, col){return false;};

	this.isContainer = function(row){ return table[row].nodeType==9; };
	this.isContainerOpen = function(row){ return true; };
	this.isContainerEmpty = function(row){ return false; };
	this.getParentIndex = function(row){ return 0; };
	this.getLevel = function(row){ return table[row].nodeType==9?0:1; };
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
	this.toggleOpenState= function(row){return}
}


domNodeSummary= function(el){
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
		this.nodeCount = this.findbar.getElementsByTagName('label')[0];
		this.textbox = this.findbar.getElementsByTagName('textbox')[0];
		this.textbox.setAttribute('oninput','domSearch.onIninput(this.value)')
		this.textbox.setAttribute('oncommand','domSearch.onIninput(this.value)')
		this.textbox.addEventListener('keypress',this,true)
	},
	onIninput: function(xpath){
		if(xpath==this.activeXPath)
			return
		this.activeXPath=xpath
		xpath=this.parseXPATH2(xpath)
		if(!xpath){
			if(this.activeNodeList){
				this.deactivate()				
			}
			return
		}
/*		dump('--->',xpath)
function iterateWindows(mWindow,level){
	inspwin(mWindow,level)
	for(var i=0;i<mWindow.frames.length;i++){
		var w=mWindow.frames[i]
		if(w.frames.length>0)iterateWindows(w,level+1)
		else inspwin(w,level+1)
	}
}

var slf=this
function inspwin(w,level){
	var d=w.document
	dump(d.location)
	var result=slf.searchDocument(xpath, d.documentElement)
	slf.activeNodeList.push(d)
	for(var i = 0; i < result.snapshotLength; i++){
			slf.activeNodeList.push( result.snapshotItem(i));
	}
}
this.activeNodeList= [];
iterateWindows(mWindow,0)
this.nodeCount.value=this.activeNodeList.length
this.activate2()
return
/**	*/
		var result=this.searchDocument(xpath, mNode)
		this.nodeCount.value=result.snapshotLength
		this.activeNodeList= [];
		for(var i = 0; i < result.snapshotLength; i++){
			this.activeNodeList[i] = result.snapshotItem(i);
		}
		this.activate()
	},
	
	activate: function(){
		domViewer.mainTree.view=new plainOneColumnView(this.activeNodeList)
		domViewer.currentNode=domViewer.currentSearchNode
		domViewer.mainTree.setAttribute('ondblclick',"domSearch.textbox.value='';domSearch.deactivate()")
	},
	activate2: function(){
		domViewer.mainTree.view=new domSearchView(this.activeNodeList)
		domViewer.currentNode=domViewer.currentSearchNode
		domViewer.mainTree.setAttribute('ondblclick',"domSearch.textbox.value='';domSearch.deactivate()")
	},
	deactivate: function(){
		domViewer.setNode(mNode)
		this.activeNodeList=false
		domViewer.currentNode=domViewer.currentDomNode
		domViewer.mainTree.removeAttribute('ondblclick')
		
	},
	selectNode: function(){
		domViewer.setNode(mNode)
		this.activeNodeList=false
		domViewer.currentNode=domViewer.currentDomNode
		domViewer.mainTree.removeAttribute('ondblclick')
	},

	handleEvent: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_UP:
				this.moveTreeSelection(-1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				this.moveTreeSelection(1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_RETURN:
				this.deactivate()	
				event.preventDefault();event.stopPropagation();
				break
		}
	},

	parseXPATH2:function(str){
		var i=0,i0=0,next=str.charAt(i++)//i is one char farther than next so that [# .] are skipped
		if(next=='/')
			return this.isValidXpath(str)
		//
		var rx=/[\w$-]/
		var skipWord=function(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		var parseAttrs=function(){i0=i;var  pendingAttr='';
			while(next){
				if(rx.test(next)){
					skipWord()
					if(pendingAttr){
						attrs.push([pendingAttr,'']);
						pendingAttr=''
					}
					pendingAttr=str.substring(i0-1,i)

					lastAttr=str.substring(i0,i)
				}else if(next=='='){
					skipWord()
					pendingAttr&&attrs.push([pendingAttr,str.substring(i0,i)]);
					pendingAttr=''
				}else if(next==']')
					break
				next=str.charAt(i++)
			}
			if(pendingAttr){
				attrs.push([pendingAttr,'']);
				pendingAttr=''
			}
		}

		var name,classes=[],id,attrs=[],mode=' and '
		while(next){
			if(rx.test(next)){
				skipWord()
				name=str.substring(i0-1,i);
			}else if(next=='#'){
				skipWord()
				id=str.substring(i0,i);
			}else if(next=='.'){
				skipWord()
				classes.push(str.substring(i0,i));
			}else if(next=='['){
				parseAttrs()
			}else if(next=='&'){
				mode=' and '
			}else if(next=='|'){
				mode=' or '
			}
			next=str.charAt(i++)
		}
		//construct xpath
		function translationXPFrag(name,frag){
			var ans1=[],ans2=[]
			for each(var i in name){
				var k=i.toUpperCase()
				if(k!=i&&ans1.indexOf(k)==-1){
					ans1.push(k);ans2.push(i)
				}
			};
			if(ans1.length)
				return "translate("+frag+",'"+ans1.join('')+"','"+ans2.join('')+"')"
			return frag
		}
		function containsXPFrag(name,frag){
			return "contains("+translationXPFrag(name,frag)+", '"+name+"')"

		}

		var ansPath=[]
		if(name&&mode==' or '&&!id&&classes.length==0&&attrs.length==0){
			id=name;classes=[name]
		}
		if(name)
			ansPath.push(containsXPFrag(name,'name()'))
		if(id)
			ansPath.push(containsXPFrag(id,'@id'))
		if(classes.length)
			classes.forEach(function(val){if(val){ansPath.push(containsXPFrag(val,'@class')) }} )
		if(attrs.length){
			attrs.forEach(function(val){
					var attrpath=[]
					if(val[0]){attrpath.push( containsXPFrag(val[0],'name()') )}
					if(val[1]){attrpath.push( containsXPFrag(val[1],'.') )}
					ansPath.push("@*["+attrpath.join(' and ')+']')
				})
		}
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
		dump(path)
		var xpe = new XPathEvaluator();
		var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?aNode.documentElement : aNode.ownerDocument.documentElement);
		return result = xpe.evaluate(path, aNode, nsResolver,  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	}

	,moveTreeSelection: function(direction){
		var tree=domViewer.mainTree,view=tree.view,c=view.selection.currentIndex
		c+=direction
		if(c>=view.rowCount)	c=-1
		if(c<-1)				c=view.rowCount-1
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c)
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
function domViewermd(event){
	this.li=domViewer.mainTree.currentIndex
}
function domViewermu(event){
	if(this.li==domViewer.mainTree.currentIndex)
		domViewerClick()
}
/**************************
 *
 */

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
rulesForNode=function(mNode){
	var inspectedRules=domUtils.getCSSStyleRules(mNode)
	if(!inspectedRules)
		return []
	var rules=[]
	for(var i = inspectedRules.Count()-1; i >=0 ; --i){
		rules.push(inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule));
	}
	return rules
}
sayCSS=function(rules){
	currentRules=rules

	var ans=[], usedrules=[]
	var rule, n=rules.length
	/*if(mNode.style&&(rule=mNode.style.cssText)){
		ans.push('element.style {',breakRule2(rule),'<div class="ruleEnd">} </div>');
	}*/
	for(var i = 0; i <n; i++){
		var rule= rules[i]
		if(rule.type==1){
			var href=rule.parentStyleSheet.href;  // Null means inline
			if(!href)href=mNode.ownerDocument.location.href//change to stylesheet
			var ruleLine = domUtils.getRuleLine(rule);
			var id=ruleLine+(href.length<100?href:rule.selectorText)
			if(usedrules.indexOf(id)<0){
				usedrules.push(id)
				href='<a1>'+ruleLine+(href[0]=='d'?'/data:':href.substr(href.lastIndexOf('/'))/**/)+'</a1>'
				ans.push("<span class='selector'>"+rule.selectorText+'</span>{',breakRule2(rule.cssText),'<div class="ruleEnd">} '+href+'</div>')
			}else{ans.push('<div>'+id+'</div>')}
		}else if(rule.cssRules){//document
			var sel=rule.cssText
			sel=sel.substring(0,sel.indexOf('{'))
			ans.push("<span class='docrule'>"+sel+'</span>{',"<div class='cssProp'>"+sayCSS(rule.cssRules)+'</div>','<div class="ruleEnd">}</div>')
		}else{
			ans.push('<div class="ruleEnd"><span class="selector">'+rule.cssText+'</span>'+rule.type+'</div>')
		}
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
	//document.getElementById('tb2').value=sayAttrs(mNode)||domNodeSummary(mNode)
	//document.getElementById('content-primary').contentDocument.body.innerHTML=sayAttrs(mNode)
	//computedStyleViwer.compCSS(mNode)
	//document.getElementById('content-primary').contentDocument.body.innerHTML=computedStyleViwer.compCSS(mNode)
	switch(mNode.nodeType){
		case 1:viewDoc.body.innerHTML=[sayAttrs(mNode),sayParents(mNode),sayCSS(rulesForNode(mNode)),computedStyleViwer.compCSS(mNode)].join('<div class="ruleEnd"></div>');break//ELEMENT_NODE
		//case 2 ATTRIBUTE_NODE
		case 3://TEXT_NODE
		case 4://CDATA_SECTION_NODE: 4
		case 8://COMMENT_NODE: 8
			viewDoc.body.textContent=mNode.nodeValue
			break
		case 7://PROCESSING_INSTRUCTION_NODE
			if(mNode.sheet)
				viewDoc.body.innerHTML=[sayAttrs(mNode),sayParents(mNode),sayCSS(mNode.sheet.cssRules)]
			else
				viewDoc.body.innerHTML=[sayAttrs(mNode),sayParents(mNode)]
				
				var d=viewDoc.createElement('pre')
				d.textContent=makeReq(/.*href="?(.*)".*/.exec(mNode.data)[1])
				viewDoc.body.appendChild(d)
			break
		default:
			viewDoc.body.textContent=domNodeSummary(mNode)
				//ENTITY_REFERENCE_NODE:
				//ENTITY_NODE:
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

		var aWindow=(mNode.ownerDocument||mNode).defaultView


		var cs1=aWindow.getComputedStyle(mNode,"")
		//setContentState('hover')
		var cs2=aWindow.getComputedStyle(computedStyleViwer.element,"")
		//o2=aWindow.getComputedStyle(mNode,":hover")":focus"":active"
		var l,m
		for(var i=0;i<cs1.length;i++){
			var k=cs1.item(i)
			var l=cs1.getPropertyValue(k),m=cs2.getPropertyValue(k)
			if(l!=m){
				ans.push(k+':'+l+':'+m)
			}
		}
		return '<div >'+ans.join('</div><div>')+'</div>'
	}
}

contentStates={active: 0x01,focus: 0x02, hover: 0x04}

setContentState=function(state){
	domUtils.setContentState(mNode,contentStates[state])
	insertAddrs(mNode)
}

/*****************************************************
 *  css
 ***********************/
 

function multiLevelTreeView(){
}
multiLevelTreeView.prototype = {
	treeBox: null,
	selection: null,

	get rowCount()                     { return this.visibleData.length; },
	setTree:     function(treeBox)     { this.treeBox = treeBox; },
	getCellText: function(row, col) { return this.visibleData[row][col.id]; },
	isContainer: function(row)         { 
		var t=this.visibleData[row]
		/*if(typeof t.isContainer!='undefined'){
			return t.isContainer
		}dump('ss')t.isContainer=*/
		var l=t.level,t1=this.childData[t.index+1]			
		return t1&&t.level<t1.level; 
	},
	isContainerOpen:  function(row)    { var t=this.visibleData[row+1];return t&&t.index==this.visibleData[row].index+1; },
	isContainerEmpty: function(row)    { return false; },
	isSeparator: function(row)         { return false; },
	isSorted:    function()            { return false; },
	isEditable:  function(row, column) { return false; },

	getParentIndex: function(row){
		var item=this.visibleData[row],l=item.level
		if(l==0) return -1
		var i=row-1;
		while(i>0&&(item=this.visibleData[i])&&item.level<=l){
			i--
		}
		return i
	},
	getLevel: function(row){
		return this.visibleData[row].level;
	},
	hasNextSibling: function(row, after){
		var thisLevel = this.getLevel(row);
		for (var t = after + 1; t < this.visibleData.length; t++) {
			var nextLevel = this.getLevel(t);
			if (nextLevel == thisLevel) return true;
			if (nextLevel < thisLevel) break;
		}
		return false;
	},
	toggleOpenState: function(row){
		var  item=this.visibleData[row];
		
		var thisLevel = item.level;
		var deletecount = 0;
		for (var t = row + 1; t < this.visibleData.length; t++) {
			if (this.visibleData[t].level > thisLevel) deletecount++;
			else break;
		}
		if(deletecount){
			this.visibleData.splice(row + 1, deletecount);
			this.treeBox.rowCountChanged(row + 1, -deletecount);		
		}else{//open	
			var index=item.index+1, a, l, splicePos=row
			while((a=this.childData[index])&&(l=a.level)>thisLevel){
				if(l==thisLevel+1){
					splicePos++
					this.visibleData.splice(splicePos, 0, a);
				}
				index++
			}
			this.treeBox.rowCountChanged(row+1, splicePos-row);
		}
		this.treeBox.invalidateRow(row);
	},

	getImageSrc: function(row, column) {},
	getProgressMode : function(row,column) {},
	getCellValue: function(row, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(row, column) {},
	performAction: function(action) {},
	performActionOnCell: function(action, index, column) {},
	getRowProperties: function(row, prop) {dump(this.childData,row,prop)
		var pn=this.visibleData[row].property
		if(!pn)return
		var aserv=Components.classes["@mozilla.org/atom-service;1"]. getService(Components.interfaces.nsIAtomService);
		prop.AppendElement(aserv.getAtom(pn));
	},
	getCellProperties: function(row, column, prop) {
		var pn=this.visibleData[row].property
		if(!pn)return
		var aserv=Components.classes["@mozilla.org/atom-service;1"]. getService(Components.interfaces.nsIAtomService);
		prop.AppendElement(aserv.getAtom(pn));
	},
	getColumnProperties: function(column, element, prop) {	
	},
	
};
/*******************************************/
function toggleCSSViewer(){
	view1 =new multiLevelTreeView()
	view2 =new multiLevelTreeView()
	
	//fillwin(tree1,view1);
	fillwin2(domViewer.mainTree,view2,mWindow)
	domViewer.mainTree.columns[1].element.hidden=false
	
	
	domViewerClick=function(){
		var i=domViewer.mainTree.currentIndex
		viewDoc.body.innerHTML=sayCSS(view2.visibleData[i].frame.cssRules)
	}
}
onTree1Clicked=function(event){
	var tree = tree1;
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	//var cellText = tree.view.getCellText(row.value, tbo.columns[0]);
	var f=view1.visibleData[row.value]
	if(f&&(f=f.frame)){
		fillwin2(tree2,view2,f)
	}

}
onTree2Clicked=function(event){
	var tree = tree2;
	var tbo = tree.treeBoxObject;
dump('zz')
	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	//var cellText = tree.view.getCellText(row.value, tbo.columns[0]);
	var f=view2.visibleData[row.value]
	if(f&&(f=f.frame)){
		sayRules(f.cssRules)
	}
}

function sayRules(cssRules){
	viewDoc.body.innerHTML=aWin.sayCSS(cssRules)
}

/****************************************/
windowViewer={
	initialize: function(){
		this.tree=document.getElementById('window-tree')
		fillwin()
		this.tree.view=treeView
		this.tree.onclick='windowViewer.startShadia()'
		//this.tree.onselect=init2()

	},
	startShadia: function(){
		var win =this.currWin()		
		/*if('shadia' in win){		
		}else
			shadowInspector.activate()*/
		win.shadia.start();
		win.focus()
	},
	currWin: function(){
		var i=this.tree.currentIndex
		if(i<0)i=0
		//console.log(i)
		i=treeView.visibleData[i][1]
		//console.log(111,treeView.childData[i]	)
		return treeView.childData[i][2]		
	},
	currTopWin: function(){
		var i=this.tree.currentIndex
		i=treeView.visibleData[i][1]
		i=i-treeView.childData[i][1]
		return 	treeView.childData[i][2]
	}
}


function fillwin(tree,view){
	function toUp(el){
		let domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);   
        return domUtils.getParentForNode(el, true)||{};
	}

	var winTable=[],index=0
	function inspwin(w,level){
		var d=w.document;
		winTable.push({
			level: level,
			text: level+'  |'+d.title+'<:>'+d.documentURI+'<:>'+ toUp(d).id,
			parent: toUp(d),
			frame: w,
			index: index++				
		})	
	}

	function iterateInnerFrames(mWindow,level){
		inspwin(mWindow,level)
		for(var i=0;i<mWindow.frames.length;i++){
			var innerFrame=mWindow.frames[i]		
			if(innerFrame.frames.length>0) iterateInnerFrames(innerFrame,level+1)
			else inspwin(innerFrame,level+1)
		}
	}
	var winService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var fWins=winService.getEnumerator('');
	while(fWins.hasMoreElements()){	
		iterateInnerFrames(fWins.getNext(),0)	
	} 	
	view.childData=winTable
	view.visibleData=[]
	for(var i=0;i<winTable.length;i++){
		view.visibleData.push(winTable[i]);winTable[i]
	}
	
	tree.view=view
}



/**find stylesheets without owner nodes*/
domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);

function collectAgentSheets(callback){
	var st='<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?><window xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"><'
	var en='/></window>'
	var tags=['scrollbar','tree','textbox','toolbarbutton',
		'toolbar','button','checkbox','menu','window','popup','script','listbox',
		'richlistbox','groupbox','menulist','splitter']
	st=st+tags.join('/><')+en

	var frame =document.getElementById('hiddenFrame')
	if(!frame){
		var frame=document.createElement("iframe");
		frame.setAttribute("collapsed", "true");
		document.documentElement.appendChild(frame);
		frame.id='hiddenFrame'
	}
	frame.contentDocument.location="data:application/vnd.mozilla.xul+xml," + encodeURIComponent(st);


	function getStyleSheetsFromNode(mNode,userAgentStyles){	
		var inspectedRules=domUtils.getCSSStyleRules(mNode)
		if(!inspectedRules)	return			
		for(var i = inspectedRules.Count()-1; i >=0 ; --i){
			var rule= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule);
			var sheet=rule.parentStyleSheet
			while(sheet.ownerRule){sheet=sheet.ownerRule.parentStyleSheet;}
			if(sheet.ownerNode)continue
			if(sheet.href.slice(0,5)=='data:')continue
			if(userAgentStyles.indexOf(sheet)==-1)
				userAgentStyles.push(sheet)

		}
	};
	if(frame.loadListener)
		frame.removeEventListener("load", frame.loadListener,true)
	frame.addEventListener("load", frame.loadListener=
	function(){
		var elements= this.contentDocument.documentElement.childNodes
		var userAgentStyles=[]
		for(var i=0; i<elements.length;i++){
			getStyleSheetsFromNode(elements[i],userAgentStyles)	
		}
		userAgentStyles.sort(function(a,b){return a.href>b.href})
		callback(userAgentStyles)
	},true)
}

function fillwin2(tree,view,window){		
	function callback(userAgentStyles){
		var st=[], std=window.document.styleSheets	
		var winTable=[],index=0
		
		allCSSSheets=[]

		doCssRules = function(stylesheet,d){
			var cssRules=stylesheet.cssRules,count=cssRules.length
			allCSSSheets.push(stylesheet)
			winTable.push({	level: d, frame: stylesheet, count:count, index: index++
						, text: stylesheet.href||stylesheet.ownerNode.ownerDocument.documentURI })
			for(var j = 0; j < count; j++){
				var rule = cssRules[j];
				if(rule.styleSheet){
					doCssRules(rule.styleSheet,d+1)
				}
			}
		} 
		winTable.push({	level: 0, frame: null, count:std.length, index: index++, text: 'document.styleSheets',property: "head" })
		for(var j = 0; j < std.length; j++)
			doCssRules(std[j],1)
			
		winTable.push({	level: 0, frame: null, count:userAgentStyles.length, index: index++, text: 'userAgentStyles',property: "head" })
		for(var j = 0; j < userAgentStyles.length; j++)
			doCssRules(userAgentStyles[j],1)
			
		
		view.childData=winTable
		view.visibleData=[]
		for(var i=0;i<winTable.length;i++){
			view.visibleData.push(winTable[i]);
		}
		tree.view=view
	}
	collectAgentSheets(callback)			
}




var findRules = function(text, stylesheets){
	var ans=[]
	function iterateCSSRules(cssRules){
		for (var j = 0; j < cssRules.length; j++){
			var rule = cssRules[j];				
			if (rule.type===1){
				var selector = rule.selectorText;
				if(selector.indexOf(text)>-1)
					ans.push(rule)
			}else if(rule.cssRules)	
				iterateCSSRules(rule.cssRules)	
		}
	}
	for (var i = 0; i < stylesheets.length; i++){
		iterateCSSRules(stylesheets[i].cssRules)
	}
	return ans
}





cssSearch={
	initialize: function(aWindow){
		this.findbar = document.getElementById('domViewerSearch');
		this.nodeCount = this.findbar.getElementsByTagName('label')[0];
		this.textbox = this.findbar.getElementsByTagName('textbox')[0];
		this.textbox.setAttribute('oninput','domSearch.onIninput(this.value)')
		this.textbox.setAttribute('oncommand','domSearch.onIninput(this.value)')
		this.textbox.addEventListener('keypress',this,true)
	},
	onIninput: function(xpath){
		if(xpath==this.activeXPath)
			return
		this.activeXPath=xpath
		//xpath=this.parseXPATH2(xpath)
		dump(xpath,this.activeXPath)
		var result=findRules(xpath,allCSSSheets)	
this.nodeCount.value=result.length		
		sayRules(result)
		dump('<----**8**---->')
	},

	handleEvent: function(event){
		switch(event.keyCode){
			
		}
	},

	parseXPATH2:function(str){
		var i=0,i0=0,next=str.charAt(i++)//i is one char farther than next so that [# .] are skipped
		if(next=='/')
			return this.isValidXpath(str)
		//
		var rx=/[\w$-]/
		var skipWord=function(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		var parseAttrs=function(){i0=i;var  pendingAttr='';
			while(next){
				if(rx.test(next)){
					skipWord()
					if(pendingAttr){
						attrs.push([pendingAttr,'']);
						pendingAttr=''
					}
					pendingAttr=str.substring(i0-1,i)

					lastAttr=str.substring(i0,i)
				}else if(next=='='){
					skipWord()
					attrs.push([pendingAttr,str.substring(i0,i)]);
					pendingAttr=''
				}else if(next==']')
					break
				next=str.charAt(i++)
			}
			if(pendingAttr){
				attrs.push([pendingAttr,'']);
				pendingAttr=''
			}
		}

		var name,classes=[],id,attrs=[],mode=' and '
		while(next){
			if(rx.test(next)){
				skipWord()
				name=str.substring(i0-1,i);
			}else if(next=='#'){
				skipWord()
				id=str.substring(i0,i);
			}else if(next=='.'){
				skipWord()
				classes.push(str.substring(i0,i));
			}else if(next=='['){
				parseAttrs()
			}else if(next=='&'){
				mode=' and '
			}else if(next=='|'){
				mode=' or '
			}
			next=str.charAt(i++)
		}
		//construct xpath
		function translationXPFrag(name,frag){
			var ans1=[],ans2=[]
			for each(var i in name){
				var k=i.toUpperCase()
				if(k!=i&&ans1.indexOf(k)==-1){
					ans1.push(k);ans2.push(i)
				}
			};
			if(ans1.length)
				return "translate("+frag+",'"+ans1.join('')+"','"+ans2.join('')+"')"
			return frag
		}
		function containsXPFrag(name,frag){
			return "contains("+translationXPFrag(name,frag)+", '"+name+"')"

		}

		var ansPath=[]
		if(name&&mode==' or '&&!id&&classes.length==0&&attrs.length==0){
			id=name;classes=[name]
		}
		if(name)
			ansPath.push(containsXPFrag(name,'name()'))
		if(id)
			ansPath.push(containsXPFrag(id,'@id'))
		if(classes.length)
			classes.forEach(function(val){if(val){ansPath.push(containsXPFrag(val,'@class')) }} )
		if(attrs.length){
			attrs.forEach(function(val){
					var attrpath=[]
					if(val[0]){attrpath.push( containsXPFrag(val[0],'name()') )}
					if(val[1]){attrpath.push( containsXPFrag(val[1],'.') )}
					ansPath.push("@*["+attrpath.join(' and ')+']')
				})
		}
		if(!ansPath.length)
			return null
		return '//*['+ansPath.join(mode)+']'
	},	
};



 
 
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






/**********************************************************
 * io
 ****/
function viewFileURI(selectedURI,lineNumber){
	openDialog("chrome://global/content/viewSource.xul", "_blank", "all,dialog=no", selectedURI, null, null, lineNumber, null);

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

function chromeToPath (aPath) {
   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
   var rv;

      var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
        rv = cr.convertChromeURL(uri).spec;

        if (/^file:/.test(rv))
          rv = this.urlToPath(rv);
        else
          rv = this.urlToPath("file://"+rv);

      return rv;
}

function urlToPath (aPath) {

    if (!aPath || !/^file:/.test(aPath))
      return ;
    var rv;
   var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Components.interfaces.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}
/*
stylePath='chrome://global/content/bindings/toolbar.xml#toolbarpaletteitem'
var fileurl = chromeToPath(stylePath);
fileurl=fileurl.substring(2,fileurl.indexOf('!'))
var file1 = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
file1.initWithPath(fileurl);
file1.reveal()
*/
makeReq=function(href){
	var req = new XMLHttpRequest;
	req.open("GET", href, false);
	try {
		req.send(null);
	} catch (e) {
	}
	return req.responseText;

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




ans=[]
function inspwin(w,level){
	var d=w.document
	ans.push(level+jn.inspect(shadia.toUp(d))+'->'+d.documentURI+'->'+d.title)
}
function iterateWindows(mWindow,level){
	for(var i=0;i<mWindow.frames.length;i++){
		var w=mWindow.frames[i]
		inspwin(w,level)
		if(w.frames.length>0)iterateWindows(w,level+1)
	}
}
winService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
var fWins=winService.getEnumerator('');
while(fWins.hasMoreElements()){
	inspwin(fWins.getNext(),1)
}

ans











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




/*
for(var i in elementList)
elementList[i]
elementList['window'].attributes
commonAttributes
commonEventsGroup.focus




createDOMWalker= function(aRoot){
    var walker = Cc["@mozilla.org/inspector/deep-tree-walker;1"].createInstance(Ci.inIDeepTreeWalker);
    walker.showAnonymousContent = true;
    walker.showSubDocuments = false;
    walker.init(domViewer.mDOMView.rootNode, domViewer.mDOMView.whatToShow);
    return walker;
}

var walkerTimeout
clearTimeout(walkerTimeout)
function doWalkerSearch(walker,test){
	var l,n=0,timerStart=Date.now()
	dump('-------------------')
	while(l=walker.currentNode){
		if(n>200){
		walkerTimeout=setTimeout(function(){doWalkerSearch(walker,walkerTest)},100)
			break
		}

		if(test(l))
		  break;

		walker.nextNode();n++
	}
	timerStart-Date.now()
}



walker=createDOMWalker()

function walkerTest(l){
	if(domNodeSummary(l).indexOf(text)!=-1){
		domViewer.setNode(l)
		return true
	}
}

text='fou'
walker.nextNode()
doWalkerSearch(walker,walkerTest)
walker.nextNode()




*/


/*domUtils.setContentState(mNode,STATE_ACTIVE)
domUtils.getContentState(mNode)*/
// See: http://mxr.mozilla.org/mozilla1.9.2/source/content/events/public/nsIEventStateManager.h#153

