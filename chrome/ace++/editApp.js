define('fbace/editApp', function(require, exports, module) {

window.editApp = exports
exports.showImage = function(data) {
	if(!this.iframe){
		this.iframe = document.createElement('iframe')
		document.body.appendChild(this.iframe)		
	}
	this.iframe.style.display = ''
	this.iframe.style.position='absolute'
	this.iframe.style.width='100%'
	this.iframe.style.height='100%'
	this.iframe.style.background='white'
	this.iframe.style.zIndex='1000'
	
	this.iframe.setAttribute('src', 'view-source:'+data.href)
	
	this.isOpen = true
	
};
exports.hide = function(data) {
	if(!this.iframe){
		return
	}
	this.iframe.style.display = 'none'
	
	this.isOpen = false
};

// Firebug.Ace.win1.imageViewer.showImage

});

Cc=Components.classes
Ci=Components.interfaces
/*location.assign('edit:about:support')//='s'*/
function doURICommand(command){
	gCommand=''
	command.split(';')
}
function $(x)document.getElementById(x)
var req = new XMLHttpRequest, reqUITimeout, gFixupURI={spec:'empty1'};
//req.onerror=alert
req.onload = function(){
	stopReq('noAbort')
	var val = req.responseText;
	var uri = req.channel.name
	var mime = req.getResponseHeader('Content-Type')
	if(uri[uri.length-1]=='/' && uri.search(/^(file|jar):/)==0){
		// directory listing =============================================================================
		var a = val.split('\n')
		var dmax=0,d=[]
		for(var i = 0; i < a.length; i++){
			var str = a[i]
			if(!str){
				d[i]=0        
				continue
			}
			str = str.trim().replace(' ','\t','g')
			var b = a[i] = decodeURIComponent(str).split('\t')
			if(!b[2]) {
				d[i]=0        
				continue
			}
			d[i] = b[1].length + b[2].length
			if (d[i] > dmax)
				dmax = d[i]
		}
		//special row
		a[1][3] += Array(17).join(' ')
		for(i=0;i<a.length;i++){
			if(!a[i])
				continue
			if(a[i][2])
				a[i][1] += Array(dmax-d[i]+4).join('\xA0')
			a[i]=a[i].join('\xA0\xA0\xA0\xA0')
		}
		val = a.join('\n')

		//directory listing =============================================================================
		var s = createSession(val, uri, mime)
		s.mimeType = 'file-listing'
	}else
		var s=createSession(val, uri, mime)
	editor.setSession(s)
	doURICommand(gCommand)
}
function stopReq(noAbort) {
	noAbort || req.abort()
	clearTimeout(reqUITimeout)
	$('reqUI').style.display='none'
}
function showReqUI() {
	var st = $('reqUI').style
	st.display='block'
	st.position='absolute'
}
function startAsyncReq(href) {
	stopReq()
	//req.overrideMimeType("text/plain");	
	req.open("GET", href, true);
	reqUITimeout = setTimeout(showReqUI,200)
	try {
		req.send(null);
	} catch (e) {
	}
	
}

window.setLoacation = function(spec){
	if(!spec)
		return false
	var fu = Cc["@mozilla.org/docshell/urifixup;1"]
		.getService(Ci.nsIURIFixup).createFixupURI(spec, null)
	if(fu.spec==gFixupURI.spec)//already loaded
		return false
	gFixupURI = fu
	startAsyncReq(gFixupURI.spec)
}

window.onhashchange=function locationHashChanged() {
	var uri = location.href
	var i = uri.indexOf('#')
	if(i<0)
		uri = ''
	var j = uri.lastIndexOf('##')
	if(j<0){
		j = uri.length
	}
	gPageLocation = uri.substring(i+1,j)
	gCommand = uri.substr(j+2)
	setLoacation(gPageLocation) || doURICommand(gCommand)
}
window.onhashchange()

// context menu
var contextMenuActions = {}
window.addEventListener('contextmenu', function(e){
	if(e.button==2){
		e.preventDefault();e.stopPropagation()
		var cmb = $('contextMenuBack'),
			cm = $('contextMenu');
		cmb.style.display='block'
		var items = getContextMenuItems(), html =[];
		contextMenuActions = {}
		for(var i=items.length;i--;){
			var item = items[i]
			if(item == '-'){
				html.unshift('<separator></separator>')
				continue;
			}
			html.unshift(
				'<menuitem ', item.disabled?'disabled="true"':'', '>',
					item.label,
				'</menuitem>'
			)
			contextMenuActions[item.label] = item.command
		}
		cm.innerHTML = html.join('')
		var b1 = cmb.getBoundingClientRect(), b2 = cm.getBoundingClientRect(),
			left = e.clientX, top = e.clientY;
		
		if(b2.height+top>b1.height){
			top = top-b2.height-2
			if(top<0)top=0
		}
		if(b2.width+left>b1.width){
			left = left-b2.width-2
			if(left<0)left=0
		}
			
		cm.style.left = left+1+'px'
		cm.style.top = top+1+'px'
		window.addEventListener('mousedown',closeContextMenu,true)
	}
},true)
closeContextMenu = function(e){
	var t =e.target
	if(t.id=='contextMenu')
		return
	
	if(t.nodeName.toLowerCase()=='menuitem'){
		var action = t.getAttribute('action')||t.textContent
		var stop = contextMenuActions[action]()
		if(stop)
			return
	}
	
	$('contextMenuBack').style.display='none'
	window.removeEventListener('mousedown',closeContextMenu,true)	
}
$('contextMenuBack').addEventListener('mousedown', function(e){
	if(e.target==this&&e.button!=2)
		this.style.display='none'
},true)



/***********************************************************/
getContextMenuItems = function() {		
	var items = [],
		clipBoardText = gClipboardHelper.getData(),
		editorText = editor.getCopyText(),
		self = this;

    items.push({
		label: "copy",
		command: function() {
			gClipboardHelper.copyString(editorText);
		},
		disabled: !editorText
    },{
        label: "cut",
        command: function() {
				gClipboardHelper.copyString(editorText);
				editor.onCut();
			},
			disabled: !editorText
	},{
		label: "paste",
		command: function() {
			editor.onTextInput(clipBoardText);
		},
		disabled: !clipBoardText
	},
		"-"
	,{
		label: "addToClipboard",
		command: function() {
			gClipboardHelper.copyString(clipBoardText+' '+editorText);
		},
		disabled: !editorText
    },
		"-"
	,{
		label: "load",
		command: function() {
			fileHelper.loadFile(editor);
		}
    },{
		label: "save",
		command: function() {
			fileHelper.saveFile(editor);
		}
    }	
    );
	if(editor.session.mimeType == 'file-listing')
		items.push('-')
		items.push({
			label: "open file",
			command: function() {
				var newUri = location.href
				if(editorText)
					newUri += editorText
				else {
					var row = editor.selection.getCursor().row
					var match = editor.session.getLine(row).match(/201\:\xA0*([^\xA0]*)/)
					if(match){
						newUri = newUri+match[1]
					}else
						newUri = ''
				}
				if(newUri)
					location.assign(newUri)
			}
		})
	return items
}

/***********************************************************/
var gClipboardHelper = {
    cbHelperService: Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper),

    copyString: function(str) {
        if(str)
            this.cbHelperService.copyString(str);
    },

    getData: function() {
        try{
            var pastetext,
                clip = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard),
                trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable),
                str={},
                strLength={};

            trans.addDataFlavor("text/unicode");
            clip.getData(trans,1);
            trans.getTransferData("text/unicode",str,strLength);
            str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
            pastetext = str.data.substring(0, strLength.value/2) || "";
            return pastetext;
        } catch(e) {
            Components.utils.reportError(e);
            return "";
        }
    }
};
/***********************************************************/

fileHelper = {	
	initFilePicker: function(session, mode){
		var ext = session.extension,
            fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker),
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
		if (mode == 'save')
			fp.init(window, 'saveas', Ci.nsIFilePicker.modeSave);
		else
			fp.init(window, "select a file", Ci.nsIFilePicker.modeOpen);
		
		if(ext)
			fp.appendFilter(ext, "*." + ext);
        fp.appendFilters(Ci.nsIFilePicker.filterAll);
		
		// try to set initial file
		if (session.filePath) try{
			file = ios.newURI(session.filePath, null, null)
			file = file.QueryInterface(Ci.nsIFileURL).file
			fp.displayDirectory = file.parent
			fp.defaultString = file.leafName
		} catch(e){}
		return fp
	},
	
	loadFile: function(editor) {
        var result, file, name, result, 
			session = editor.session, ext = session.extension,
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
        var fp = this.initFilePicker(session, 'open');
		
        result = fp.show();
		
        if( result == Ci.nsIFilePicker.returnOK) {			
            session.setValue(readEntireFile(fp.file))
			session.setFileInfo(ios.newFileURI(fp.file).spec);
        }
    },

    saveFile: function(editor) {
        var file, name, result, session = editor.session,
			ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService),
            fp = this.initFilePicker(session, 'save');

        result = fp.show();
        if(result == Ci.nsIFilePicker.returnOK) {
            file = fp.file;
            name = file.leafName;
			
            if(name.indexOf('.')<0) {
                file = file.parent;
                file.append(name + '.' + session.extension);
            }

            writeToFile(file, session.getValue());
			if(!session.filePath)
				session.setFileInfo(ios.newFileURI(file).spec);
        }
        else if(result == Ci.nsIFilePicker.returnReplace){
            writeToFile(fp.file, session.getValue());
			if(!session.filePath)
				session.setFileInfo(ios.newFileURI(file).spec);
        }
    },

};

/***********************************************************/





