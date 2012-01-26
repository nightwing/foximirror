//evs={}
//FillInHTMLTooltip
//shadia.finish()
var shadowInspector=function(){ 
}
shadowInspector.contaminate=function(){	
	if(!window["shadia"]){
		window["shadia"]=new shadowInspector()
	}
	//shadia.start()	
	var keys=document.querySelectorAll("key[keycode='VK_F1']")
	var key=keys[0]
	if(key){
		key.removeAttribute("command")
		for(var i=1;i<keys.length;i++){
			keys[i].parentNode.removeChild(keys[i])
		}
	}else{
		keys=document.getElementsByTagName("keyset")[0]
		if(!keys){
			keys=document.createElement("keyset")
			document.documentElement.appendChild(keys)			
		}
		key=document.createElement("key")
		key.setAttribute('keycode','VK_F1')
		keys.appendChild(key)		
	}
	key.setAttribute("oncommand","shadia.toggle();")
}
shadowInspector.prototype={
	toggle:function(){
		if(this.on){
			this.finish()
		}else{
			this.start()
		}
	},
	start: function(aDocument){	
		if(!this.infoPanel)
			this.createInfoPanel()
		var slf=this
		this.topNode=aDocument?aDocument:window
		this.finish()

		this.topNode.addEventListener('mousemove', this.l1=function(e){slf.mouseMoveListener(e)}, true);
		
		window.addEventListener('keydown', this.l2=function(e){slf.keydownListener(e)}, true);
		window.addEventListener('keypress', this.l21=function(e){slf.keydownListener(e)}, true);
		window.addEventListener('keyup', this.l22=function(e){slf.keydownListener(e)}, true);

		window.addEventListener('popupshown', this.l3=function(e){slf.popupOpenListener(e)}, true);
		
		this.on=true;
		//window.addEventListener("focus",this.l4=function(e){slf.windowFocusListener(e)},false)
		//window.addEventListener("blur",this.l5=function(e){slf.windowBlurListener(e)},false)
		
		this.showPanel()
	},

	finish: function(){
		if(!this.on)
			return;
		this.on=false;
		
		this.topNode.removeEventListener('mousemove', this.l1, true);
		window.removeEventListener('keydown', this.l2, true);
		window.removeEventListener('keypress', this.l21, true);
		window.removeEventListener('keyup', this.l22, true);

		window.removeEventListener('popupshown', this.l3, true);
		
		//window.removeEventListener("focus",this.l4,false)
		//window.removeEventListener("blur",this.l5,false)

		this.hidePanel()
		this.unLightElement(this.historyA[0]);
	},

	createInfoPanel: function(){
		this.infoPanel=document.createElement("tooltip")
		this.infoPanel.style.MozAppearance="panel"
		document.documentElement.appendChild(this.infoPanel)
		this.infoPanel.setAttribute("noautohide",true)
		this.infoPanelBo=this.infoPanel.boxObject.QueryInterface(Components.interfaces.nsIPopupBoxObject);
	},

	//	
	popupOpenListener: function(event) {
		if( this.panelShowing&&event.target!=this.infoPanel) {
			this.infoPanel.hidePopup()			
			this.infoPanel.showPopup(null,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip")
		}
	},
	windowBlurListener: function(event) {
		e=event;dump(event.target,"blu")

		if( this.panelShowing&&event.target===window) {
			this.infoPanel.hidePopup()			
		}
	},
	windowFocusListener: function(event) {
	e=event;dump(event.target,"foc")
		if( this.panelShowing&&event.target===window) {
			this.infoPanel.showPopup(null,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip")
		}
	},
	
	//catchNodes
	$:[],
	suspendMouse:function(){
		if(this.l1){
			this.topNode.removeEventListener('mousemove', this.l1, true);
			this.l1=null;
			
			this.$.unshift(this.historyA[0])
			if(this.$.length>20)
				this.$.pop()
		}else{
			this.topNode.addEventListener('mousemove', this.l1=function(e){slf.mouseMoveListener(e)}, true);
		}
	},
	//
	mouseMoveListener: function(event) {
		this.infoPanelBo.moveTo(event.screenX+10,event.screenY+10)
		if(event.originalTarget!=this.historyA[0])
			this.advanceLight(event.originalTarget,"lime")
		//if(event.originalTarget!==event.target)
		//	this.setLight(event.target,"blue")
	},

	
	keydownListener: function(event) {
	//evs[event.type]=event
		if(event.type==="keydown"){
			var obj=this.historyA[0]
			switch(event.keyCode){
				case KeyEvent.DOM_VK_F1       :this.finish();obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD4  :this.historyBack();obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD6  :this.historyForward();obj=null;break;
				case KeyEvent.DOM_VK_SPACE    :
				case KeyEvent.DOM_VK_NUMPAD0  :this.suspendMouse(obj);obj=null;break;
				case KeyEvent.DOM_VK_RETURN   :if(!event.altkey)break;
				case KeyEvent.DOM_VK_NUMPAD7  :this.openDOMInspector(obj);obj=null;break;
				case KeyEvent.DOM_VK_NUMPAD8  :this.openFirebug(obj);obj=null;break;
				case KeyEvent.DOM_VK_C        :if(!event.altkey)break;
				case KeyEvent.DOM_VK_NUMPAD9  :this.copySelector(obj);obj=null;break;

				case KeyEvent.DOM_VK_RIGHT    :if(!event.ctrlkey)break;
				case KeyEvent.DOM_VK_NUMPAD3  :obj=this.toRight(obj);break;
				
				case KeyEvent.DOM_VK_LEFT     :if(!event.ctrlkey)break;
				case KeyEvent.DOM_VK_NUMPAD1  :obj=this.toLeft(obj);break;
				
				case KeyEvent.DOM_VK_UP       :if(!event.ctrlkey)break;
				case KeyEvent.DOM_VK_NUMPAD5  :obj=obj.parentNode;break;
				
				case KeyEvent.DOM_VK_DOWN     :if(!event.ctrlkey)break;
				case KeyEvent.DOM_VK_NUMPAD2  :obj=this.toDown(obj);break;
				default:return
			}
			if(obj)
				this.advanceLight(obj)
			//
			event.stopPropagation()
			event.preventDefault()

		}else if([32,13,39,37,38,40,67].indexOf(event.keyCode)>0){
			event.stopPropagation()
			event.preventDefault()
		}
		

		//ev=event.target
		//ev1=event.originalTarget
		//alert("e")
	},
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
	/////
	history : {},
	//
	copySelector:function(object){
		var name=object.tagName
		if(object.id)
			name+="#"+object.id		
		if(object.className)
			name+="."+object.className.replace(" ",".")
		const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);  
		gClipboardHelper.copyString(name);  
	},
	selectorForObject:function(object){
		var name=object.tagName
		if(object.id)
			name+="#"+object.id		
		if(object.className)
			name+="."+object.className.replace(" ",".")
		return name;
	},
	
	//panel
	showPanel:function(){
		if( this.infoPanel.state==="open") {
			return;
		} else {
			//this.infoPanelBo=this.infoPanel.boxObject.QueryInterface(Components.interfaces.nsIPopupBoxObject);
			this.panelShowing=true
			this.infoPanelBo.showPopup(null,this.infoPanel,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip",null,null)
		}
	},
	
	fillPanel:function(object) {
		if(this.infoPanel.state!=="open")
			this.showPanel()
		//this.infoPanel.removeChild(this.infoPanel.firstChild)
		//this.infoPanel.firstChild.textContent=""
		var container=this.infoPanel
		if(container.firstChild)
			container.removeChild(container.firstChild)
		/*if(container.firstChild)
			container.removeChild(container.firstChild)*/
		var name=object.tagName
		if(object.id)
			name+="#"+object.id		
		if(object.className)
			name+="."+object.className.replace(" ",".")
		var item=document.createElementNS("http://www.w3.org/1999/xhtml","div")
		item.textContent=name
		container.appendChild(item)
		
		/*name=["..."]
		var par=object.parentNode		
		if(par)
			name[2]=par.tagName
		par=par.parentNode
		if(par)
			name[1]=par.tagName
		var item=document.createElementNS("http://www.w3.org/1999/xhtml","div")
		item.textContent=name.join("/")+"/"
		container.appendChild(item)*/


		/*var attrs=object.attributes
		for(var i=0;i<attrs.length;i++){			
			var item=document.createElement("div")
			item.textContent=attrs[i].name+" = "+attrs[i].value
			container.appendChild(item)
		}*/
	},

	hidePanel:function() {		
		this.panelShowing=false
		this.infoPanel.hidePopup()
	},
	
	//domI
	openDOMInspector: function(aNode) {
		if(!this.windowsMediator)
			this.windowsMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		//var aWin = this.windowsMediator.getMostRecentWindow("dom:inspector");	
		var aWin=this.DOMIWin
		if (!aWin||aWin.closed){
			this.DOMIWin=""
			var fWins=this.windowsMediator.getEnumerator('')
			while(fWins.hasMoreElements()) {
				aWin= fWins.getNext()
				if(aWin.document.documentURI==="chrome://inspector/content/inspector.xul"){
					this.DOMIWin=aWin
					break;
				}
			}
			aWin=this.DOMIWin
		}
		if(!aWin){
			this.DOMIWin=window.openDialog("chrome://inspector/content/", "", "chrome,all,dialog=no", aNode);
			this.DOMIWin.document.documentElement.setAttribute("windowtype","dom:inspector")
		}else{			
			aWin.inspector.mInitTarget=aNode
			aWin.inspector.initViewerPanels()
			aWin.inspector.getViewer('dom').selectElementInTree(aNode)
			//subject
			aWin.focus();			
		}
	},

	openFirebug: function(aNode){
		Firebug.Inspector.inspectFromContextMenu(aNode)
	},
	//		
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
		dump(obj)
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
	
	

	//realLight
	setLight:function(obj,color) {
		this.history.oldoutline1=obj.style.outline;
		this.history.oldoutline2=obj.style.outlineOffset;
		this.history.oldoutline3=obj.style.MozOutlineRadius;
		obj.style.outline="2px lime solid"
		obj.style.outlineOffset="-2px"
		obj.style.MozOutlineRadius="2px"
	},

	unLightElement: function(obj) {
		if( obj) {
			obj.style.outline =this.history.oldoutline1;
			obj.style.outlineOffset =this.history.oldoutline2;
			obj.style.MozOutlineRadius=this.history.oldoutline3
			if(!obj.getAttribute("style"))
				obj.removeAttribute("style");
		}
	}
	/**slightly faster but discards changes	
	lightStyle="outline: 2px solid lime; outline-offset: -2px; -moz-outline-radius: 2px 2px 2px 2px;"
	setLight:function(obj,color) {
		this.history.oldstyle=obj.hasAttribute("style")? obj.getAttribute("style"):"";		
		obj.setAttribute("style",this.history.oldstyle+this.lightStyle)
	},

	unLightElement: function(obj) {
		if(!obj)
			return;
		if( this.history.oldstyle) {
			obj.setAttribute("style",this.history.oldstyle)
		}else{
			obj.removeAttribute("style");
		}
	},
	safelyUnLightElement: function(obj) {
		if(!obj)
			return;
		var os=this.history.oldstyle
		//var ns=
		//if(os.replace(/[^;]*outline[^;]+;/g,"")==)
		
		if( os) {
			obj.setAttribute("style",os)
		}else{
			obj.removeAttribute("style");
		}
	}
	
	*/
	//
}

     //   shadia.start()


shadowInspector.contaminate()	 
function lolChangeStat() {
	shadia.toggle()
	var  lolButtonImg = document.getElementById("lolButtonImg");
	if(lolButtonImg){
		lolButtonImg.src=shadia.on?"chrome://linspect/skin/lola2.gif":"chrome://linspect/skin/lola.gif"
	}
}


window.addEventListener('load', init, true);

// Globals
var _document;
var lolOn;

var lolButtonImg;

// Initialize globals and others
function init() {
	removeEventListener('load', arguments.callee, true);

    var lolButton = document.getElementById("lolButton");
    lolButton.addEventListener('click', lolClick, false);
    var lolButtonImg = document.getElementById("lolButtonImg");
    //lolButtonImg.src="chrome://linspect/skin/loloff.gif";
    lolButtonImg.src="chrome://linspect/skin/lola.gif";
}




function lolClick(event) {
    lolChangeStat();
}

/*g=document.createElement("div")
g.setAttribute("id","lop")
g.textContent="ooooooooo"
document.documentElement.appendChild(g)* /
g=document.getElementById("lop")
//g.innerHTML=""


/*
l1=Date.now()
for(i=0;i<500;i++){
t=document.createElement("div")
t.setAttribute("id","lop"+i)
t.textContent="ooooooooo"+i
g.appendChild(t)
}
Date.now()-l1
/**/
/*
l1=Date.now()
var t=[]
for(i=0;i<500;i++){
t[i]="<div id='lop"+i+"'>ooooooooo"+i+"</div>"
}
t.concat()
g.innerHTML=t
Date.now()-l1/** /



/** /
l1=Date.now()
t=g.firstChild
for(i=1;i<g.children.length;i++){
t=t.nextSibling
t.setAttribute("id","lop"+i)
t.textContent=i+"ooofofooo"+i

}
Date.now()-l1
/**/

/**
test
*/
/*l1=Date.now()
for(i=0;i<10000;i++){
document.getElementById("toolbar-menubar").getElementsByAttribute()
document.getElementById("toolbar-menubar").attributes[1]
}
Date.now()-l1
*/

/*l1=Date.now()
for(i=0;i<10000;i++){
//document.querySelector("toolbar#toolbar-menubar.chromeclass-menubar")
document.getElementById("toolbar-menubar").parentNode.getElementsByAttribute("toolbarname","Menu Bar")

}
Date.now()-l1*/


/*l1=Date.now()
m=document.getElementById("toolbar-menubar")
for(i=0;i<10000;i++){
m.setAttribute("style","outline: 2px solid lime; outline-offset: -2px; -moz-outline-radius: 2px 2px 2px 2px;")

}
Date.now()-l1
*/

/*l1=Date.now()
m=document.getElementById("toolbar-menubar")
for(i=0;i<10000;i++){

m.style.outline="2px blue solid"
m.style.outlineOffset="-2px"
m.style.MozOutlineRadius="20px"

}
Date.now()-l1*/

/*m=document.getElementById("urlbar")
m.setAttribute("style","outline: 20px solid blue; outline-offset: -2px; -moz-outline-radius: 2px 20px 2px 20px; border: 5px solid red; padding: 5px 2px; margin: 2px 8px; background-color: red; -moz-border-top-colors: gainsboro red gray;")

m=document.getElementById("toolbar-menubar").parentNode
st={}*/

/*l1=Date.now()

for(i=0;i<1000;i++){
st=m.getAttribute("style")
m.setAttribute("style",st+"outline: 2px solid lime; outline-offset: -2px; -moz-outline-radius: 2px 2px 2px 2px;")
m.setAttribute("style",st)
}
"m1 "+(Date.now()-l1)*/
/*
l1=Date.now()

for(i=0;i<1000;i++){
st.o1=m.style.outline;
st.o2=m.style.outlineOffset;
st.o3=m.style.MozOutlineRadius;

m.style.outline="2px blue solid"
m.style.outlineOffset="-2px"
m.style.MozOutlineRadius="20px"

m.style.outline=st.o1
m.style.outlineOffset=st.o2
m.style.MozOutlineRadius=st.o3
}
"m2 "+(Date.now()-l1)*/

/*"88outline: 20px solid blue; outline-offset: -2px; -moz-outline-radius: 2px 20px 2px 20px; border: 5px solid red; padding: 5px 2px; margin: 2px 8px; background-color: red; -moz-border-top-colors: gainsboro red gray;".replace(/outline([!;])+;/,"")*/



/*.replace(/[^;]*outline[^;]+;/g,"")*/



/***dom interfaces


var req = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor);  
utils = req.getInterface(Components.interfaces.nsIDOMWindowUtils);  
t=Date.now()
for(i=1;i<1000;i++)
document.commandDispatcher.focusedWindow
t-Date.now()
utils 

XPCU={
getService: function (aURL, aInterface) {
    try {
        return Components.classes[aURL].getService(Components.interfaces[aInterface]);
    } catch (ex) {
        dump("Error getting service: " + aURL + ", " + aInterface + "\n" + ex);
        return null;
    }
},
createInstance: function (aURL, aInterface) {
    try {
        return Components.classes[aURL].createInstance(Components.interfaces[aInterface]);
    } catch (ex) {
        dump("Error creating instance: " + aURL + ", " + aInterface + "\n" + ex);
        return null;
    }
},
QI: function (aEl, aIName) {
    try {
        return aEl.QueryInterface(Components.interfaces[aIName]);
    } catch (ex) {
        throw "Unable to QI " + aEl + " to " + aIName;
    }
}
}
XPCU.getService("@mozilla.org/inspector/dom-utils;1", "inIDOMUtils")

*/

