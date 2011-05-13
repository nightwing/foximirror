/***************************************************/
var initializeables=[]
function initialize(){
	initServices()

	for each(var i in initializeables)
		i.initialize()	
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
			this.data=chromePaths
		}else if(type=='addons'||!type){
			this.tree.setAttribute('addons',true)
			addonViewer.data=addonList			
		}
		this.tree.view=null
		this.tree.style.height='0px'
		this.tree.boxObject.screenX
		this.tree.style.height=''
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
histLog=function(){try{dump(
	dirViewer.historyA.map(function(a){return a[0].path}).concat(['----------']).concat(
		dirViewer.historyB.map(function(a){return a[0].path})
		).join('\n'))}catch(e){}
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
	return dirViewer.data[i].spec||dirViewer.currentDir.spec||getURLSpecFromFile(dirViewer.currentDir)
}
getCurrentFile=function(){
	return getLocalFile(getCurrentURI())
}
 
getCurrentline=function(){
	return slateViewer.getLine()
}

slateViewer={
	initialize:function(){
		gURLBar=this.urlbar=document.getElementById('urlbar')
		this.deck=document.getElementById('slateDeck')
		this.dirViewBrowser=document.getElementById('dirView')
		this.aceBrowser=document.getElementById('ace')
		this.fileBrowser=document.getElementById('file')
		viewDoc=this.dirViewBrowser.contentDocument

	},
	//***** ace specific
	setAce: function(data){
		this.deck.selectedIndex=2
		var a=this.aceBrowser.contentWindow.wrappedJSObject
		a.setLoacation(data.spec)
	},
	getLine: function(){
		try{
			var a=this.aceBrowser.contentWindow.wrappedJSObject.editor
			if(!a) return 0;
			return a.session.selection.selectionLead.row + 1
		}catch(e){}
	},
	//***** //
	setFile: function(){
		this.deck.selectedIndex=1
		
	},
	setDir: function(text){
		this.deck.selectedIndex=0
		viewDoc=this.dirViewBrowser.contentDocument
		viewDoc.body.firstChild&&viewDoc.body.removeChild(viewDoc.body.firstChild)
		viewDoc.body.innerHTML=text
	},
	
	onClick:function(event){	
		var node=event.target
		
		var i=getAttr(node,'slateid')[0]
		dump(i,this)
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
			this.data=dirViewer.data;
			this.currentDir=dirViewer.currentDir
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
				this.urlbar.value=indexOfURL(data.spec)//decodeURIComponent(uri)
				this.setAce(data)
				return
			}else if(gMode=='viewFile'){
				uri=data.spec
				ans='<iframe src="'+uri+'"/>'
			}else if(gMode=='codeMirror'){
				uri='view-source:'+data.spec
				ans='<iframe src="'+uri+'"/>'
			}
		}//content.location='view-source:'+this.data[i].spec
		this.urlbar.value=decodeURIComponent(uri)
		this.urlbar.value=decodeURIComponent(indexOfURL(data.spec))
		this.setDir(ans)
	},
	
}
	initializeables.push(slateViewer)
 


/*

//mAddonData.addon.userDisabled=true



fi=getCurrentFile()

var st=slateViewer.aceBrowser.contentWindow.wrappedJSObject.doc.toString()

writeToFile(fi, st)

gChromeReg.checkForNewChrome()







*/



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
	//initializeables.push(browserFind)
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

 
 
