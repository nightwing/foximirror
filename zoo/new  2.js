infoTooltip = {
	createInfoPanel: function(){
		this.infoPanel=document.createElement("tooltip")
		this.infoPanel.id='shadiaInfoTip'
		//this.infoPanel.style.MozBinding='url()'
		this.infoPanel.style.MozAppearance="panel"
		this.infoPanel.setAttribute('onmousemove','this.hidePopup()')
		document.documentElement.appendChild(this.infoPanel)
		this.infoPanel.setAttribute("noautohide",true)
		this.infoPanelBo=this.infoPanel.popupBoxObject//boxObject.QueryInterface(Components.interfaces.nsIPopupBoxObject);

	},
	handleEvent: function(event){
		this.infoPanelBo.moveTo(event.screenX+10,event.screenY+10)
		if(event[this.targetType]!=this.historyA[0])
			this.advanceLight(event[this.targetType],"lime")
	},	
	fillPanel:function(text){
		if(this.infoPanel.state!=="open")
			this.showPanel()
		var container=this.infoPanel
		var item = container.firstChild;
		if(!item){
			item=document.createElementNS("http://www.w3.org/1999/xhtml","div");
			container.appendChild(item);
		}		
		item.textContent=text
	},
	watchNode: function(){
		
	},	
}