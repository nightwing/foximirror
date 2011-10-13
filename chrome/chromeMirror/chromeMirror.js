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
	getContextMenuItems: function(_, target){
        var items = []
			
		/* mAddonData.addon.userDisabled = true
		mAddonData.addon.pendingOperations == AddonManager.pen
		mAddonData.disabled = true */

        items.push({
                label: "copy name",
                command: function() {
					var i = self.getSelectedItem()
                    gClipboardHelper.copyString(mAddonData.name);
                },
            },'-'
		)
		if(mAddonData.addon)
			items.push({
                label: "enabled",
				checked: !mAddonData.addon.userDisabled && !mAddonData.addon.appDisabled, // &&  mAddonData.addon.pendingOperations != 2 // AddonManager.PENDING_DISABLE						
				type: "checkbox",
                command: function() {
					mAddonData.disabled = 
					mAddonData.addon.userDisabled =
					mAddonData.addon.appDisabled = !this.getAttribute('checked')
					
					mAddonData.cellProp = mAddonData.disabled?'disabled':''
					addonViewer.tree.treeBoxObject.invalidate()
                }
            },{
                label: "register chrome",
                command: function() {
                    registerChromeLocation(mAddonData.file)
                },
            })
		items.push({
			label: "reveal",
			command: function() {
				mAddonData.file.QueryInterface(Ci.nsILocalFile).reveal()
			},
		})
        return items;
	},
	


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
		
		this.tree.ownerPanel = this
		
		this.search = new treeUtils.searchBox("addonViewer-search", this)
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
		mAddonData=this.view.visibleData[i]
		
		//viewDoc.body.textContent=this.mode=='chrome'?chromePaths[i].name:''
		if(this.mode=='chrome'){
			dirViewer.setDir(chromePaths[i].spec)
			dirViewer.select(-1)
		}else{
			dirViewer.setDir(mAddonData.file)
			dirViewer.select('chrome.manifest')||dirViewer.select('install.rdf')||dirViewer.select(-1)
		}
	},
	getDirData:function(file){
		getDirDisplayData(getDirEntries(this.view.visibleData[i].file))
	},
	
	//sort
}
	initializeables.push(addonViewer)
   //***************************************************
  //* 
 //******/

dirViewer={
	getContextMenuItems: function(_, target){
        var items = []
		var self = this
		var uri = getCurrentURI()
		var isJar = uri.slice(0,3) == 'jar'
		var isJarJar = isJar && uri.slice(4,7) == 'jar'
		
        items.push({
                label: "copy name",
                command: function() {
					var i = self.getSelectedItem()
                    gClipboardHelper.copyString(i.name);
                },
            }, {
                label: "rename",
                command: function() {
					var i = self.getSelectedItem()
					var name = i.name
					var newName = prompt('enter new name', name)
					if(!newName || newName == name)
						return
                    renameLocaleUri(getCurrentURI(), newName);
					self.reload()
                },
				disabled: isJar
            },'-',{
                label: ("delete"),
                command: function() {
					var lamb4Slaughter = getCurrentURI()
					if(Services.prompt.confirm(
						window,
						"deleting file can't be undone",'do you really want to permanently delete '
						+ decodeURIComponent(lamb4Slaughter)
					)){
						deleteLocaleUri(lamb4Slaughter);
						self.reload()
					}
                },
				disabled: isJarJar
            }, "-", {
                label: ("launch"),
                command: function() {
                    getCurrentFile().launch()
                },
            },{
                label: ("reveal"),
                command: function() {
                    getCurrentFile().reveal()
                },
            },"-",{
                label: "edit",
                command: function() {
                   npp1();
                }
            }
        );
		
		
		if(isJarJar)
			var archiveUri = null
		else if(isJar)
			var archiveUri = uri
		else if(/\.(jar|xpi|zip)/.test(uri))
			var archiveUri = 'jar:'+uri+'!/'
		
		if(archiveUri)
			items.push({
				label: "extract",
				command: function(){
					// $shadia.extractRelative(Services.io.newURI(archiveUri, null, null), false).file
					var file = getLocalFile(archiveUri)
					var dir = file.parent
					// do not add junk into extensions folder firefox doesn't like it
					if (dir.leafName == 'extensions'){
						dir = dir.parent
						dir.append('extensions.unjarred')
					}
					dir.append(file.leafName.slice(0,-4))
        
					extractFiles(file, dir)
        
					dir.QueryInterface(Ci.nsILocalFile).reveal()				
				}
			})
		
		

        return items;
	},
	
	
	initialize: function(){
		this.tree=document.getElementById('dirViewer')
		this.view=new simpleView()
		var b = document.getElementById('dirViewerButtons')
		this.backButton = qs('[aID=back]', b)
		this.forwardButton = qs('[aID=forward]', b)
		
		this.tree.ownerPanel = this
	},
	activate: function(){		
		this.view.data=this.data
		this.tree.view=this.view
	},
	onSelect: function(){
		var i = this.tree.currentIndex
		var data = this.data[i] || this.currentDir
		slateViewer.onSelect(data)
	},
	ondblclick: function(event){dump(this)
		if(event.button!=0)return
		var i=this.tree.currentIndex
		var dir=this.data[i]
		if(dir.dirType!=2)
			this.setDir(dir)
	},
	setDir: function(dir, force){
		if(this.data && !force)
			this.addState()

		
		if(dir instanceof Ci.nsIFile)
			dir = getURLSpecFromFile(dir)
		
		if(typeof dir=='string')
			this.currentDir = dirObjFromSpec(dir)
		else 
			this.currentDir = dir
		
		if (this.currentDir.dirType == 2){
			this.up()
		} else {
			this.data = getDirEntries(this.currentDir)
			this.activate()
		}
	},
	
	up: function(){
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

			this.setDir(dirObjFromSpec(spec))
		}
		this.select(curName)
	},
	select: function(selector){
		if (typeof selector == 'number') {
			var i = selector
		} else {
			var obj = this.data
			for(var i = 0; i < obj.length; i++) {
				if(obj[i].name == selector)
					break			
			}
			if (i == obj.length)
				return false
		}
		
		if (i == this.tree.currentIndex)
			this.onSelect()
		else
			this.tree.view.selection.select(i)
		if (i!=-1)
			this.tree.treeBoxObject.ensureRowIsVisible(i)
		
		return true //success
	},
	getType: function(ext){
		"xul,css,xhtml,xml,jsm,manifest,ini,ahk,locale,dtd,properties".indexOf(dirViewer.data[1].extension)>-1
		"png,jpg,giff,jpeg,ico"
	},
	
	getSelectedItem: function(){
		var i = this.tree.currentIndex
		return (dirViewer.data && dirViewer.data[i]) || dirViewer.currentDir
	},
	/*****************************************/
	showAll: function() {
		this.select(-1)
	},
	history: [],
	index: 0,
	addState: function() {
		var cs = this.history[this.index-1]
		if(cs && cs.spec == this.currentDir.spec)
			return

		this.forwardButton.disabled = true
		this.backButton.disabled = false

		var state = {
			dir: this.currentDir,
			childData: this.data,		
			selectedIndex: this.tree.currentIndex,
			topRow: this.tree.treeBoxObject.getFirstVisibleRow()
		}
				
		this.history.splice(this.index, this.history.length - this.index, state)
		this.index++;
		
		if(this.history.length > 100){
			this.historyA.shift()
			this.index--
		}
	},
	back: function() {
		this.index--;
		var state = this.history[this.index]
		
		this.forwardButton.disabled = false
		if (this.index == 0) {
			this.backButton.disabled = true
		}
		this.restoreState(state)		
	},
	forward: function(){
		this.index++;
		var state = this.history[this.index]
		this.backButton.disabled = false
		if (this.index == this.history.length - 1) {
			this.forwardButton.disabled = true
		}
		this.restoreState(state)
	},
	restoreState:function(state){
		this.currentDir = state.dir
		this.data = state.childData
		this.activate()
		this.tree.view.selection.select(state.selectedIndex)
		this.tree.treeBoxObject.scrollToRow(state.topRow)
	},
	
	reload: function(){
		this.setDir(this.currentDir, true)
	}
}
	initializeables.push(dirViewer)

getCurrentURI = function(){
	var i=dirViewer.tree.currentIndex
	var data = (dirViewer.data && dirViewer.data[i]) || dirViewer.currentDir || addonViewer.data[0].file
	return data.spec || getURLSpecFromFile(data)
}
getCurrentFile = function(){
	return getLocalFile(getCurrentURI())
}
 
getCurrentline = function(){
	return slateViewer.getLine()
}

gModes={
	re: 'viewSource'
}
gMode='code'
slateViewer={
	initialize:function(){
		gURLBar = this.urlbar = document.getElementById('urlbar')
		this.deck = document.getElementById('slateDeck')
		this.dirViewBrowser = document.getElementById('dirView')
		this.aceBrowser = document.getElementById('ace')
		this.fileBrowser = document.getElementById('file')
		viewDoc = this.dirViewBrowser.contentDocument

	},
	//***** ace specific
	setAce: function(data){
		this.deck.selectedIndex = 2
		var a = this.aceBrowser.contentWindow.wrappedJSObject
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
		
		var i = getAttr(node, 'slateid')[0]
		if(node.nodeName && i){
			if(event.button==0)
				this.onSelect(this.data[i])
		}
	},
	onSelect:function(data){
		var uri, ans, dataIndex = 0, mode = 'view-source'
		function isImage(a){
			return a.extension && 'gif,png,jpeg,jpg,ico'.indexOf(a.extension) > -1
		}
		function getImage(a){var ans='<div class="img" slateid='+dataIndex+'>'+
			(isImage(a)?'<img src="'+a.spec+'"/><a class=h >'+a.name
					   :'<img src="'+a.iconURL.replace(/\d+$/,'128')+'"/><a>'+a.name
			)+'</a></div>'
			dataIndex++
			return ans
		}
		
		var useAce = false, livePreview = false
		
		if (!data){//---------------------------show current dir
			this.data = dirViewer.data;
			this.currentDir = dirViewer.currentDir
			var a = this.data.map(getImage)
			ans='<al>'+a.join(',')+'<al>'
			mode = 'view-dir'
		} else if(data.dirType < 2){//---------------------------show directory internals
			this.data=getDirEntries(data);
			this.currentDir=data
			var a=this.data.map(getImage)
			ans='<al>'+a.join(',')+'<al>'
			mode = 'view-dir'
		} else if(!data.extension){//----------------------------------no extension
			useAce = true
		} else if('exe,dll,xpt,gz,tar,mar,lnk,msi,flv,sqlite,dmg'.indexOf(data.extension)>-1){//---------------------------show exe
			let uri='moz-icon://'+data.spec+'/?size=128'
			ans='<div><img src="'+uri+'"></img><span>'+data.name+'</span><div>'			
		} else if(isImage(data)){//---------------------------show only images
			var alldata = this.data = dirViewer.data//.map(getImage)
			var l = alldata.length	
			ans='<div class=header><div class=img><img src="'+data.spec+'"/><span>'+data.name+'</span></div></div>'			
			for(var j=0;j<l;j++){
				var data1 = alldata[j]
				if(isImage(data1)){
					ans += getImage(data1)
				}
				dataIndex++
			}
			ans='<al>'+ans+'</al>'
		} else
			useAce = true
		
		
		if(useAce){//---------------------------show file
			this.data = [data]
			if (gMode == 'code') {
				this.setAce(data)
			}else
				livePreview = true
		} else		
			this.setDir(ans)
		
		
		var chromeUri = gChromeMap.getAliasList(data.spec)[0]
		var addonUri = gChromeMap.getAliasList(data.spec)[0]
		
		
		
		if(livePreview){
			if (gMode == 'view')
				var uri = chromeUri
			else if (gMode=='viewSource')
				uri = chromeUri
			else
				uri = data.spec
			
			this.deck.selectedIndex = 1
			try{
				this.fileBrowser.contentWindow.location = uri
			}catch(e){
				try{
					this.fileBrowser.contentWindow.location = data.spec
				}catch(e){
					Components.utils.reportError(e)
				}
			}
		}
		
		
		this.urlbar.value = decodeURIComponent(chromeUri)
	},
	
}
	initializeables.push(slateViewer)
 

urlbarPopup = {
	showDetails: function(popup){
		var uri = getCurrentURI()
		var file = getLocalFile(uri)
		var data = [
			uri,
			file.path,
			gAddonMap.getAliasList(uri)[0],
			gChromeMap.getAliasList(uri)[0],
			"",
			file.fileSize+"kb",
			new Date(getLocalFile(uri).lastModifiedTime)
		].join("\n")
		popup.querySelector("textbox").value = data
	}
}
/*

//addonViewer.data[1].addon.userDisabled = true



fi=getCurrentFile()

var st=slateViewer.aceBrowser.contentWindow.wrappedJSObject.doc.toString()

writeToFile(fi, st)

Services.chromeReg.checkForNewChrome()







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


/*******************************************************/
/*          */
/*          */
/*          */
/** normal **/
//contentType = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService).getTypeFromFile(i.file)

 
 
