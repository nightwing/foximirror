var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
//Cu.import('resource://xqjs/Services.jsm');
//Cu.import('resource://xqjs/Preferences.jsm');
var domUtils,winService,ww
initServices=function(){
	domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);
	winService = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	//ww = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	ios= Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService)
	sss= Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService)
	atomService=Cc["@mozilla.org/atom-service;1"].getService(Ci.nsIAtomService);
}
/***************************************************/
var initializeables=[]
function initialize(){
	initServices()
	leftPane=domViewer
	for each(var i in initializeables)
		i.initialize()
	if(!window.arguments){
		windowViewer.activate()
		windowViewer.setWindow()
	}else{
		var aNode=window.arguments[0]
		window.arguments=null
		inspect(aNode, 'current')
	}
	//hack to make two panes same size regardless their content -xxx
	a=document.getElementById('left-deck')
	a.nextSibling.nextSibling.width=a.width=2000
}
   //*\\  ******                     *******    //*\\
  //***\\                                      //***\\
 //*****\\******        *****      *********  //*****\\
var mWindow=null, mNode,
inspect=function(aNode, where){
	var aWindow=(aNode.ownerDocument||aNode).defaultView
	
	if(where=='parent'){
		var aWindow=domUtils.getParentForNode(aWindow.document,false)
		aWindow=aWindow&&aWindow.ownerDocument.defaultView
	}else if(where=='current'&& mWindow){//rt=domViewer.mDOMView.rootNode
		while(aWindow&&aWindow!==mWindow){
			aWindow=domUtils.getParentForNode(aWindow.document,false)
			aWindow=aWindow&&aWindow.ownerDocument.defaultView
		}
	}
	if(!aWindow)
		return
	
	if(aWindow!==mWindow){
		mWindow=aWindow
		domViewer.setWindow(aWindow,aNode)
		windowViewer.updateButton()
	}else
		domViewer.setNode(aNode)
	domViewer.tree.focus()
}
   //********************************************************************                  -------------------windowViewer
  //* viewer objects
 //****************************/
windowViewer={
	initialize: function(){
		this.tree=document.getElementById('window-tree')
		this.button=document.getElementById('windowViewerButton')
		/*this.popup.setAttribute('onpopupshowing','windowViewer.start()')
		this.popup.setAttribute('onpopuphiding','windowViewer.finish()')*/
		this.view=new multiLevelTreeView()
		//this.tree.onclick='windowViewer.startShadia()'
		//this.tree.onselect=init2()
		this.tree.setAttribute('onselect','windowViewer.setWindow()')
		this.tree.setAttribute('ondblclick','windowViewer.selectWindow()')

		this.tree.addEventListener('keypress',this,true)
	},
	fillWindowList: function(){
		function toUp(el){
			return domUtils.getParentForNode(el, true)||{};
		}
		var winTable=[],index=0,slf=this
		function inspwin(w,level){
			var d=w.document;
			var uri=sayHref(d.documentURI)
			var t=d.title.substring(0,40)
			t= t.length==0? uri : t+'->'+uri//.substring(0,50)+'...'+uri.slice(-10)

			if(w==mWindow)
				slf.curWinIndex=index
			winTable.push({
				level: level,
				text: t+ (level==0?'':' <'+domNodeSummary(toUp(d))),
				parent: toUp(d),
				frame: w,
				index: index++,
				cellProp: d instanceof HTMLDocument ?'blue':'ACCESSIBLE_NODE'
			})
		}
		function iterateInnerFrames(mWindow,level){
			inspwin(mWindow,level)
			var sortedFrames=[]
			for(var i=0;i<mWindow.frames.length;i++){
				sortedFrames.push(mWindow.frames[i])
			}
			sortedFrames.sort(function(a,b){
				var o=toUp(a.document).compareDocumentPosition(toUp(b.document));
				if((o|document.DOCUMENT_POSITION_FOLLOWING)==o)return -1
				if((o|document.DOCUMENT_POSITION_PRECEDING)==o)return 1
				return 0
			})
			for(var i=0;i<sortedFrames.length;i++){
				var innerFrame=sortedFrames[i]
				try{
					if(innerFrame.frames.length>0)
						iterateInnerFrames(innerFrame,level+1)
					else 
						inspwin(innerFrame,level+1)
				}catch(e){Components.utils.reportError(e);
				dump('--->why error in innerFrame.frames?',innerFrame.location)}//
			}
		}
		var fWins=winService.getEnumerator('');
		while(fWins.hasMoreElements()){
			iterateInnerFrames(fWins.getNext(),0)
		}
		this.view.childData=winTable
		this.view.visibleData=[]
		for(var i=0;i<winTable.length;i++){
			this.view.visibleData.push(winTable[i]);
		}

	},

	rebuild: function(){
		this.fillWindowList()
		this.tree.view=this.view
		this.tree.view.selection.select(this.curWinIndex)
	},
	activate: function(){
		this.rebuild()
		//winService.addListener(this)
		rightpane.setIndex(0)
		this.tree.focus()
		this.tree.parentNode.style.MozUserFocus='normal'
		this.tree.setAttribute('onblur',' if(document.activeElement!=windowViewer.tree)windowViewer.deactivate()')
		this.button.checked=!true
		this.active=true
	},
	deactivate: function(){
		//winService.removeListener(this)
		this.tree.view=null
		this.view.visibleData=this.view.childData=[]
		rightpane.setIndex(1)

		this.button.checked=!false
		this.active=false
	},
	setWindow:  function(useSameWin){
		var i=this.tree.currentIndex,data=this.view.visibleData, topIndex=i, topWindow
		useSameWin=true
		if(leftPane==domViewer&&useSameWin){
			topWindow=data[topIndex]
			while(topWindow&&topWindow.level>0&&topWindow.frame!=mWindow){
				topIndex=this.view.getParentIndex(topIndex)
				topWindow=data[topIndex]
			}
			if(topWindow.frame!=mWindow){
				topIndex=i
			}
		}	
		if(leftPane==domViewer){
			if(data[topIndex].frame!=mWindow){
				mWindow=data[topIndex].frame
				domViewer.setWindow(mWindow)
			}else{
				domViewer.setNode(data[i].frame.document.documentElement)
			}
		}else{
			mWindow=data[i].frame
			leftPane.setWindow(mWindow)
		}
		//notify viewers that window was changed
		if(leftPane!=domViewer)	domViewer.winMustChange=true
		if(leftPane!=stylesheetViewer)	stylesheetViewer.winMustChange=true
		//descripton of
		this.updateButton()
	},
	toggle: function(){
		if(this.active)this.deactivate()
		else this.activate()
	},

	handleEvent: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_ESCAPE:
			case KeyEvent.DOM_VK_RETURN:
				this.selectWindow()
				event.preventDefault();event.stopPropagation();
				break
		}
	},
	selectWindow: function(event){
		if(this.active)
				this.deactivate()
		if(leftPane.textbox)leftPane.textbox.focus()
		else leftPane.tree.focus()
	},

	updateButton: function(){
		var t=mWindow.document.title
		var uri=sayHrefEnd(mWindow.document.documentURI)
		
		if(!t) t=uri
		else if(t!=uri) t+=' '+uri
		this.button.label=t
	},

	//window service
	
	currentURI: function(){
		var i=this.tree.currentIndex
		if(i>=0)
			return this.view.visibleData[i].frame.location.href
	},
}
	initializeables.push(windowViewer)

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
		this.tree = document.getElementById("leftPane");
		this.tree.view=null
	},

	setWindow: function(aWindow,aNode){
		this.tree.view=null
		//this.contentWindow = aWindow;
		this.mDOMView.rootNode = aWindow.document;
		this.mDOMView.rebuild();
		if(!aNode){
			aNode=aWindow.document.documentElement
			if(aNode.firstChild)aNode=aNode.firstChild
		}
		this.winMustChange=false

		this.setNode(aNode)
	},
	setNode: function (aNode){
		this.active||this.activate(true)
frt=aNode
		if(!aNode){
			this.tree.view.selection.select(null);
			return false;
		}
		// Keep searching until a pre-created ancestor is found, then
		// open each ancestor until the found element is created.
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
		// make sure copy tree is in right state
		var origRow=this.tree.treeBoxObject.getFirstVisibleRow()
		var selIndex=this.tree.currentIndex
		this.hiddenTree.treeBoxObject.scrollToRow(origRow)
		this.hiddenTree.view.selection.select(selIndex)

		// We have all the ancestors, now open them one-by-one from the top to bottom.
		var lastIndex=-1, lineLength=line.length-1, failI=lineLength+1, view = this.hiddenTree.treeBoxObject.view;
		for(var i=lineLength; i>=0; --i){
			index=this.mDOMView.getRowIndexFromNode(line[i]);
			if(index<0){// Can't find the row
				if(i>=failI) break//stop trying if nothing helped once
				if(i==lineLength){//document is wrong					
					this.mDOMView.rootNode=line[i]
					this.mDOMView.rebuild()
				}else if(view.isContainerOpen(lastIndex)){//node is wrong
					view.toggleOpenState(lastIndex);
					view.toggleOpenState(lastIndex);
				}
				failI=i;i++;
			}else if(i>0&&!view.isContainerOpen(index)){
				view.toggleOpenState(index);
				failI=i;
			}
			if(index >= 0)lastIndex=index;
		}
		if(lastIndex >= 0){
			view.selection.select(lastIndex)
			new copyView(this.hiddenTree,this.tree)
			this.tree.treeBoxObject.ensureRowIsVisible(lastIndex)
			return true;
		}
		new copyView(this.hiddenTree,this.tree)

		return false;
	},


	setCopyTree: function(){
		new copyView(this.hiddenTree,this.tree)
	},
	destroy: function(){
		this.hiddenTree.treeBoxObject.view = null;
		this.tree.treeBoxObject.view = null;
		this.tree.view=null
	},

	closeAllButCurrent:function(){
		this.tree.view=null
		this.mDOMView.rebuild()
		this.setNode.mNode()
	},
	changeWhatToShow:function(data){
		domViewer.mDOMView.showWhitespaceNodes=false
		this.tree.view=null
		this.mDOMView.rebuild()
		this.setNode.mNode()
	},
	currentNode:function(){
		var i=this.tree.currentIndex
		if(i>=0)
			return this.mDOMView.getNodeFromRowIndex(i);
	},

	currentURI:function(){
		switch(mNode.nodeType){
			case 1:
				if(mNode.hasAttribute('src'))
					return mNode.getAttribute('src')
			//case 2 ATTRIBUTE_NODE
			//case 3://TEXT_NODE
			//case 4://CDATA_SECTION_NODE: 4
			//case 8://COMMENT_NODE: 8
				break
			case 7://PROCESSING_INSTRUCTION_NODE
				if(mNode.sheet)
					return mNode.sheet.href
				else
					return (/.*href="?([^"]*)/).exec(mNode.data)[1]
				break
			case 9://DOCUMENT_NODE
				return mNode.documentURI
				break
			default:
		}

	},

	activate: function(dontSetTree){//
		leftPane.deactivate()
		this.tree.columns[1].element.hidden=true
		leftPane=this
		this.active=true
		if(this.winMustChange){
			this.setWindow(mWindow)
			return
		}else
			dontSetTree||this.setCopyTree()
	},
	deactivate: function(){
		var origRow=this.tree.treeBoxObject.getFirstVisibleRow()
		var selIndex=this.tree.currentIndex
		this.hiddenTree.treeBoxObject.scrollToRow(origRow)
		this.hiddenTree.view.selection.select(selIndex)

		this.active=false
	}
};
	initializeables.push(domViewer)
domSearch={
	initialize: function(){
		this.findbar = document.getElementById('leftPane-search');
		this.textbox = this.findbar.getElementsByTagName('textbox')[0];


		this.tree=domViewer.tree
	},
	onIninput: function(xpath){
		if(xpath==this.activeQuery)
			return
		this.activeQuery=xpath
		xpath=this.parseXPATH2(xpath)
		this.activeXPath=xpath
		if(!xpath){
			if(this.activeNodeList){
				domViewer.setNode(mNode)
			}
			return
		}		
/*function iterateWindows(mWindow,level){
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
	var result=slf.searchDocument(xpath, d.documentElement)
	slf.activeNodeList.push(d)
	for(var i = 0; i < result.snapshotLength; i++){
			slf.activeNodeList.push( result.snapshotItem(i));
	}
}
this.activeNodeList= [];
iterateWindows(mWindow,0)
this.textbox.matchCount
//this.nodeCount.value=this.activeNodeList.length
this.activate2()
return
/**	*/
		var result=this.searchDocument(xpath, mNode), ii=result.snapshotLength
		this.textbox.matchCount=ii
		this.activeNodeList= [];
		
		if(ii==0){// TODO strange bug when setting empty tree
			domViewer.setNode(mNode)
			return	
		}
		
		for(var i = 0; i < ii; i++){
			this.activeNodeList[i] = result.snapshotItem(i);
		}
		this.activate()
	},
	handleEvent: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_UP:
				if(event.ctrlKey)this.tree.changeOpenState(this.tree.currentIndex)
				else this.moveTreeSelection(-1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				if(event.ctrlKey)this.tree.changeOpenState(this.tree.currentIndex)
				else this.moveTreeSelection(1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_RETURN:
			ert=event
				if(event.ctrlKey){
					domViewer.setNode(mNode)
					this.tree.focus()
					event.preventDefault();event.stopPropagation();
					break
				}
				if(this.active)
					this.selectNode()
				else{
					this.onIninput(this.lastXpath)
					this.tree.view.selection.select(this.index)
					this.tree.treeBoxObject.scrollToRow(this.topRow)
				}
				event.preventDefault();event.stopPropagation();
				break
		}
	},
	activate: function(){
		if(!this.active){
			leftPane.deactivate()
			leftPane=this
			this.active=true
			this.tree.setAttribute('ondblclick',"domSearch.textbox.value='';domSearch.selectNode()")
		}
		var tr=this.tree.treeBoxObject.getFirstVisibleRow()
		var si=this.tree.currentIndex
		this.tree.view=new plainOneColumnView(this.activeNodeList)
		var i0=this.activeNodeList.indexOf(mNode)
		if(i0>=0){
			this.tree.treeBoxObject.scrollToRow(i0-(si-tr))
			this.tree.view.selection.select(i0)
		}
			
	},
	restoreTreeState:function(){
		i0=
		i1=domSearch.tree.treeBoxObject.getFirstVisibleRow()
		i0-i1
	},
	deactivate: function(){
		this.activeNodeList=false
		this.lastXpath=this.activeQuery
		this.activeQuery=''

		this.tree.removeAttribute('ondblclick')

		this.active=false
	},
	selectNode: function(){
		this.index=this.tree.currentIndex
		this.topRow=this.tree.treeBoxObject.getFirstVisibleRow()

		domViewer.setNode(mNode)
	},

	currentNode:function(){return this.activeNodeList[this.tree.currentIndex]||mNode},
	setWindow: function(win){
		mWindow=win
		mNode=mWindow.document.documentElement
		var xp=this.activeQuery
		this.activeQuery=''
		this.onIninput(xp)
	},

	parseXPATH2:function(str){
		var next=str.charAt(0)
		if(next=='/')
			return this.isValidXpath(str)
		
		str=str.toLowerCase()
		var i=0,i0=0,next=str.charAt(i++)//i is one char farther than next so that [# .] are skipped
		
		var rx=/[\w$\-:]/
		function skipWhitespace(){
			while((next=str.charAt(i))==' ')i++;
		}
		function skipWord(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		function parseAttrs(){i0=i;var  pendingAttr='';
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
					while((next=str.charAt(i))&&next==' ')i++;//skipWhitespace()
					i0=i;while((next=str.charAt(i))&&next!=' ')i++;//skipWord()
					(i>i0||pendingAttr)&&attrs.push([pendingAttr,str.substring(i0,i)]);
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

		var name=false,id=false,classes=[],attrs=[],mode=' and '
		function parseSegment(){
			name=false,id=false,classes=[],attrs=[],mode=' and '
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
				}else if(next=='@'){
					skipWord()
					var pendingAttr=str.substring(i0,i),attrVal=''
					skipWhitespace()				
					if(next=='='){next=str.charAt(i++);
						skipWhitespace()
						skipWord();
						attrVal=str.substring(i0,i)
					}
					if(pendingAttr||attrVal)attrs.push([pendingAttr,attrVal]);
				}else if(next=='/'||next=='>'){
					next='/'
					var peek=str.charAt(i+1)
					if(peek=='/'||peek=='>'){
						i++
						next='//'
					}
					break
				}
				next=str.charAt(i++)
			}
		}
		// xpath construction utils
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
		//
		function getPathSegment(){
			var segment=[]
			if(name){
				var t=containsXPFrag(name,'name()')				
				if(id===false && !classes.length && !attrs.length)
					t='('+t+' or '+containsXPFrag(name,'@id')+')'
				segment.push(t)
			}
			if(id)
				segment.push(containsXPFrag(id,'@id'))
			if(classes.length)
				classes.forEach(function(val){segment.push(val?containsXPFrag(val,'@class'):'@class')} )
			if(attrs.length){
				attrs.forEach(function(val){
						var attrpath=[]
						if(val[0]){attrpath.push( containsXPFrag(val[0],'name()') )}
						if(val[1]){attrpath.push( containsXPFrag(val[1],'.') )}
						segment.push("@*["+attrpath.join(' and ')+']')
					})
			}
			if(!segment.length)
				return ""
			return '['+segment.join(mode)+']'
		}
		var ansPath=['//*']
		while(next){
			parseSegment()
			ansPath.push(getPathSegment())
			if(next=='/'){
				ansPath.push('/*')
				next=str.charAt(i++)
			}else if(next=='//'){
				ansPath.push('//*')
				next=str.charAt(i++)
			}
		}		
		if(ansPath.length<2)
			return null
		return ansPath.join('')
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
	},
	moveTreeSelection: function(direction){
		var tree=this.tree,view=tree.view,c=view.selection.currentIndex
		c+=direction
		if(c>=view.rowCount)	c=-1
		if(c<-1)				c=view.rowCount-1
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c)
	},
	currentURI: domViewer.currentURI
};
	initializeables.push(domSearch)
stylesheetViewer={
	initialize: function(){
		this.tree=document.getElementById('leftPane')
		this.view=new multiLevelTreeView()
	},
	fillList: function(finalCallback){
		if(userAgentStyles)
			this.fillListSafe(finalCallback)
		else
			collectAgentSheets(function(){stylesheetViewer.fillListSafe(finalCallback)})
	},
	fillListSafe: function(finalCallback){
		function collectStylesheets(stylesheet,d){
			var cssRules=stylesheet.cssRules,count=cssRules.length
			allCSSSheets.push(stylesheet)
			var uri=stylesheet.href||stylesheet.ownerNode.ownerDocument.documentURI
			uri=sayHref(uri)
			winTable.push({	level: d, frame: stylesheet, count:count, index: index++
							, text: uri })
			for(var j = 0; j < count; j++){
				var rule = cssRules[j];
				if(rule.styleSheet)
					collectStylesheets(rule.styleSheet,d+1)
			}
		}
		var st=[], std=mWindow.document.styleSheets, winTable=[],index=0

		allCSSSheets=[]
		winTable.push({	level: 0, frame: {}, count:std.length, index: index++, text: 'document.styleSheets',rowProp: "head",deco:true })
		for(var j = 0; j < std.length; j++)
			collectStylesheets(std[j],1)

		winTable.push({	level: 0, frame: {}, count:userAgentStyles.length, index: index++, text: 'userAgentStyles',rowProp: "head",deco:true })
		for(var j = 0; j < userAgentStyles.length; j++)
			collectStylesheets(userAgentStyles[j],1)


		this.winMustChange=false
		if(finalCallback)finalCallback(winTable)
		else stylesheetViewer.setView(winTable)
	},
	isStylesheetListReady:function(){
		if(!userAgentStyles)
			collectAgentSheets(callback)
	},
	setView: function(winTable){
		var view=this.view
		view.childData=winTable
		view.visibleData=[]
		var vd=view.visibleData
		for(var i=0;i<winTable.length;i++){
			vd.push(winTable[i]);
		}
		this.tree.view=view
	},
	activate: function(){
		leftPane.deactivate()
		this.fillList()

		if(this.state){
			this.tree.treeBoxObject.scrollToRow(this.state.row)
			this.tree.view.selection.select(this.state.sel)
		}
		this.selectObjectInTree()

		this.tree.columns[1].element.hidden=false
		leftPane=this
		this.active=true
	},
	deactivate: function(){
		this.state={row:this.tree.treeBoxObject.getFirstVisibleRow(),sel:selIndex=this.tree.currentIndex}

		this.tree.view=null
		this.view.visibleData=this.view.childData=[]
		this.active=false
	},
	setWindow:  function(){
		mNode=mWindow.document.documentElement
		this.fillList()
		this.winMustChange=false
	},

	currentNode: function(){
		var i=this.tree.currentIndex
		return this.view.visibleData[i].frame//viewDoc.body.innerHTML=sayCSS()
	},
	selectObjectInTree: function(){
		var i=this.tree.currentIndex,l=this.view.visibleData.length
		if(i>=l||i<0)i=0

		var r=this.view.visibleData[i]
		if(!r){viewDoc.body.innerHTML=""}
		else if(r.deco){viewDoc.body.innerHTML=r.text}
		else if(r&&(r=r.frame)&&r.cssRules){
			mStylesheet=r
			viewDoc.body.innerHTML=sayCSS(r.cssRules)
			mNode=r
		}
	},
	//actions
	actions:{viewSource:'viewSource',copyURI:'copyURI'},

	currentURI:function(){return mNode.href||mNode.ownerNode.ownerDocument.documentURI},
	currentLine:function(){try{return domUtils.getRuleLine(mNode.cssRules[0])}catch(e){return 0}},
	//
	winMustChange:true
}
	initializeables.push(stylesheetViewer)
chromeRegistryViewer={
	initialize: function(){
		this.tree=document.getElementById('leftPane')
		this.view=new multiLevelTreeView()
	},
	fillList: function(){
		var aPath=mWindow.document.documentURI

		var rv;
		var uri = ios.newURI(aPath, "UTF-8", null);
		var cr = Cc['@mozilla.org/chrome/chrome-registry;1'].getService(Ci.nsIXULOverlayProvider);

		rv = cr.getXULOverlays(uri)
		this.overlayList=[]
		while(rv.hasMoreElements()){
			this.overlayList.push(rv.getNext().QueryInterface(Ci.nsIURL).spec)
		}
		this.overlayList.sort()

		rv = cr.getStyleOverlays(uri)
		this.styleList=[]
		while(rv.hasMoreElements()){
			this.styleList.push(rv.getNext().QueryInterface(Ci.nsIURL).spec)
		}
		this.styleList.sort()

		var index=0,winTable=[]
		winTable.push({	level: 0, index: index++, count: this.overlayList.length, text:'overlays added by manifests' ,rowProp: "head",deco:true })
		for(var j = 0; j < this.overlayList.length; j++)
			winTable.push({	level: 1, index: index++, text: this.overlayList[j]})

		winTable.push({	level: 0, index: index++, count: this.styleList.length, text: 'styles added by manifests' ,rowProp: "head",deco:true })
		for(var j = 0; j < this.styleList.length; j++)
			winTable.push({	level: 1, index: index++, text: this.styleList[j]})

		var ch=mWindow.document.childNodes
		var sti=winTable.push({	level: 0, index: index++, text: 'overlays in document',rowProp: "head",deco:true })
		for(var j = 0; j < ch.length; j++)
			if(ch[j].nodeName=='xul-overlay')
				winTable.push({	level: 1, index: index++, text: /.*href="?([^"]*)/.exec(ch[j].data)[1]})
		winTable[sti-1].count=(index-sti)

		var view=this.view
		view.childData=winTable
		view.visibleData=[]
		var vd=view.visibleData
		for(var i=0,il=winTable.length;i<il;i++){
			var sti=winTable[i]
			sti.text=sayHref(sti.text)
			vd.push(sti);
		}
		this.tree.view=view
	},
	activate: function(){
		leftPane.deactivate()
		this.fillList()

		if(this.state){
			this.tree.treeBoxObject.scrollToRow(this.state.row)
			this.tree.view.selection.select(this.state.sel)
		}
		this.selectObjectInTree()
		this.tree.columns[1].element.hidden=false
		leftPane=this
		this.active=true
	},
	deactivate: function(){
		this.state={row:this.tree.treeBoxObject.getFirstVisibleRow(),sel:selIndex=this.tree.currentIndex}

		this.tree.view=null
		this.view.visibleData=this.view.childData=[]
		this.active=false
	},
	setWindow: function(){
		mNode=mWindow.document.documentElement
		this.fillList()
	},

	currentNode: function(){
		var i=this.tree.currentIndex
		return this.view.visibleData[i]//viewDoc.body.innerHTML=sayCSS()
	},
	selectObjectInTree: function(){
		var i=this.tree.currentIndex,l=this.view.visibleData.length
		if(i>=l||i<0)i=0
		var r=this.view.visibleData[i]
		if(!r) return
		if(r.deco){
			viewDoc.body.innerHTML=r.text
		}else{
			mURI=r.text
			viewDoc.body.innerHTML=''
			var d=viewDoc.createElement('pre')
			d.textContent=makeReq(mURI)
			viewDoc.body.appendChild(d)
		}
	},
	//actions
	actions:{viewSource:'viewSource',copyURI:'copyURI'},
	viewSource:function(){
		var line=0
		try{line=domUtils.getRuleLine(mNode.cssRules[0])}catch(e){}
		viewFileURI(mNode.href||mNode.ownerNode.ownerDocument.documentURI, line)},
	currentURI:function(){
		var r=this.currentNode()
		return r.deco?'':r.text
	},

}
	initializeables.push(chromeRegistryViewer)


   //**********************
  //* 
 //******/
var leftPane
leftPaneSearch={
	initialize: function(){
		this.findbar = document.getElementById('leftPane-search');
		this.textbox = this.findbar.getElementsByTagName('textbox')[0];
		this.textbox.setAttribute('oninput','leftPaneSearch.onIninput(this.value)')
		this.textbox.setAttribute('oncommand','leftPaneSearch.onIninput(this.value)')
		this.textbox.setAttribute('onfocus',SEARCH_ON_FOCUS+'leftPaneSearch.onIninput(this.value)')

		this.textbox.addEventListener('keypress',this,true)
		this.tree=domViewer.tree
	},
	onIninput: function(xpath){
		if(leftPane==domViewer||leftPane==domSearch)
			domSearch.onIninput(xpath)
		else
			setTreeFilter(leftPane.view,leftPane.tree,xpath)
	},
	handleEvent: function(event){
		if(leftPane==domViewer||leftPane==domSearch)
			domSearch.handleEvent(event)
		else switch(event.keyCode){
			case KeyEvent.DOM_VK_UP:
				this.moveTreeSelection(-1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				this.moveTreeSelection(1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_RETURN:
			ert=event
				if(event.ctrlKey){
					this.tree.changeOpenState(this.tree.currentIndex)
					event.preventDefault();event.stopPropagation();
					break
				}

				this.onIninput(this.lastXpath)
				this.tree.view.selection.select(this.index)
				this.tree.treeBoxObject.scrollToRow(this.topRow)

				event.preventDefault();event.stopPropagation();
				break
		}
	},
	moveTreeSelection: domSearch.moveTreeSelection
}
	initializeables.push(leftPaneSearch)
var rightpane={
	initialize:function(){
		this.decku=document.getElementById('right-deck')
		this.i=2
	},
	setIndex:function(i){
		if(i>0)i++
		if(i==this.i)return
		var ch=this.decku.children
		ch[i].collapsed=false
		ch[this.i].collapsed=true
		dump(i,this.i)
		this.i=i
	}

}
	initializeables.unshift(rightpane)

   //******************************************************************************
  //**  domViewer utils  **/
 //*****/
domNodeSummary= function(el){
	var name=''
	//typeof el==='object'
	if(el.nodeType==7){
		name+=el.target+' ->'+el.data
	}else if(el.nodeType==9){
		name+=el.nodeName+': '+el.title +'->'
		name+=sayHref(el.documentURI)
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
/**/
domLighter={
	toggle:function(act){
		if(typeof act=='undefined')act=this.active
		if(act)
			domViewer.tree.removeEventListener('mousemove',this,false)
		else
			domViewer.tree.addEventListener('mousemove',this,false)
		this.active=!act
	},
	handleEvent:function(event){
		var tbo = domViewer.tree.treeBoxObject;
		var row = { }, col = { }, child = { };
		tbo.getCellAt(event.clientX, event.clientY, row, col, child);
		var i=row.value;
		if(i<0) return
		var node=domViewer.mDOMView.getNodeFromRowIndex(i)
		if(mWindow.shadia)
			mWindow.shadia.lightParents(node)
		else
			shadowInspector.injectShadia(mWindow)
	}
}

   //**********************************************
  //* dom search and xpath
 //*/
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

  /***************************************/
 /**-----------tree views--------------**/
/***************************************/
function copyView(tree2,copyTree){
	var origView=tree2.view
	this.rowCount = origView.rowCount;
	this.getCellText = function(row, col){
		let na=domViewer.mDOMView.getNodeFromRowIndex(row);
		na=domNodeSummary(na)
		return na;
	};
	this.getCellValue = function(row, col){return '1';};
	this.setTree = function(treebox){this.treebox = treebox};
	this.isEditable = function(row, col){return false;};

	this.toggleOpenState= function(row){
		//save state
		var origRow=copyTree.treeBoxObject.getFirstVisibleRow()
		var selIndex=copyTree.currentIndex
		tree2.treeBoxObject.scrollToRow(origRow)
		origView.selection.select(selIndex)
		//
		origView.toggleOpenState(row)
		new copyView(tree2,copyTree)
	};
	//var checkRebuild=function(i){if(origView.rowCount!=copyTree.view.rowCount) rebuild(i)}
	var rebuild=function(i){
		dump(1,'rebuuild------',origView.rowCount,copyTree.view.rowCount,i)
		var origRow=copyTree.treeBoxObject.getFirstVisibleRow()
		var selIndex=copyTree.currentIndex
		tree2.treeBoxObject.scrollToRow(origRow)
		origView.selection.select(selIndex)

		new copyView(tree2,copyTree)
		//if(selIndex>=origView.rowCount)selIndex=origView.rowCount-1
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

	copyTree.view=this
		dump('copyTree.view=this',copyTree.view,this	)
	copyTree.treeBoxObject.scrollToRow(tree2.treeBoxObject.getFirstVisibleRow())
	copyTree.view.selection.select(tree2.currentIndex)
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
		if(l!=0) l--
		var i=row-1;
		while(i>=0&&(item=this.visibleData[i])&&item.level!=l){
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
dump('selectObjectInTree',immediate)
	if(!immediate){
		if(selectObjectInTreeTimeOuts[treeID]){
			clearTimeout(selectObjectInTreeTimeOuts[treeID])
		}
		selectObjectInTreeTimeOuts[treeID]=setTimeout(function(){selectObjectInTree(treeID,true)},10)
		return
	}
	//window[treeID].onSelect()
	if(leftPane.selectObjectInTree){
		leftPane.selectObjectInTree()
		return
	}
	mNode=leftPane.currentNode()
	//subViewer.setNode
	insertAddrs(mNode)
}
   //**************************
  //* browser viewer objects
 //******/
insertAddrs=function(mNode){dump(mNode.nodeType,'----------************')
	var body=viewDoc.createElement(body)
	if(!mNode){
		body.textContent='error mNode is undefined'
	}
	var mode=slateViewer.mode
	if(mode=='domedit')
		attributeViewer.onDomviewerSelChanged()
	switch(mNode.nodeType){
		case 1:			
			if(!mode)
				body.innerHTML=[
					sayAttrs(mNode),
					sayParents(mNode),
					sayInlineCSS(mNode),
					sayCSS(rulesForNode(mNode)),
					computedStyleViwer.compCSS(mNode)
				   ].join('<div class="sectEnd"></div>');
			else if(mode=='xbl')
				body.innerHTML=sayXBL(mNode)
			else if(mode=='css')
				body.innerHTML=sayParentCSS(mNode)
			else if(mode=='attrs')
				body.innerHTML=sayAttrs(mNode)
			
			break//ELEMENT_NODE
		//case 2 ATTRIBUTE_NODE
		case 3://TEXT_NODE
		case 4://CDATA_SECTION_NODE: 4
		case 8://COMMENT_NODE: 8
			body.innerHTML='<div>'+mNode.nodeName+'</div>'+'<pre>'+mNode.nodeValue+'</pre>'
			break
		case 7://PROCESSING_INSTRUCTION_NODE
			if(mNode.sheet){
				body.innerHTML=[sayAttrs(mNode),sayParents(mNode),sayCSS(mNode.sheet.cssRules)].join('')
			}else{
				body.innerHTML=[sayAttrs(mNode),sayParents(mNode)].join('')
				dump(/.*href="?([^"]*)/.exec(mNode.data)[1],(/.*href="?([^"]*)/).exec(mNode.data)[1])
				var d=viewDoc.createElement('pre')
				d.textContent=makeReq(/.*href="?([^"]*)/.exec(mNode.data)[1])
				body.appendChild(d)
			}
			break
		case 9://DOCUMENT_NODE
			body.innerHTML=sayDocument(mNode);
			break
		case 10://DOCUMENT_TYPE_NODE
			var name=mNode.nodeName
			if(name=='HTML'&&mNode.publicId){
				name='<!DOCTYPE HTML PUBLIC "'+mNode.publicId+'">'				
			}else
				name=mNode.nodeName+' doctype '+mNode.publicId
			body.textContent=name
			break
		default:
			body.textContent=domNodeSummary(mNode)
				//ENTITY_REFERENCE_NODE:
				//ENTITY_NODE::
				//DOCUMENT_FRAGMENT_NODE: 11  number
				//NOTATION_NODE: 12  number
	}
	viewDoc.body.replaceChild(body,viewDoc.body.firstChild)
}
/**-----------//////**************************/
function sayDocument(doc){
		var ans=['<span class="selector">'+mNode.nodeName+'</span>'],uri

		ans.push('<span class="name">title</span>= <span class="val">'+doc.title+'</span>')
		var uri=sayHref(doc.documentURI)
		
		ans.push('<span class="name">uri</span>= <span class="val">'+uri+'</span>')

		return '<div>'+ans.join('</div><div class="prop">')+'</div>'
	return
}
function sayAttrs(mNode){
	var ans=['<sp1><sp>edit</sp></sp1> <span class="selector">'+mNode.nodeName+'</span>']
	if(mNode.attributes){
		for(var i=0;i<mNode.attributes.length;i++){
			var attr=mNode.attributes[i]
			var attName=attr.name
			if(attName=='shadia-lighted')continue
			ans.push('<span class="name">'+attName+"</span>='<span class='val'>"+attr.value+"</span>'")
		}
		if(mNode.textContent){
			var t=mNode.textContent.length
			//t=t.length//>80?t.substring(0,80)+'~'+t.length:t
			ans.push('<span class="name">textContent.length</span>= <span class="sval">'+t+'</span>')
		}
	}else
		ans.push('<span class="name">text</span>= <span class="val">'+mNode.nodeValue+'</span>')

	ans.push('<span class="moreinfo">xmlns= '+mNode.namespaceURI)
	return '<div id="attributes-slate"><div>'+ans.join('</div><div class="prop">')+'</div></div>'
}
function saveAttrs(mNode,text){
	var attrs=text.split('\n')
	for(var i=1;i<attrs.length-2;i++){
		mNode.setAttribute.apply(mNode,attrs[i].split(/= */))
	}
}
/***/                                               /***/
 /*             xul mirror proto                      */
 /*****************************************************/
attributeViewer={
	setNode: function(mNode){
		//viewDoc.body.innerHTML=sayAttrs(mNode)
	},
	startEdit: function(mNode){
		rightpane.setIndex(2)
		slateViewer.mode='domedit'
		var si=slateViewer.tabs.selectedItem
		si&&(si._selected==false)
		
		var h
		/*if(mNode.innerHTML){
			h=mNode.innerHTML
		}else{}*/
		h=new XMLSerializer().serializeToString(mNode)
		
		if(mNode.nodeType==1){
			h=XML(h).toXMLString()		
			if(mNode.hasAttribute&&!(mNode.hasAttribute('xmlns')))h=h.replace(/ xmlns="[^"]*"/,'')
		}
		h=h+(new Array(10)).join('\n')
		dump(h)
		this.origHTML=h
		this.editbox=document.getElementById('editbox')
		this.editbox.value=h
		//this.editbox.onchange="attributeViewer.saveEdit()"
		this.editbox.setAttribute("oninput","attributeViewer.saveEdit2()")
		this.status=document.getElementById('editboxsave').style
		this.status.color=''
		
		this.node1=mNode
		this.node2=mNode
		this.parent=mNode.parentNode
		
		
		var doc = this.node1.ownerDocument;
		this.range = doc.createRange();
		this.range.setStartBefore(this.node1)
		this.range.setEndAfter(this.node2)		
	},	
	onDomviewerSelChanged:function(){dump(mNode,mNode.parentNode)

		if(!mNode.parentNode)return
		//if(mNode.parentNode==this.parent&&this.range.comparePoint(mNode,1)==0)return
		if(!this.editbox.hasAttribute('focused'))this.startEdit(mNode)
		
	},
	toggleWrap:function(){	
		let codebox=this.editbox
		let wr=(codebox.hasAttribute('wrap')&&(codebox.getAttribute('wrap')=='off'))?'on':'off'	
		codebox.setAttribute('wrap',wr)	
		codebox.editor.QueryInterface(Ci.nsIPlaintextEditor).wrapWidth= wr=='off'?-1:1
	},
	saveEdit2: function(){
		this.status.color='#d528ff'
		var html=document.getElementById('editbox').value.trim()
		var [first, last]=[this.node1,this.node2]
		this.node1&&this.range.setStartBefore(this.node1)
		this.node2&&this.range.setEndAfter(this.node2)
		try{
			var fragment = this.range.createContextualFragment(html);
			var first = fragment.firstChild;
			var last = fragment.lastChild;
			//element.parentNode.replaceChild(fragment, element);
			this.range.deleteContents()
			this.range.insertNode(fragment)  
			this.status.color='green'
		}catch(e){}
		this.node1=first,this.node2=last
		this.node1&&this.range.setStartBefore(this.node1)
		this.node2&&this.range.setEndAfter(this.node2)
		domViewer.tree.treeBoxObject.invalidate()
		return [first, last];
	},
	saveEdit: function(){
		rightpane.setIndex(1)	
		slateViewer.mode=""


		this.saveEdit2()
		this.range.detach()
		this.range=null
	}
}

setOuterHTML=function(nodes, html){
	if(nodes[0]&&nodes[1]){
		var [first, last]=nodes
		var doc = first.ownerDocument;
		var range = doc.createRange();
		range.setStartBefore(first)
		range.setEndAfter(last)
	}else{
		var element=nodes
		var [first, last]=[element,element]
		var doc = element.ownerDocument;
		var range = doc.createRange();
		range.selectNode(element || doc.documentElement);
	}
    try{
        var fragment = range.createContextualFragment(html);
        var first = fragment.firstChild;
        var last = fragment.lastChild;
        //element.parentNode.replaceChild(fragment, element);
		range.deleteContents()
		range.insertNode(fragment)        
    }catch(e){}
	return [first, last];
};
setInnerHTML=function(element, html){
    var doc = element.ownerDocument;
    var range = doc.createRange();
    range.selectNode(element || doc.documentElement);
    try{
        var fragment = range.createContextualFragment(html);
        var first = fragment.firstChild;
        var last = fragment.lastChild;
        element.parentNode.replaceChild(fragment, element);
        return [first, last];
    }catch(e){return [element,element]}
};
/*h=new XMLSerializer().serializeToString(document)

XML(h).toXMLString()*/

/*******************/
/**-----------//////**************************/
function cssSelector(el){
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
function sayParents(mNode){
	var parent=mNode
	var ans=[]
	while(parent){//&&parent.nodeType==1
		ans.unshift(cssSelector(parent))
		//dump(parent)
		parent=parent.parentNode
	}
	ans.shift()//\u25c4
	return '<div id="parents-slate" class="parents"><a11> > </a11><a>'+ans.join('</a><a11> > </a11><a>')+'</a></div>'
}

/**-----------//////**************************/
function sayXBL(mNode){
	var parent=mNode
	var ans=[]
	while(parent){//&&parent.nodeType==1
		ans.push('<div class="name">'+cssSelector(parent)+'</div>')
		try{
			var xbl=domUtils.getBindingURLs(parent)
		}catch(e){var xbl=[]}
		if(xbl.length==0)
			ans.push('<div class="val">-------</div>')
		else for(var i=0;i<xbl.length;i++)
				ans.push('<div class="val link">'+xbl.queryElementAt(i, Ci.nsIURI).spec+'</div>')
		parent=parent.parentNode
	}
	return '<div id="XBL-slate">'+
		"<div class='parents' closer='true'><a11> \u25e2 </a11><a>bindings</a></div>"+
		'<div class="prop">'+ans.join('')+'</div></div>'+sayEvents(mNode)
}

function sayEvents(mNode){
	eventListenerService=Cc["@mozilla.org/eventlistenerservice;1"].getService(Ci.nsIEventListenerService);
	var parent=mNode
	var ans=[]
	function sayEventsInner(parent){
		var subans=[]
		try{
			var events=eventListenerService.getListenerInfoFor(parent,{})
		}catch(e){var events=[]}
		for each(var i in events){
			var s=i.toSource()
			if(s)
				subans.push('<d class=selector >'+i.type+'</d>\t<d class=dr >'+(i.capturing?'capturing':'')+'</d><pre>'+s+'</pre>')
			else subans.push('<d class=selector >'+i.type+'</d>\t<d class=dr >'+(i.capturing?'capturing':'')+'</d><br>')
		}		
		if(subans.length==0)
			ans.push('<div class="val">-------</div>')
		else ans.push(subans.join(','))	
	}
	while(parent){//&&parent.nodeType==1
		ans.push('<div class="name">'+cssSelector(parent)+'</div>')
		sayEventsInner(parent)
		parent=parent.parentNode
	}
	ans.push('<div class="name">window</div>')
	sayEventsInner(mNode.ownerDocument.defaultView)
	
	ans[0]="<div class='end'>"+ans[0]+ans[1]+"</div>";ans[1]=''
	return '<div id="event-slate">'+
		"<div class='parents' closer='true'><a11> \u25e2 </a11><a>events</a></div>"+
		'<div class="prop">'+ans.join('')+'</div></div>'
}

function sayHrefEnd(href){
		/*if(uri.substring(0,5)=='data:')
			uri=uri.substring(0,uri.indexOf(','))
		else {
			var l=uri.lastIndexOf('/')
			if(l!=-1)
				uri=uri.substr(l)
		}
		try{uri=decodeURIComponent(uri)}catch(e){}*/
	href=sayHref(href)	
	var l=href.lastIndexOf('/')
	if(l==-1)l=0
	return cropString( href.length>50?href:href.substr(l) )
}
function sayHref(href){
	if(href.substring(0,5)=='data:')
		return href.substring(0,href.indexOf(','))
	try{href=decodeURIComponent(href)}catch(e){}
	return href
}
cropString = function(text, limit){
    // Make sure it's a string.
    text = text + "";

    // Use default limit if necessary.
    if (!limit)
        limit = 55;  
    if (text.length > limit){
		var halfLimit = (limit / 2)-1;
		return text.substr(0, halfLimit) + '\u22EF' + text.substr(text.length-halfLimit);
	}  
    return text;
}
/**-----------//////**************************/
function sayInlineCSS(mNode){
	stateButtons='<sp1><sp>hover</sp><sp>focus</sp><sp>active</sp></sp1>'
	if(mNode.style&&mNode.style.cssText){
		var t="<div id='InlineCSS-slate'><div><span class='selector'>"+'element.style</span>{</div>'
			 +breakRule2(mNode.style.cssText)+'</div><div class="end">}'+stateButtons+'</div></div>'
		return t
	}else{
		var t="<div id='InlineCSS-slate' class='gray'><span class='selector'>element.style</span><span>{}</span>"+stateButtons+"</div>"
		return t
	}
}
function rulesForNode(mNode){
	var inspectedRules=domUtils.getCSSStyleRules(mNode)
	if(!inspectedRules)
		return []
	var rules=[]
	for(var i = inspectedRules.Count()-1; i >=0 ; --i){
		rules.push(inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule));
	}
	return rules
}
function sayCSS(rules,maxn,isSecondary){var t=Date.now()
	if(!isSecondary)
		currentRules=rules

	var ans=[], usedrules=[]
	var rule, n=rules.length
	if(!maxn)
		maxn=n>100?100:n
	else if(maxn>n)maxn=n
	for(var i=0; i<maxn; i++){
		var rule= rules[i]
		if(rule.type==1){
			var ps=rule.parentStyleSheet
			var href=ps.href;  // Null means inline
			if(!href)href=ps.ownerNode.ownerDocument.location.href//change to stylesheet
			var ruleLine = domUtils.getRuleLine(rule);

			href='<a1>'+ruleLine+sayHrefEnd(href)+'<npp></npp></a1>'
			ans.push("<div slateID='"+i+"'><div><span class='selector'>"+rule.selectorText+'</span>{',breakRule2(rule.cssText),'<div class="end">} '+href+'</div>')

		}else if(rule.cssRules){//-moz-document,media
			var sel=rule.cssText
			sel=sel.substring(0,sel.indexOf('{'))
			ans.push("<div slateID='"+i+"'><div><span class='docrule'>"+sel+'</span>{',"<div class='prop'>"
				+sayCSS(rule.cssRules,0,true)
				+'</div>','<div class="end">}</div>')
		}else{
			ans.push('<div slateID="'+i+'"><div class="end"><span class="selector">'+rule.cssText+'</span>'+rule.type+'</div>')
		}
	}dump('saycss',t-Date.now(),n-100,"**********-----------------******************",ans.length)
	if(n>maxn){
		ans.push("<div><buttondiv slateid='complete'>and <em>"+(n-maxn)+'</em> more rules</buttondiv>')
	}
	return '<div id="CSS-slate">'+ans.join('</div>')+'</div></div>'
}
function breakRule2(cssText){
	var props = [];
	cssText=cssText.substr(cssText.indexOf('{')+1)
	var lines = cssText.match(/(?:[^;\(]*(?:\([^\)]*?\))?[^;\(]*)*;?/g);
	var propRE = /\s*([^:\s]*)\s*:\s*(.*?)\s*(! important)?;?$/;
	//var propRE = /\s*([^:\s]*)\s*:\s*(.*?)\s*;?$/;
	var line,i=0;
	while(line=lines[i++]){
		var m = propRE.exec(line);
		if(!m)
			continue;
		//var name = m[1], value = m[2], important = !!m[3];
		/*if (m[2])this.addProperty(m[1], m[2], !!m[3], false, inheritMode, props);*/
		props.push("<span class='name'>"+m[1]+"</span>: <span class='val'>"+rgbToHex(m[2])+"</span>"+(!!m[3]?'<span>!important</span>;':";"))
	};

	return "<div class='prop'>"+props.join("</div><div class='prop'>")//+'</div>';
}
function hrefromRule(rule){
	var ps=rule.parentStyleSheet,href
	var href=ps.href;  // Null means inline
	if(!href)href=ps.ownerNode.ownerDocument.documentURI
	return href
}
function rgbToHex(value){//hex values are better for eyes than rgb ones
    return value.replace(/\brgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/gi, function(_, r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + (b << 0)).toString(16).substr(-6).toUpperCase();
    });
}

cssSlate={
	slate:{},
	sayRules: function(rules){
		//var slate=viewDoc.getElementById("CSS-slate")
		//if (slate)viewDoc.body.removeChild(slate)
		var slate=viewDoc.createElement('slate')
		//this.slate.viewer=this
		slate.innerHTML=sayCSS(rules)
		viewDoc.body.replaceChild(slate,viewDoc.body.firstChild)
	},
	sayRemainingRules: function(){		
		var slate=viewDoc.createElement('slate')		
		slate.innerHTML=sayCSS(currentRules,currentRules.length)
		viewDoc.body.replaceChild(slate,viewDoc.body.firstChild)
	},
	
}


function sayParentCSS(mNode){
	var parent=mNode
	var ans=[]
	var cr=[]
	while(parent){//&&parent.nodeType==1
		ans.push("<div class='parents' closer='true'><a11> \u25e2 </a11><a>"+cssSelector(parent)+"</a></div>")
		try{
			var rules=rulesForNode(parent);
			cr=cr.concat(rules);
			ans.push(sayCSS(rules))
		}catch(e){}
		parent=parent.parentNode
	}
	currentRules=cr
	return ans.join('')
}
closeNodeInSlate=function(node){
	if(node.hasAttribute('closed')){
		node.removeAttribute('closed')
		node.firstChild.textContent=' \u25e2 '
		node=node.nextSibling
		node&&node.style&&(node.style.display='')
	}else{
		node.setAttribute('closed',true)
		node.firstChild.textContent=' \u25e5 '
		node=node.nextSibling
		node&&node.style&&(node.style.display='none')
	}
}

subViewer=attributeViewer

/**-----------//////**************************/
computedStyleViwer={
	initialize:function(){
		this.element=document.documentElement.appendChild(document.createElement('box'))
	},
	compCSS: function(mNode){
		var ans=[]
		var aWindow=(mNode.ownerDocument||mNode).defaultView

		var mNodeStyle=aWindow.getComputedStyle(mNode,"")
		if(!mNodeStyle) return "document isn't visible"
		//setContentState('hover')
		var cs2=aWindow.getComputedStyle(computedStyleViwer.element,"")
		var l,m
		for(var i=0;i<mNodeStyle.length;i++){
			var k=mNodeStyle.item(i)
			var l=mNodeStyle.getPropertyValue(k),m=cs2.getPropertyValue(k)
			if(l!=m){
				l=rgbToHex(l)
				m=rgbToHex(m)
				ans.push('<td'+[' class="propName">'+k+':'
							   ,' class="propVal">'+l
							   ,' class="propDef">'+m].join('</td><td')+'</td>')
			}
		}
		return '<table id="computedStyle-slate"><tbody><tr>'+ans.join('</tr><tr>')+'</tr></tbody></table>'
	}
}

initializeables.push(computedStyleViwer)

contentStates={active: 0x01,focus: 0x02, hover: 0x04,l:0x08,k:0x10}

setContentState=function(state){
	var st=domUtils.getContentState(mNode)
	dump(st.toString(2))
	st^=contentStates[state]
	dump(st.toString(2))
	domUtils.setContentState(mNode.ownerDocument.documentElement,0x07)//
	domUtils.setContentState(mNode,st)
	insertAddrs(mNode)
}
/**-----------//////**************************/
slateViewer={
	initialize: function(){
		content.wrappedJSObject.gClipboardHelper=gClipboardHelper
		
		viewDoc=document.getElementById('slate-browser').contentDocument
		viewDoc.addEventListener("mouseover",this.mouseover,false)
		viewDoc.addEventListener("click",this.click,false)

		//**
		var a=this.tabs=document.getElementById('subpantabs')

		a.setAttribute("onmousedown","if(event.button==0&&event.detail==1)slateViewer.setSlateFromTab(event.target.id)")
		var b=createElement('tab',{label:'all'})
		a.appendChild(b)
		var b=createElement('tab',{label:'dom',id:"attrs"})
		a.appendChild(b)
		var b=createElement('tab',{label:'css',id:'css'})
		a.appendChild(b)
		var b=createElement('tab',{label:'xbl',id:'xbl'})
		a.appendChild(b)
		a.selectedIndex=0
	},
	setSlateFromTab: function(mode){
		if(this.mode=='domedit'){
			attributeViewer.saveEdit()
		}
		this.mode=mode//||this.tabs.selectedItem.id
		insertAddrs(mNode)
	},
	slates:[attributeViewer,'xbl'],
	
	mouseover:function(event){
		clearTimeout(this.mouseoverTimeout)
		this.mouseoverTimeout=setTimeout(function(){slateViewer.overNode(event)},100)		
	},
	overNode:function(event){		
		var node=event.target
		//dump('infotip', node.nodeName)=='A1'
		if(node.nodeName){
			var i=getSlatePosition(node)
			if(i)
				dump('infotip', i.id, i.slateId,currentRules[i.slateId].parentStyleSheet.href)
		}
	},
	click:function(event){
		var node=event.target
		dump(domNodeSummary(node))
		if(node.parentNode.hasAttribute('closer')){closeNodeInSlate(node.parentNode)}
		else if(node.nodeName=='SP'){
			if(node.textContent=='edit')attributeViewer.startEdit(mNode)
			else setContentState(node.textContent)
		}
	},
}
	initializeables.push(slateViewer)

  //**************************************************
 //* find stylesheets without owner nodes
//******/
function collectAgentSheets1(callback){stTime=Date.now()
	var frame =document.getElementById('hiddenFrame')
	if(!frame){
		var frame=document.createElement("iframe");
		frame.setAttribute("collapsed", "true");
		document.documentElement.appendChild(frame);
		frame.id='hiddenFrame'
	}

	var st='<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?><window xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"><'
	var en='/></window>'
	var tags=[
		'scrollbar', 'tree', 'textbox type="autocomplete"', 'toolbarbutton',
		'toolbar', 'button', 'checkbox', 'menu', 'menulist', 'panel', 'listbox',
		'richlistbox', 'groupbox','splitter',
		'progressmeter', 'menuitem id="copy"', 'window', 'popup', 'script'
		]

	st=st+tags.join('/><')+en

	if(frame.loadListener)
		frame.removeEventListener("load", frame.loadListener,true)
	else
		frame.contentDocument.location="data:application/vnd.mozilla.xul+xml," + encodeURIComponent(st);

	frame.addEventListener("load", frame.loadListener=doOnload,true)

	function getStyleSheetsFromNode(mNode,styleList){//	dump(mNode.nodeName)
		var inspectedRules=domUtils.getCSSStyleRules(mNode)
		if(!inspectedRules)	return
		for(var i = inspectedRules.Count()-1; i >=0 ; --i){
			var rule= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule);
			var sheet=rule.parentStyleSheet
			while(sheet.ownerRule){sheet=sheet.ownerRule.parentStyleSheet;}
			if(sheet.ownerNode)continue
			if(sheet.href.slice(0,5)=='data:')continue
			if(styleList.indexOf(sheet)==-1){
				styleList.push(sheet);//dump('axept')
			}
			//dump(sheet.href)
		}
	};
	function doOnload(){
		var elements= this.contentDocument.documentElement.childNodes
		userAgentStyles=[]
		for(var i=0; i<elements.length;i++){
			getStyleSheetsFromNode(elements[i],userAgentStyles)
		}
		userAgentStyles.sort(function(a,b){return a.href>b.href})
		callback()
				dump('**********************',stTime-Date.now())

	}


}
var userAgentStyles

function collectAgentSheets(callback){stTime=Date.now()
	var st='<box hidden="true" id="hiddenBox"><'
	var en='/></box>'
	var tags=[
		'scrollbar', 'tree', 'textbox type="autocomplete"', 'toolbarbutton',
		'toolbar', 'button', 'checkbox', 'menu', 'menulist', 'panel', 'listbox',
		'richlistbox', 'groupbox','splitter',
		'progressmeter', 'menuitem id="copy"', 'window', 'popup', 'script', 'h:textarea', 'h:input'
		]

	tags=st+tags.join('/><')+en


	var frame=document.getElementById('hiddenBox')
	var range=document.createRange();
	if(!frame){
		var frame=document.createElement("box");
		document.documentElement.appendChild(frame);
	}
	range.selectNode(frame);
	var fragment= range.createContextualFragment(tags);
	var firstChild=fragment.firstChild
	if(frame){
		frame=frame.parentNode.replaceChild(firstChild, frame);
	}else{
		frame=document.documentElement.appendChild(firstChild)
	}

frame=firstChild
	doOnload()
	function getStyleSheetsFromNode(mNode,styleList){	//dump(mNode.nodeName)
		var inspectedRules=domUtils.getCSSStyleRules(mNode)
		if(!inspectedRules)	return
		for(var i = inspectedRules.Count()-1; i >=0 ; --i){
			var rule= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule);
			var sheet=rule.parentStyleSheet
			while(sheet.ownerRule){sheet=sheet.ownerRule.parentStyleSheet;}
			if(sheet.ownerNode)continue
			//if(sheet.href.slice(0,5)=='data:')continue
			if(styleList.indexOf(sheet)==-1){
				styleList.push(sheet);//dump('axept')
			}
			//dump(sheet.href)
		}
	};
	function doOnload(){
		var elements= frame.childNodes
		userAgentStyles=[]
		for(var i=0; i<elements.length;i++){
			getStyleSheetsFromNode(elements[i],userAgentStyles)
		}
		userAgentStyles.sort(function(a,b){return a.href>b.href})
		callback()
		dump('**********************',stTime-Date.now())
	}


}
var userAgentStyles

  //**************************************************
 //* css searcher
//******/
SEARCH_ON_FOCUS='dump("145-------------------",this.mIgnoreFocus,this.value,domNodeSummary(event.target),event.target.nodeName=="html:input",event.target==this); if(event.target.nodeName=="html:input")this.mIgnoreFocus||'
cssSearch={
	initialize: function(aWindow){
		this.findbar = document.getElementById('cssSearch');
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
		dump(xpath,this.activeXPath)
		var result=this.findRules(xpath,allCSSSheets)
		this.textbox.matchCount=result.length
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

	parseCPATH2: function(str){
		var valueArray = [], selectorArray = []
		
		var i=0,i0=0,next=str.charAt(i++)//i is one char farther than next so that [# .] are skipped
		var rx=/[\w$\-\[\]\(\)]/
		var gtCount=0
		var skipWord=function(){i0=i;
			while(rx.test(next=str.charAt(i)))i++;
		}
		while(next){
			if(next=='.'||next=='#'||rx.test(next)){
				skipWord()
				selectorArray.push(str.substring(i0-1,i));				
			}else if(next==':'){
				if(str.charAt(i++)==':'){
					skipWord()
					selectorArray.push(str.substring(i0-2,i));
				}else{
					skipWord()
					selectorArray.push(str.substring(i0-2,i));
				}
			}else if(next=='>'){
				gtCount++
			}else if('@,'.indexOf(next)>-1){
				selectorArray.push(next);
			}else if(next=='{'){
				valueArray=str.substr(i).split(/[ :;,]/)
				break
			}			
			next=str.charAt(i++)
		}
		
		//return selectorArray.join(',\n')+gtCount+valueArray.join(',\n')
		
		return [(selectorArray.length||gtCount) && function(css){
					for each(var t in selectorArray)
						if(css.indexOf(t)==-1)
							return false
					// for '>'	
					var index=0
					for(var i=gtCount;i>0;i--)
						if((index=css.indexOf('>',index)+1)==0)
							return false
					return true
				},
				valueArray && function(css){	
					for each(var t in valueArray)
						if(css.indexOf(t)==-1)
							return false
					return true
				}]
	},
	
	findRules: function(text, stylesheets){time=Date.now()
		var ans=[]
		var [test1,test2]=this.parseCPATH2(text)
		
		function iterateCSSRules(cssRules){
			for (var j=0,jj=cssRules.length; j<jj; j++){
				var rule = cssRules[j];
				if (rule.type===1){//normal rule
					var selector = rule.selectorText;
					if(!test1||test1(selector))						
						if(!test2||test2(rule.cssText,selector.length))
							ans.push(rule)
				}else if(rule.cssRules){//media or -moz-document
					var selector=rule.cssText,i=selector.indexOf('{')
					if(i>0)selector=selector.substring(0,i)
					if(test1&&test1(selector))
						ans.push(rule)
					iterateCSSRules(rule.cssRules)
				}else if(selector=rule.cssText){// strange ones: import namespace etc. 
					if(selector&&test1&&test1(selector))ans.push(rule)
				}
			}
		}
		for (var i=0,ii=stylesheets.length; i<ii; i++){
			iterateCSSRules(stylesheets[i].cssRules)
		}
		dump('css---->time: ',time-Date.now())

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
		dump('css---->time: ',time-Date.now())

		return ans
	},
}
	initializeables.push(cssSearch)





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
const gClipboardHelper = {
	cbHelperService: Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper),
	copyString: function(str) this.cbHelperService.copyString(str),
	getData: function(){
		try{
			var clip = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
			var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
			trans.addDataFlavor("text/unicode");
			clip.getData(trans,1)
			var str={},strLength={}
			trans.getTransferData("text/unicode",str,strLength)
			str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
			pastetext = str.data.substring(0, strLength.value/2);
			return pastetext||''
		}catch(e){
			Cu.reportError(e)
			return ''
		}
	}
}



urlOperations=function(command){
	var path=mURI
	if(path)
	switch(command){
		case 'view':    viewFileURI(mURI, mLine);break
		case 'launch':	getLocalFile(path).launch();break
		case 'reveal':  getLocalFile(path).reveal();break
		case 'copy':    gClipboardHelper.copyString(path);break
		case 'edit':    var file=getLocalFile(mURI);if(file&&!file.isDirectory())npp(file.path,mLine);break
	}
}

function contextMenuPopupShowing(event){
	dr=document.popupNode
	var [id, el]=getAncestorId(dr)
	mURI=''
	mLine = null
	//leftpane
	var a=document.getElementById('nodeOperations')
	var b=document.getElementById('domViewerOperations')
	if(id=='leftPane'){
		mURI=leftPane.currentURI()
		mLine=leftPane.currentLine&&leftPane.currentLine()		
		if(leftPane==domViewer||leftPane==domSearch){			
			a.hidden=b.hidden=false
		}else
			a.hidden=b.hidden=true
	}else if(id=='window-tree'){
		mURI=windowViewer.currentURI()
		mLine=null
		a.hidden=true;
		b.hidden=false
	}else
		a.hidden=b.hidden=true

	//slates
	if(id=='CSS-slate'){
		var i=getSlatePosition(dr)
		if(i){
			i=getRulePosition(currentRules[i.slateId])
			mURI=i.uri
			mLine=i.line
		}				
	}
	// selected url
	var sel = el.ownerDocument.defaultView.getSelection().toString()
	if(sel && sel.search(':')!=-1){
		mURI = sel
		mLine = null
	}
		
	dump(mURI,!mURI)
	var a=document.getElementById('urlOperations')
	a.hidden=!mURI
	a.setAttribute('tooltiptext',mURI+':'+mLine)
}
function getRulePosition(rule){
	var ps=rule.parentStyleSheet
	var href=ps.href;  // Null means inline
	if(!href)
		href=ps.ownerNode.ownerDocument.location.href//change to stylesheet
	try{
		var ruleLine = domUtils.getRuleLine(rule);
	}catch(e){}
	
	return {uri: href, line:ruleLine}
}

function getAncestorId(el){
	var elId
	while(el){
		if(elId=el.id)
			return [elId,el]
		el=el.parentNode
	}
	return [null,null]
}
function getAncestorByAttribute(el, attrName){
	var elId
	while(el.hasAttribute){
		if(el.hasAttribute(attrName))
			return [el.getAttribute(attrName),el]
		el=el.parentNode
	}
	return [null,null]

}
function getSlatePosition(el){
	var elId
	while(el.hasAttribute){
		if(el.hasAttribute("slateID"))
			break
		el=el.parentNode
	}
	if(!el.hasAttribute)
		return
	var ans={slateId: el.getAttribute("slateID"), slateNode: el}
	while(el){
		if(elId=el.id){
			ans.id = elId
			ans.slate = el
			return ans
		}
		el=el.parentNode
	}
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
			          if(activeElId=='leftPane'||activeElId=="window-tree")   leftPaneSearch.textbox.focus()
				 else if(activeElId=='leftPane-search') leftPaneSearch.tree.focus()
				 else if(activeElId=='slate-browser')browserFind.focus()

		}else if((event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_Q)||
				 (event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_W)||
				 (event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_Enter)){
			getActiveEl()			
			     if(activeElId=='leftPane'||activeElId=="leftPane-search")windowViewer.activate()
			else if(activeElId=='slate-browser'||activeElId=='slate-finder')leftPane.tree.focus()
			else if(activeElId=='window-tree'){windowViewer.deactivate();document.getElementById('slate-browser').focus()}
		}
		else if((event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_Q)||
				(event.shiftKey&& event.keyCode==KeyEvent.DOM_VK_W)||
				(event.ctrlKey&& event.keyCode==KeyEvent.DOM_VK_ENTER)){
			getActiveEl()	
			     if(activeElId=='leftPane')   document.getElementById('slate-browser').focus()
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
	initialize: function(textArea){
		/*this.editor=textArea.editor*/
		//var docShell = content.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShell);
		//this.selCon= docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsISelectionDisplay).QueryInterface(Ci.nsISelectionController);
		
		function gi(object,iface){
			return object.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(iface)
		}
		this.selCon=[
			content,//window,
			Ci.nsIWebNavigation,
			Ci.nsIDocShell,
			Ci.nsISelectionDisplay
		].reduce(gi).QueryInterface(Ci.nsISelectionController)

		
		
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
		if(!this.highlight)
			return
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
/* 		if(viewDoc.hasFocus()){}else{
			this.addRanges2(this.textbox.value)
		} */
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
		
		
		var currEnd=currRange.cloneRange(); currEnd.collapse(false)
		var currStart=currRange.cloneRange(); currStart.collapse(true)

		var allDocEnd=this._searchRange.cloneRange(); allDocEnd.collapse(false)
		var allDocStart=this._searchRange.cloneRange(); allDocStart.collapse(true)
		
		var retRange
		this.active=false

		this.finder.findBackwards=false
		var numBefore=0,numAfter=0
		while(retRange=this.finder.Find(text, this._searchRange, currEnd, allDocEnd)){
			this.findSelection.addRange(retRange);
			currEnd=retRange.cloneRange();currEnd.collapse(false)			
			numBefore++
		}

		this.finder.findBackwards=true
		while(retRange=this.finder.Find(text, this._searchRange, currStart, allDocStart)){
			this.findSelection.addRange(retRange);
			currStart=retRange.cloneRange();currStart.collapse(true)
			numAfter++
		}
		
		numBefore&&(this.active=true)
		this.timeout=''
		
		this.textbox.matchCount=numAfter+numBefore+1
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

		this.finder.findBackwards=dir
		curEnd=this.finder.Find(text, this._searchRange, curEnd, allDocEnd)

		if(!curEnd&&continueFromTop){
			curEnd=sel.getRangeAt(0);curEnd=curEnd.cloneRange()
			curEnd.collapse(!dir)
			allDocEnd=this._searchRange.cloneRange(); allDocEnd.collapse(!dir)
			curEnd=this.finder.Find(text, this._searchRange, allDocEnd, curEnd)		
		}
		sel.removeAllRanges()
		this.selCon.setDisplaySelection(Ci.nsISelectionController.SELECTION_ATTENTION);
		this.selCon.repaintSelection(this.seltype)
		if(curEnd){
			sel.addRange(curEnd)
			this.editor.selectionController.scrollSelectionIntoView(1, 0, false);
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





/***

u=viewDoc.defaultView.getSelection().focusNode.parentNode.parentNode.parentNode.attributes[0].value
r=currentRules[u].parentStyleSheet
sayCSS

viewDoc.body.innerHTML=sayCSS(r.cssRules)

*/
