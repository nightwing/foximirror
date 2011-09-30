Components.utils.import('resource://shadia/main.js', window).addDevelopmentUtils(window)
/**/
var shadowInspector=function(){}
shadowInspector.debug=false


shadowInspector.activate=function(aWindow){
	var topWin=shadowInspector.getTopWindow(window)
	if(!topWin.shadia)
		this.activateTop(topWin)//check is needed for debug
	if(topWin!=window){
		this.activateInner(window)
	}
}
shadowInspector.activateTop=function(aWindow){
	if(shadowInspector.debug||!aWindow["shadia"]){
		if(aWindow["shadia"]){
			aWindow["shadia"].finish()
			//$shadia.lightStarter.uninit(aWindow)
		}
		aWindow["shadia"]=new shadowInspector()
		//$shadia.lightStarter.init(aWindow)
	}else{
		if(!aWindow["shadia"]){
			aWindow["shadia"]=new shadowInspector()
			//$shadia.lightStarter.init(aWindow)
		}
	}
	//shadia.start()
	var keys=aWindow.document.querySelectorAll("key[keycode='VK_F1']")
	for(var i=1,ii=keys.length;i<ii;i++){
		keys[i].parentNode.removeChild(keys[i])
	}
}
shadowInspector.activateInner=function(){
	if(shadowInspector.debug||!window["shadia"]){
		if(window["shadia"])window["shadia"].finish()
		shadia=new shadowInspector()
	}else{
		if(!window["shadia"])shadia=new shadowInspector()
	}
	shadia.start=shadia.toggle=shadia.createInfoPanel=shadia.showPanel=shadia.fillPanel=shadia.toggleClickSelect=function(){}
}

shadowInspector.browserPopup=function(event,pWin1){
	var t=event.target,id=t.id

	if(event.button!==0){
		var p=document.getElementById("shadia-window-menu")
		p.enableRollup(false)
		p.openPopup(t,'before_start',0,0,false,true)
	}else if(t.label==="help"&&!id){
		openDialog('chrome://shadia/content/options.xul','resizable').focus();
	}else if(t.label==="start inspector"&&!id){
		shadia.inspect()
	}else if(t.label==="tools"&&!id){
		t.style.cssText='-moz-binding:url(chrome://shadia/content/bindings/debug.xml#shadiaGlue)'
	}else if(event.target.nodeName==="menuitem"&&id){
		var resource = id
		if(resource){
			this.start(Services.wm.getWindowForResource(resource))
		}
	}else if(pWin1){
		this.start(pWin1)
	}else if(t.nodeName=='image'){
		shadia.toggle()
	}
}

shadowInspector.getTopWindow=function(mWindow){
	let domUtils = Services.domUtils 
	var rt=mWindow,pw=mWindow
	while(rt){
		rt=domUtils.getParentForNode(rt.document,false)
		rt=rt&&rt.ownerDocument.defaultView
		if(rt)
			pw=rt
	}
	return pw

	return mWindow.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIWebNavigation)
			.QueryInterface(Ci.nsIDocShellTreeItem)
			.rootTreeItem
			.QueryInterface(Ci.nsIInterfaceRequestor)
			.getInterface(Ci.nsIDOMWindow); 
}
shadowInspector.start=function(mWindow, selectByClick){
	var topWindow=this.getTopWindow(mWindow)
	if(shadowInspector.debug||!topWindow.shadia)
		$shadia.lightStarter.loadScript(topWindow)//----
	topWindow.shadia.start();
	topWindow.focus()
	if(selectByClick)
		topWindow.shadia.toggleClickSelect()
}

shadowInspector.allWindowsSelect=function(start,skipThis,selectByClick){
	var fWins = Services.wm.getEnumerator('')
	var aWin
	while(fWins.hasMoreElements()) {
		aWin= fWins.getNext()
		try{
			if(shadowInspector.debug || !aWin.shadia)
				$shadia.lightStarter.loadScript(aWin)

			aWin.shadia.allWinsStarted=start
			if(skipThis&&aWin==window){aWin.shadia.finish();continue}
			if(start)
				selectByClick?aWin.shadia.toggleClickSelect():aWin.shadia.start()
			else
				aWin.shadia.finish()
		}catch(e){Components.utils.reportError(e)}
	}
}

  //** ***********************************************
 //* main highlighter
//**********************/
shadowInspector.prototype={
	toggle:function(){
		if(this.on)
			this.finish()
		else
			this.start()
	},
	start: function(mWindow){
		if(!this.infoPanel)
			this.createInfoPanel()
		if(!this.fm){
			this.fm=Cc["@mozilla.org/focus-manager;1"]
			if(this.fm)//prior 3.6 we dont have focusmanager
				this.fm=this.fm.getService(Ci.nsIFocusManager);
			else
				this.fm={get activeWindow() {return Services.wm.getMostRecentWindow(null)}}
		}
			
		this.isSheetRegistered||this.register()
		this.finish()
		this.light="lime"

		this.mWindow = mWindow || this.defWindow
		if(this.mWindow){
			this.addListeners()
			this.mWindow.focus()
			this.mWindow = Components.utils.getWeakReference(this.mWindow)
		}else{
			this.mWindow = window
			this.addListeners()
			this.mWindow = null
		}

		this.on=true;
		this.updateLight()&&this.showHelp()
	},
	
	addListeners: function(){
		this.mWindow.addEventListener('mousemove',  this.l1  = function(e){shadia.mouseMoveListener(e)}, true);
		this.mWindow.addEventListener('mouseout',   this.l12 = function(e){shadia.mouseOutListener(e)}, true);
		this.mWindow.addEventListener('deactivate', this.l13 = function(e){shadia.deactivateListener(e)}, true);
		this.mWindow.addEventListener('activate',   this.l14 = function(e){shadia.activateListener(e)}, true);
                                                         
		this.mWindow.addEventListener('keydown',    this.l2  = function(e){shadia.keydownListener(e)}, true);
		this.mWindow.addEventListener('keypress',   this.l21 = function(e){shadia.keydownListener(e)}, true);
		this.mWindow.addEventListener('keyup',      this.l22 = function(e){shadia.keydownListener(e)}, true);
                                                         
		this.mWindow.addEventListener('popupshown', this.l3  = function(e){shadia.popupOpenListener(e)}, true);
	},

	finish: function(){
		if(!this.on)
			return;
		this.on = false;
		
		var mWindow = this.mWindow?	this.mWindow.get(): window;

		mWindow.removeEventListener('mousemove',  this.l1,  true); this.l1=null;
		mWindow.removeEventListener('mouseout',   this.l12, true); this.l12=null;
		mWindow.removeEventListener('deactivate', this.l13, true); this.l13=null;
		mWindow.removeEventListener('activate',   this.l14, true); this.l14=null;

		mWindow.removeEventListener('keydown',    this.l2,  true); this.l2=null;
		mWindow.removeEventListener('keypress',   this.l21, true); this.l21=null;
		mWindow.removeEventListener('keyup',      this.l22, true); this.l22=null;

		mWindow.removeEventListener('popupshown', this.l3,  true); this.l3=null;

		/**clickselect listeners*/
		mWindow.removeEventListener('mousedown',  this.lcs, true);
		mWindow.removeEventListener('mouseup',    this.lcs, true);
		mWindow.removeEventListener('click',      this.lcs, true);
		mWindow.removeEventListener('mouseout',   this.lcs, true); this.lcs=null

		this.hidePanel()
		this.unLightElement(this.historyA[0]);
		if(this.allWinsStarted)shadowInspector.allWindowsSelect(false)
		//delete history
		this.historyA=new Array(20);this.historyB=[]
	},

	createInfoPanel: function(){
		this.infoPanel=document.createElement("tooltip")
		this.infoPanel.id='shadiaInfoTip'
		//this.infoPanel.style.MozBinding='url()'
		this.infoPanel.style.MozAppearance="panel"
		this.infoPanel.setAttribute('onmousemove','this.hidePopup()')
		document.documentElement.appendChild(this.infoPanel)
		this.infoPanel.setAttribute("noautohide",true)
		this.infoPanelBo=this.infoPanel.popupBoxObject//boxObject.QueryInterface(Ci.nsIPopupBoxObject);		
	},

	//
	popupOpenListener: function(event){
		if( this.panelShowing&&event.target!=this.infoPanel) {
			this.infoPanel.hidePopup()
			this.infoPanel.showPopup(null,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip")
			this.recentPopups.push(event.target)
			if(this.recentPopups.length>10)
				this.recentPopups.shift()
		}
	},
	recentPopups:[],

	//catchNodes
	$:[],
	suspendMouse:function(){
		if(this.l1){
			window.removeEventListener('mousemove',  this.l1, true);
			window.removeEventListener('deactivate', this.l12, true);
			window.removeEventListener('activate',   this.l13, true);
			this.infoPanel.hidePopup()

			this.l1=null;

			this.$.unshift(this.historyA[0])
			if(this.$.length>20)
				this.$.pop()
		}else{
			window.addEventListener('mousemove',  this.l1=function(e){shadia.mouseMoveListener(e)}, true);
			window.addEventListener('deactivate', this.l12=function(e){shadia.deactivateListener(e)}, true);
			window.addEventListener('activate',   this.l13=function(e){shadia.activateListener(e)}, true);

			//this.editPanel.hidePopup()
		}
	},
	//windowActive
	mouseOutListener: function(event){
		if(!event.relatedTarget)
			this.infoPanelBo.hidePopup()
	},
	deactivateListener: function(event){
		this.infoPanelBo.hidePopup()
		this.windowActive=false
		this.light='off'
	},
	activateListener: function(event){
		this.windowActive=true
		this.light=this.lcs?'click':'lime'
	},
	updateLight: function(event){
		var istop = this.fm.activeWindow == window
		if(istop) {
			this.windowActive=true
			this.light=this.lcs?'click':'lime'
		} else {
			this.windowActive=false
			this.light='off'
		}
		return istop
	},
	mouseMoveListener: function(event) {
		this.infoPanelBo.moveTo(event.screenX+10,event.screenY+10)
		if(event[this.targetType]!=this.historyA[0])
			this.advanceLight(event[this.targetType],"lime")
		//	this.setLight(event.target,"blue")
	},
	targetType: 'originalTarget',
	changeDepth: function(){
		this.targetType=this.targetType=='originalTarget'?'target':'originalTarget'
	},

	keydownListener: function(event){
		if(event.type==="keydown"){
			var obj=this.historyA[0]
			switch(event.keyCode){
				case KeyEvent.DOM_VK_SCROLL_LOCK       :
				case KeyEvent.DOM_VK_F1       :this.finish();obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD4  :this.historyBack();obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD6  :this.historyForward();obj=null;break;

				case KeyEvent.DOM_VK_NUMPAD0  :this.suspendMouse();obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD1  :this.fullInfoInPanel=!this.fullInfoInPanel;
											   this.fillPanel(this.historyA[0]);
											   break;
				case KeyEvent.DOM_VK_NUMPAD3  :this.changeDepth() ;obj=null;break;
				//case KeyEvent.DOM_VK_NUMPAD1  :shadowInspector.allWindowsSelect(true,true,false);obj=null;break;
				//case KeyEvent.DOM_VK_NUMPAD2  :shadowInspector.allWindowsSelect(true,true,true);obj=null;break;


				case KeyEvent.DOM_VK_NUMPAD7  :this.inspect(obj);obj=null;if(event.ctrlKey)this.finish();break;
				case KeyEvent.DOM_VK_NUMPAD8  :this.fbug(obj)   ;obj=null;if(event.ctrlKey)this.finish();break;
				case KeyEvent.DOM_VK_NUMPAD5  :this.domi(obj)   ;obj=null;if(event.ctrlKey)this.finish();break;

				case KeyEvent.DOM_VK_NUMPAD9  :this.copySelector(obj);obj=null;break;

				case KeyEvent.DOM_VK_RIGHT    :if(this.ignorekeys)return
				case KeyEvent.DOM_VK_NUMPAD3  :obj=this.toRight(obj);break;

				case KeyEvent.DOM_VK_LEFT     :if(this.ignorekeys)return
				case KeyEvent.DOM_VK_NUMPAD1  :obj=this.toLeft(obj);break;

				case KeyEvent.DOM_VK_UP       :if(this.ignorekeys)return
				case KeyEvent.DOM_VK_NUMPAD5  :obj=this.toUp(obj);break;

				case KeyEvent.DOM_VK_DOWN     :if(this.ignorekeys)return
				case KeyEvent.DOM_VK_NUMPAD2  :obj=this.toDown(obj);break;
				default: return//need to return to not catch keys
			}
			if(obj)
				this.advanceLight(obj)
			//
			event.stopPropagation()
			event.preventDefault()
			this.keysToCatch.push(event.keyCode)

		}else{
			var i=this.keysToCatch.indexOf(event.keyCode)
			if(i>0){
				event.stopPropagation()
				event.preventDefault()
				if(event.type==="keyup"){
					this.keysToCatch.splice(i,1)
				}
			}
		}
	},
	keysToCatch:[],
	//////
	toLeft:function(obj){
		return obj.previousSibling;
		var o=obj.previousSibling
		if(o){
			return o;
		}
		o=obj.parentNode;
		var level=1
		while(o&&!o.previousSibling){
			o=o.parentNode;++level;
		}
		o=o.previousSibling;
		while(o&&o.lastChild){
			o=o.lastChild;
			--level;
			if(level<=0){
				return o;
			}
		}
		return o
	},
	toRight:function(obj){
		return obj.nextSibling;
		var o=obj.nextSibling;
		if(o){
			return o;
		}
		o=obj.parentNode;
		var level=1
		while(o&&!o.nextSibling){
			o=o.parentNode;++level;
		}
		o=o.nextSibling;
		while(o&&o.firstChild){
			o=o.firstChild;
			--level;
			if(level<=0){
				return o;
			}
		}
		return o
	},
	toDown:function(obj){
		return obj.firstChild
		var o=obj.firstChild
		if(o){
			return o;
		}
		o=this.toRight(o)
		if(o.firstChild){
			return o.firstChild
		}
		return o;
	},
	toUp:function(obj){
		let parent=obj.parentNode
		if(parent) return parent
		let domUtils = Services.domUtils;   
        parent = domUtils.getParentForNode(obj, true);
		return parent
	},
	/////
	/***/
	copySelector:function(object){
		var name=object.localName.toLowerCase()
		if(object.id)
			name+="#"+object.id
		if(object.className)
			name+="."+object.className.toString().replace(" ",".",'g')
		const gClipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);  
		gClipboardHelper.copyString(name);
	},
	selectorForObject:function(object){
		var name=object.tagName
		if(object.id)
			name+="#"+object.id
		if(object.className)
			name+="."+object.className.toString().replace(" ",".",'g')
		return name;
	},

	showHelp:function(){
		var message = ['shadia keys{',
			'/***basics***/',
			'F1/Pause/Break: start shadia',
			'arrows: move in dom tree',
			'numpad 4,6: previous/next',
			'/***start inspecting document in***/',
			'numpad 7: built-in inspector (domMirror)',
			//'    *with control opens new instance',
			'numpad 8: firebug',
			'numpad 5: dom inspector',
			'/***more actions***/',
			'numpad 9: copy css selector',
			'numpad 1: toggle tooltip mode (more/less info)',
			'numpad 0: push current node into shadia.$ array',
			'numpad 3: toggle between showing event.originalTarget and target',
		].join('\n\t')+'\n}'

		this.fillPanel(message)
		// sometimes infopanel gets these set. why?
		this.infoPanel.removeAttribute("width")
		this.infoPanel.removeAttribute("height")
	},
	//panel
	showPanel:function(){
		if(this.infoPanel.state==="open"){
			return;
		}else{
			//this.infoPanelBo=this.infoPanel.boxObject.QueryInterface(Ci.nsIPopupBoxObject);
			this.panelShowing=true
			this.infoPanelBo.showPopup(null,this.infoPanel,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip",null,null)
		}
	},
	fillPanel:function(el){
		if(this.infoPanel.state!=="open")
			this.showPanel()
		var container=this.infoPanel
		var item = container.firstChild;
		if(!item){
			item=document.createElementNS("http://www.w3.org/1999/xhtml","div");
			container.appendChild(item);
			item.style.MozUserSelect='text'
		}
		//container.removeChild(container.firstChild)
		if(el.nodeType==1){//node
			var name=el.tagName,str
			str=el.id
			if(str)
				name+="#"+str
			str=el.className
			if(str&&typeof(str)=='string')
				name+="."+str.replace(" ",".",'g')

			if(this.fullInfoInPanel){
				var att=el.attributes,ans=[]
				for(var i=0;i<att.length;i++){
					var x=att[i],str=x.name
					if(str=='id'||str=='class'||str=='shadia-lighted')continue
					ans.push(str+'="'+x.value+'"')
				}
				name+='\n'+(ans.length?ans.join('\n'):'no attributes')
			}
		}else if(el.nodeType==7){//text
			name=el.nodeName+el.target+' ->'+el.data
		}else if(el.nodeType==9){//document
			name=el.nodeName+': '+el.title +'->'
			try{name+=decodeURIComponent(el.documentURI)}catch(e){name+=el.documentURI}
		}else if(el.nodeType==3){//text node
			name='textnode\n'
			str=el.textContent
			if(str.length>100)
				name+=str.slice(0,50)+' ...\n     ... '+str.slice(-50)
			else
				name+=str
		}else if(typeof el=='string'){
			name=el
		}
		//
		item.textContent=name
	},
	hidePanel:function() {
		this.panelShowing=false
		this.infoPanel.hidePopup()
	},

	  //*************************************
	 // click select
	//*************
	toggleClickSelect:function(){
		if(this.lcs){
			window.removeEventListener('mousedown', this.lcs, true);
			window.removeEventListener('mouseup',   this.lcs, true);
			window.removeEventListener('click',     this.lcs, true);
			window.removeEventListener('mouseout',  this.lcs, true);	this.lcs=null
			this.finish()
		}else{
			this.on||this.start()
			var slf=this
			window.addEventListener('mousedown', this.lcs=function(e){slf.clickSelectListener(e)}, true);
			this.updateLight()
			//if(this.l2)this.suspendKeys()
		}
	},
	clickSelectListener:function(event){
		if(event.button!=0)
			return
		event.stopPropagation();event.preventDefault()
		if(event.type=='mousedown'){
			this.windowWasActive = this.windowActive//shouldn't open inpector if window is not active
			this.windowWasActive && window.removeEventListener('mousedown', this.lcs, true);
			window.addEventListener('mouseup',   this.lcs, true);
			window.addEventListener('click',     this.lcs, true);
			window.addEventListener('mouseout',  this.lcs, true);
		}else if(event.type=='click' || event.type=='mouseout'){
			window.removeEventListener('click',    this.lcs, true);
			window.removeEventListener('mouseout', this.lcs, true);
			window.removeEventListener('mouseup',  this.lcs, true);
		}else if(event.type=='mouseup'){
			window.removeEventListener('mouseup',  this.lcs, true);
		}
		if(event.type=='click'){
			if(this.windowWasActive){
				if(this.allWinsStarted)shadowInspector.allWindowsSelect(false)
				this.inspect(event.originalTarget)
			}else{this.updateLight();this.setLight(this.historyA[0])}
		}
	},
	
	isTopWin:function(){
		return this.fm.activeWindow==window
	},

	  //*************************************
	 // inspector helpers
	//*************
	inspect: function(aNode){
		aNode=aNode||document.documentElement
		var aWin = Services.wm.getMostRecentWindow("shadia:inspector");		
		if(!aWin||aWin==window){
			window.openDialog("chrome://shadia/content/domMirror/domMirror.xul", "", "chrome,all,dialog=no", aNode);
		}else{
			aWin.focus();
			aWin.inspect(aNode)
		}
		if(this.lcs)this.finish()
	},
	domi: function(aNode){
		var fWins=Services.wm.getEnumerator('')
		var aWin, DOMIWin
		while(fWins.hasMoreElements()) {
			aWin= fWins.getNext()
			if(aWin.document.documentURI==="chrome://inspector/content/inspector.xul"){
				DOMIWin=aWin
				break;
			}
		}
		if(!DOMIWin){
			DOMIWin=window.openDialog("chrome://inspector/content/", "", "chrome,all,dialog=no", aNode);
		}else{
			DOMIWin.inspector.mInitTarget=aNode
			DOMIWin.inspector.initViewerPanels()
			DOMIWin.inspector.getViewer('dom').selectElementInTree(aNode)
			//subject
			DOMIWin.focus();
		}
		if(this.lcs)this.finish()
	},
	fbug: function(aNode){
		var fb=window["Firebug"]
		if(!fb){
			var aWin=Services.wm.getMostRecentWindow("navigator:browser");
			fb=aWin.Firebug
			if(!fb)
				return;
		}
		fb.Inspector.inspectFromContextMenu(aNode)
		aWin.focus();
		if(this.lcs)this.finish()
	},


	  //*************************************
	 // history
	//*************
	advanceLight:function(obj){
		this.unLightElement(this.historyA[0])
		this.setLight(obj)
		this.historyA.pop()
		this.historyA.unshift(obj)
		this.fillPanel(obj)
	},
	historyBack:function(){
		var obj=this.historyA.shift()
		this.historyA.push("")
		this.unLightElement(obj)
		this.historyB.push(obj)
		this.setLight(this.historyA[0])
		this.fillPanel(obj)
	},
	historyForward:function(){
		var obj=this.historyB.pop()
		if(!obj)
			return
		this.unLightElement(this.historyA[0])
		this.setLight(obj)
		this.historyA.pop()
		this.historyA.unshift(obj)
		this.fillPanel(obj)
	},
	historyA:new Array(20),
	historyB:[],


	  //*************************************
	 //  light
	//*************
	light: "lime",
	register: function(){
		this.activeURL=this.getDataUrl()
		let sss = Services.sss
		if(sss.sheetRegistered(this.activeURL, sss.AGENT_SHEET) )
			sss.unregisterSheet(this.activeURL, sss.AGENT_SHEET) ;
		sss.loadAndRegisterSheet(this.activeURL, sss.AGENT_SHEET) ;
		this.isSheetRegistered=true
	},
	unregister: function(){
		let sss = Services.sss
		if(sss.sheetRegistered(this.activeURL, sss.AGENT_SHEET))
			sss.unregisterSheet(this.activeURL, sss.AGENT_SHEET);
		this.isSheetRegistered=false
	},
	getDataUrl: function(){
		if(this.activeURL) return this.activeURL;
		var code='D550FF'
		var code='\
#shadiaInfoTip{-moz-binding:url("chrome://shadia/content/bindings/debug.xml#tooltip");}\
*[shadia-lighted="0"]{outline:1px solid rgb( 83,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}\
*[shadia-lighted="1"]{outline:1px solid rgb(173,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}\
*[shadia-lighted="2"]{outline:1px solid rgb(213,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}\
*[shadia-lighted="off"]{outline:1px solid rgb(80,213,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}\
*[shadia-lighted="lime"]{outline:2px solid lime!important;outline-offset:-2px!important;-moz-outline-radius:2px!important;}\
*[shadia-lighted="click"]{outline:2px solid #d528ff!important;outline-offset:-2px!important;-moz-outline-radius: 2px!important;}'
		return Services.io.newURI("data:text/css," + encodeURIComponent(code), null, null);
	},


	setLight: function(obj,color) {
		obj&&obj.setAttribute&&obj.setAttribute("shadia-lighted",color||this.light)
	},
	unLightElement: function(obj) {
		obj&&obj.hasAttribute&&obj.hasAttribute("shadia-lighted")&&obj.removeAttribute("shadia-lighted");
	},


	lightParents: function(obj){
		this.unlightParents()
		var n=0
		for(var p=obj;p;p=p.parentNode){
			p.setAttribute&&p.setAttribute('shadia-lighted',n)
			this.lnodes.push(p)
			if(n>3)break;n++;
		}
		this.lnodestimeout=setTimeout(function(){shadia.unlightParents()},1000)

	},
	unlightParents: function(){
		for each(var p in this.lnodes ){
			p.removeAttribute&&p.removeAttribute('shadia-lighted')
		}
		this.lnodes=[]
		clearTimeout(this.lnodestimeout)
	},
	lnodes:[]
}

shadowInspector.activate(window)
/*
stub=function(e){

for(var i in KeyEvent){
if(KeyEvent[i] ===e.keyCode){
print(i+':'+e.keyCode)
break
}}
}
window.addEventListener('keydown',function(e)stub(e),false)


gt = function(doc){
	var ns, node, max = 10;
	while(max--){
		ns = doc.querySelectorAll(':hover')
		if(!ns.length)
			break
		node = ns[ns.length-1]
		doc = node.contentDocument
		if(!doc)
			break
	}
	return node
}

*/





