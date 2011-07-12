/*************************************
 *
 *
 ************************************************/
 Components.utils.import("resource://gre/modules/Services.jsm");
 
 function onLoad(){
	codebox=document.getElementById('plainCode')
	var a=window.location.href
	a=a.slice(0, a.lastIndexOf('/')+1)
	var prefData=makeReq(a+'prefData.txt')
	prefData = prefData.replace(
		"extensions.checkCompatibility.3.6", 
		'extensions.checkCompatibility.'+Services.appinfo.version.replace(/([a-z])\d+$/,'$1')
	)
	codebox.value=prefData
	builder.doBuild()
	content.document.body.innerHTML=buffer.join('')
	infotip.start(content)
	content.document.body.addEventListener('click',onClick,false)
}
 
 function onClick(e){
	var target=e.target
	if(target.className=='prefToggle'){
		var id=getAncestorId(target)[0]
		res=builder.results[id]
		if(res.value==res.currentValue){
		   clearPref(res.name)
		}else{
		   setPref(res.name,res.value)
		}
		builder.doBuild()
		content.document.body.innerHTML=buffer.join('')
	}
 }
 function onUnload(){
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
infotip={
	
	toggle:function(){
		if(this.on){
			this.finish()
		}else{
			this.start()
		}
	},
	start: function(window){	
		if(!this.infoPanel)
			this.createInfoPanel()
		
		this.finish()
		this.light="lime"
		var self=this
		this.l1 = function(e){self.mouseMoveListener(e)}
		window.addEventListener('mousemove', this.l1 , true);	
	},

	finish: function(){
		if(!this.on)
			return;
		this.on=false;
		
		window.removeEventListener('mousemove',  this.l1,  true);

		this.hidePanel()
		this.unLightElement(this.historyA[0]);
		if(this.allWinsStarted)shadowInspector.allWindowsSelect(false)
		//delete history
		this.historyA=new Array(20);this.historyB=[]
	},

	createInfoPanel: function(){
		this.infoPanel=document.createElement("tooltip")
		this.infoPanel.id='infoTip'
		//this.infoPanel.style.MozBinding='url()'
		this.infoPanel.style.MozAppearance="panel"
		this.infoPanel.setAttribute('onmousemove','this.hidePopup()')
		document.documentElement.appendChild(this.infoPanel)
		this.infoPanel.setAttribute("noautohide",true)
		this.infoPanelBo=this.infoPanel.popupBoxObject//boxObject.QueryInterface(Components.interfaces.nsIPopupBoxObject);
		
	},

	mouseMoveListener: function(event){
		this.infoPanelBo.moveTo(event.screenX+10,event.screenY+10)
		if(event.target!=this.currentTarget){
			var id=getAncestorId(event.target)[0]
			var res=builder.results[id]
			this.fillPanel(res)
		}
	},
	
	//panel
	showPanel:function(){
		if(this.infoPanel.state==="open"){
			return;
		}else{
			//this.infoPanelBo=this.infoPanel.boxObject.QueryInterface(Components.interfaces.nsIPopupBoxObject);
			this.panelShowing=true
			this.infoPanelBo.showPopup(null,this.infoPanel,this.infoPanelBo.screenX, this.infoPanelBo.screenY, "tooltip",null,null)
		}
	},
	
	fillPanel:function(el){
		if(!el){
			this.hidePanel()
			return
		}
		if(this.infoPanel.state!=="open")
			this.showPanel()
		var container=this.infoPanel
		var item = container.firstChild;
		if(!item){
			item=document.createElementNS("http://www.w3.org/1999/xhtml","div");
			container.appendChild(item);
		}
		//container.removeChild(container.firstChild)	
		
		//
		item.textContent=el.currentValue
	},

	hidePanel:function() {		
		this.panelShowing=false
		this.infoPanel.hidePopup()
	},
    
}
 //builder.results[0].currentValue
/*************************************
 *
 *
 ************************************************/ 
 
function findHelp(){ 
	openUILink('http://kb.mozillazine.org/About:config_entries')
	gFindBar.startFind(gFindBar.FIND_NORMAL)
	gFindBar._findField.value='true'
	gFindBar._find('true')
}
 //http://kb.mozillazine.org/Security.fileuri.strict_origin_policy
 //http://kb.mozillazine.org/About:config_entries
 
 
 
 /************************************
  *
  *
  *********************************/

var builder={}
builder.out=function(line){
	var n=line.length
	if(line[n-1]!='{')
		buffer.push('<div class="prefdescription">', line, '</div>')
	else{
		buffer.push('<div class="prefgroup">',
			'<div class="prefTitle"><span>', line.slice(0,-1),
			'</span><opener>{</opener></div>','<div class="prefBody">'
		)
		this.state='in'
	}
}
builder.in=function(line){	
	if(line=='}'){
		buffer.push('</div><div class="prefEnd"><opener>}</opener></div>')
		this.state='out'
		return
	}
	
	var match = /\([^\)]*\)/.exec(line);
	var pref = match && match[0]
	if(pref){
		var i = match.index + pref.length
		var descr = line.substr(i)
		dump(match.index, pref.length, i, descr)
		
		var result = eval('builder.getPref'+pref), val = result.value;
		var index = builder.results.length;
		builder.results.push(result)
		
		
		buffer.push('<div class="pref" id="'+index+'">',
			'<span class="prefToggle"',
			val == result.currentValue? 'checked="true"': '',
			'>&gt;&gt;&gt;</span>( "<span class="prefname">', result.name,
			'</span>", <span class="prefval">', typeof val =='string'? val.quote(): val.toString() , '</span>)'
		)
		if(descr){
			result.descr=descr
			buffer.push('<span class="prefdescription">', descr, '</span>')
		}
		buffer.push('</div>')	
	}else{
		buffer.push('<div class="prefdescription">', line, '</div>')		
	}		
}
builder.getPref = function(name, value){
	var curVal=getPref(name)	
	return {name:name, value:value, currentValue:curVal}
}
builder.doBuild = function(name, value){
	builder.results=[]
	builder.state='out'
	buffer=[]
	var lines=codebox.value.split('\n')
	for each(var l in lines){
		l=l.trim()
		this[this.state](l)
	}
}



