//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;



var modernFox=!!Object.getOwnPropertyNames
/**============-=========-===============**/
if(!modernFox)//for old versions
	var getProps=function(targetObj){var t=Date.now()
		var data=[],x=targetObj.wrappedJSObject
		if(x){
			data.push({name:'wrappedJSObject', comName: 'wrappedjsobject',description:'', depth:-1})
			targetObj=x
		}

		var protoList=[targetObj]
		var p=targetObj
		if(typeof p!='xml')
			while(p=p.__proto__)
				protoList.push(p)
		for(var i in targetObj){
			for(var depth in protoList){
				try{if(protoList[depth].hasOwnProperty(i))
					break
				}catch(e){Cu.reportError(depth+protoList+i)}
			}
			/* data.push({name:i, comName: i.toLowerCase(),get description
function(){dump(this.name); delete this.description; this.description=jn.inspect(autocompleter.object[this.name]); return this.description}
			, depth:depth}) */
			try{var o=targetObj[i];d=jn.inspect(o)}catch(e){var d=e.message,o='error'}
			data.push({name:i, comName: i.toLowerCase(), description:d, depth:depth, object:o})
		}//dump('-----------------------------**',t-Date.now())
		//special cases
		try{if('QueryInterface' in targetObj){i='QueryInterface'
			try{var d=jn.inspect(targetObj[i])}catch(e){var d=e.message}
			data.push({name:i, comName: i.toLowerCase(),description:d, depth:0})
		}}catch(e){}
		return data;
	}
else//4.0b2+
	var getProps = function(targetObj) {
		if (!targetObj)return [];

		var d, o, x = targetObj
		var data = [], protoList = [], depth = 0, allProps = [];

		if (typeof x !== "object" && typeof x !== "function")
			x = x.constructor.prototype;

		if (typeof x === "xml")
			return [{name: toXMLString, comName: 'toxmlString', description: d, depth:depth, object: o}];

		if (typeof targetObj === "object") {
			x = XPCNativeWrapper.unwrap(targetObj)

			if (targetObj != x) {
				data.push({name:'wrappedJSObject', comName: 'wrappedjsobject',description:'', depth:-1})
				targetObj = x
			}
		}

		var maxProtoDepth = 20;
		while(x){
			var props = Object.getOwnPropertyNames(x);
			innerloop: for each(var i in props) {
				if (allProps.indexOf(i) > -1)
					continue innerloop;
				try{o=targetObj[i];d=jn.inspect(o);}catch(e){d=e.message;o="error";}
				
				data.push({name: i, comName: i.toLowerCase(), description: d, depth:depth, object: o});
			}
			protoList.push(x);
			// some objects (XML, Proxy) may have infinite list of __proto__
			if(!maxProtoDepth--)
				break;
			x = x.__proto__;depth++;allProps = allProps.concat(props);
		}
		return data;
		
		// sometimes these are not found by previous code
		i = 'QueryInterface'
		if(i in x && allProps.indexOf(i) == -1)
			data.push({name:i, comName: i.toLowerCase(),description:'', depth:-1})
		i = 'Components'
		if(i in x && allProps.indexOf(i) == -1)
			data.push({name:i, comName: i.toLowerCase(),description:'', depth:-1})
	};

/**======================-==-======================*/

jn={};
jn.resultBuffer = []
jn.say=function(a){
	if(!jn.$useResultBuffer)
		appendToConsole(jn.inspect(a))
	else
		jn.resultBuffer.push(a)
}
jn.__defineGetter__('safeLoop', function(){
	if(!jn.safeLoopCounter){
		e = new Error('>-possibly infinite loop-<')
		e.lineNumber = Components.stack.caller.lineNumber
		throw e
	}
	return jn.safeLoopCounter--
})

jn.inspect=function(x,long){
	if(x == null) return String(x);
	var c, nameList=[], t = typeof x, 
		Class=Object.prototype.toString.call(x),
		string=x.toString()
	if(Class==string)
		string=''//most objects have same class and toString
	Class=Class.slice(8,-1)
	
	if(Class=='Function'){
		var isNative = /\[native code\]\s*}$/.test(string); //is native function
		if(!long){
			i = string.indexOf("{");
			if (isNative)
				t = 'function[n]';
			else
				t = 'function';

			return t + string.substring(string.indexOf(" "), i - 1) + "~" + x.length;
		}
		if(isNative){
			var funcName = string.match(/ ([^\(]*)/)[1];
			return string.replace("()", "(~" + x.length + ")");
		}
		return string;	
	}
	if(Class=='XML')
		return '`'+Class+'` '+x.toXMLString();
	if(t!='object')
		return '`'+Class+'` '+string
	
	if(Class=='XPCWrappedNative_NoHelper'){
		Class = string
		string = ''
	}if(Class=='Array'){
		var l=x.length
		nameList.push('`'+Class+'` ~'+l)
		l=Math.min(long?100:10,l)
		for(var i=0;i<l;i++){
			nameList.push(x[i])
		}
		return nameList.join(',\n   ');
	}
	
	
	nameList.push('`',Class,'` ',string)
	//special cases
	var h=InspectHandlers[Class]
	if(h)return nameList.join('')+h(x)
	
	try{
		var l=x.length
	}catch(e){}//[xpconnect wrapped native prototype].length: throws Illegal operation on WrappedNative prototype object

	//if(typeof l==='number' && l>0) 
	
	
	//d.constructor
	
	//\u25b7'\u25ba'
	if(Class=='Object'){
		c=x.constructor
		
		if(c&&(c=c.name)&&c!='Object')
			nameList.push(':',c,':')
	}
	try{
		//for files		
		if(c=x.spec||x.path)
			nameList.push(" ",c)
		//for dom nodes
		if((c=x.nodeName||x.name)&&(c!=string))
			nameList.push(c)
				
		if(c=x.id)
			nameList.push("#",c)
		
		if(c=x.className)
			if(typeof c=='string')
				nameList.push(".",c.replace(" ",".",'g'))
		
		if((c=x.value||x.nodeValue)&&typeof c=='string'){
			if(c.length>50)
				c=c.substring(0,50)+'...'
			nameList.push(" =",c.toSource().slice(12,-2) )		
		}
		if(typeof l==='number')
			nameList.push(' ~',l)
	}catch(e){}

	if(nameList.length<6){
		nameList.push(' ={')
		try{		
			for(var i in x){
				if(nameList.length>12){
					nameList.push(',')
					break
				}
				var s = x[i], t = typeof s
				if(t != 'object' && t != 'function')
					nameList.push(i+':'+x[i],',')
				else
					nameList.push(i,',')
			}
			if(nameList[nameList.length-1] == ',')
				nameList.pop()//last ,
		}catch(e){
			Cu.reportError(e)
		}
		nameList.push('}')
	}

	return nameList.join('')
}
var InspectHandlers={
	 CSSStyleSheet:function(x)'~'+x.cssRules.length+' ->'+x.href
	,CSSNameSpaceRule:function(x)x.cssText
	,CSSStyleRule:function(x)x.cssText
	,ChromeWindow:function(x)'->'+x.location
	,Window:function(x)'->'+x.location
}

jn.getParent=function(a){
	var utils=(window.getInterface||window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface)(Ci.nsIDOMWindowUtils);


	function handlerMaker(obj) {
		var objStr = Object.prototype.toString.call(obj)
		function toS()'[proxy wrapped'+objStr
		return {
			getOwnPropertyDescriptor: function(name) {
				var desc = Object.getOwnPropertyDescriptor(obj, name);
				// a trapping proxy's properties must always be configurable
				desc.configurable = true;
				return desc;
			},
			getPropertyDescriptor:  function(name) {
				var desc = Object.getPropertyDescriptor(obj, name); // assumed
				// a trapping proxy's properties must always be configurable
				desc.configurable = true;
				return desc;
			},
			getOwnPropertyNames: function() {
				if(objStr=='[object Call]')
					return Object.getOwnPropertyNames(obj);
				// [object With]
				var ans = []
				for(var i in obj)
					ans.push(i)
				return ans
			},
			defineProperty: function(name, desc) {
				Object.defineProperty(obj, name, desc);
			},
			delete: function(name) { return delete obj[name]; },
			fix: function() {
				if (Object.isFrozen(obj)) {
					return Object.getOwnProperties(obj); // assumed
				}
				// As long as obj is not frozen, the proxy won't allow itself to be fixed
				return undefined; // will cause a TypeError to be thrown
			},

			has: function(name) { return name in obj; },
			hasOwn: function(name) { return ({}).hasOwnProperty.call(obj, name); },
			get: function(receiver, name) {				
				return name=='toString'?toS:obj[name]; },
			set: function(receiver, name, val) { obj[name] = val; return true; }, // bad behavior when set fails in non-strict mode
			enumerate:    function() {
				var result = [];
				for (var name in obj) { result.push(name); };
				return result;
			},
			keys: function() { return Object.keys(obj); }
		};
	}

	var parent=utils.getParent(a)
	if(parent.toString) try{parent.toString();return parent}catch(e){}// in [with] have toString which throws
	return Proxy.create(handlerMaker(parent))
}
jn.bait= modernFox?(function(a){
	var desc = {configurable:true,enumerable:true,value:null,writable:true}
	var toString = function()"[object jane's bait proxy]"
	var pr = {
		getOwnPropertyDescriptor: function(name) desc,
		getPropertyDescriptor: function(name) desc,	   
		getOwnPropertyNames: function() [],
		defineProperty: function(name, desc) {
			
		},
		delete: function(name) { return true },
		fix: function() {
			if (Object.isFrozen(obj)) {
			return Object.getOwnProperties(obj); // assumed
			}
			// As long as obj is not frozen, the proxy won't allow itself to be fixed
			return undefined; // will cause a TypeError to be thrown
		},

		has: function(name) true,
		hasOwn: function(name) true,
		get: function(receiver, name) {
			if(name =='toString') return toString; 
			if(name =='__proto__') return null;
			else return receiver;
		},
		
		set: function(receiver, name, val) { dump( name, val); return true; }, // bad behavior when set fails in non-strict mode
		enumerate:    function() {
			var result = [];
			return result;
		},
		keys: function() { return []; }

	};
	return Proxy.create(pr)
})():dump;

jn.getScripts = function(window){
	var document = (window || getTargetWindow()).document
	var bu = Services.io.newURI(document.baseURI, null, null)
	var s = document.querySelectorAll('script')
	s = Array.prototype.slice.call(s).map(function(x){
		return Services.io.newURI(x.getAttribute("src"),null,bu).spec
	})
	return s
}
//sr=jn.getScripts(window)[4];jn.loadScript(sr, window)
jn.loadScript = function(src, window){
	var document = (window || getTargetWindow()).document
	var s = document.querySelector("script[src='" + src + "']")
	if(s)
		s.parentNode.removeChild(s)

	var s = document.createElementNS('http://www.w3.org/1999/xhtml', "html:script");
	s.type = "text/javascript;version=1.8";
	s.src = src//+'?'+Date.now();
	document.documentElement.appendChild(s);
		
    return s
}
jn.loadScript2 = function(src, window){
   return Services.scriptloader.loadSubScript(src+'?'+Date.now(), window || getTargetWindow(), 'UTF-8')
}

function getClass(x) {
	/* if(x == null) return String(x); */
	return Object.prototype.toString.call(x).slice(8,-1)
}
/*** XPCOM ********************************************************************************************/
function supportedInterfaces(element){
	var ans=[]
	for each(var i in Ci){
		try{
			if(element instanceof i)
				ans.push(i)
		}catch(e){}
	}
	return ans;
}
function supportedgetInterfaces(element){
	var ans=[]
	var req=element.QueryInterface(Ci.nsIInterfaceRequestor)
	for each(var i in Ci){
		try{if(req.getInterface(i))
			ans.push(i)
		}catch(e){}
	}
	return ans;
}
// These are needed because some Component access crash FF window.dump("get service "+this.nsIJSCID.name+"\n");
ComponentClassCrashers = ["@mozilla.org/generic-factory;1", "QueryInterface", "@mozilla.org/dom/storage;2"];
ComponentInterfaceCrashers = ["IDispatch"];
function getserviceOrCreateInstance(p){
	if(ComponentClassCrashers.indexOf(p.name) != -1)
		return "crasher";
	try{
		var obj = Cc[p.name].getService(Ci.nsISupports);
	}catch(e){
		try{
			obj = Cc[p.name].createInstance(Ci.nsISupports);
		}catch(e){
			return "not a service or object";
		}
	}
	return obj;
}
/***********************************************************************************************/
function setget(object,prop){
	object=object.wrappedJSObject||object
	var ans='',s
	try{
		s=object.__lookupSetter__(prop)
		if(s)ans+=s.toString().replace(/^.*()/,'set '+prop+'()')
		s=object.__lookupGetter__(prop)
		if(s)ans+=s.toString().replace(/^.*()/,'\nget '+prop+'()')
	}catch(e){Components.utils.reportError(e)}
	return ans
}
function qi(target){
	var ins= supportedInterfaces(target)
	target=target.QueryInterface(ins[0])
	//var data=getProps(target)
	return target
}

function wr(){
	target=unwrap(target)
}


function compare(a,b){
	var ans=[]
	for(var i in a)try{
		var ai=a[i],bi=b[i]
		
		if(ai!=bi){
			if(typeof(ai)=='function'&&ai.toString()==bi.toString())
				continue
			ans.push([i,a[i],b[i]])
		}
	}catch(e){}
return ans
}

jn.getClass=getClass
jn.supportedInterfaces=supportedInterfaces
jn.setget=setget
jn.qi=qi
jn.compare=compare
jn.wr=wr
jn.getSourceLink = function(fn){	
	var s=Services.jsd.wrapValue(shadia.showHelp).script
	if(s){
		return {href: s.fileName, line:s.baseLineNumber}
	}
}
/******************/
jn.unwrap = function(o){
	try{
		return XPCNativeWrapper.unwrap(o)
	}catch(e){
		if(o && 'wrappedJSObject' in o)
			return o.wrappedJSObject||o
	}
	return o
};
jn.cloneArray = function(o){
	var ans=[]
	for(var i=0,ii=o.length;i<ii;i++)
		ans.push(o[i])
	return ans
};
jn.$ = function(id){
	return jn.unwrap(document).getElementById(id);
};
jn.$$ = function(selector){
	var result = jn.unwrap(document).querySelectorAll(selector);
	return jn.cloneArray(result);
};
jn.$x = function(xpath){
	return jn.getElementsByXPath(FBL.unwrapObject(context.baseWindow.document), xpath);
};
 
  /********************************************************/
 /**   ***/
/**/
  /**/
 /**   **/
/********************************************************/


var utils = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils)
var targetWindowId 
getTargetWindow=function(){
	var win = getOuterWindowWithId(targetWindowId)
	if(win && !win.closed)
		return win
}
getOuterWindowID = function(window){
	try{
		return window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).outerWindowID
	}catch(e){
		return Cu.getWeakReference(window)		
	}
}
getOuterWindowWithId = function(id){
	if(typeof id == 'number')
		return utils.getOuterWindowWithId(id)
	else
		return targetWindowId.get()
}


var commandHistory = new Array();
var currentCommandHistoryPos = 0;
var codebox = null;
var resultbox = null;


var initializeables = []
function doOnload(){
	initGlobals();
	
	var starter = FBL.bind(Firebug.jsMirror.initialize, Firebug.jsMirror)
	Firebug.Ace.initialize({
		win2: {id:"jsCode", starter:starter, deps:['fbace/consoleMode', "fbace/worker"]},
		win1: {id:"result", starter:starter, deps:['fbace/consoleOutputMode']}
	})
	
	for each(var i in initializeables)
		i.initialize()	
}

function doOnUnload(){
	var data = $shadia.$jsMirrorData
	if(!data.newTarget)
		data.newTarget = {}
	data.newTarget.code = codebox.session.getValue()
	data.newTarget.winRef = Cu.getWeakReference(getTargetWindow())
	
	var maxHistSize = 100
	var startIndex = Math.max(0, commandHistory.length-maxHistSize)
	commandHistory = commandHistory.slice(startIndex)
	ConfigManager.saveHistory(commandHistory);
}


function initGlobals(){
	codebox = $("jsCode")
	resultbox = $("result")

	commandHistory = ConfigManager.readHistory();
	currentCommandHistoryPos = commandHistory.length
}

initTargetWindow = function(window){
	windowViewer.setWindow(window)
}

/***/
function insertTimer(){
	var st=codebox.selectionStart, en=codebox.selectionEnd
	codebox.selectionEnd=st
	var text='timerStart=Date.now()\nfor(var timerI=0;timerI<100;timerI++){\n\n\n}timerStart-Date.now()'
	insertText(text,codebox)

}


function appendToConsole(string){
	insertTextAtEnd(string+'\n', resultbox)
}
function appendToConsole2(string){
	var editor = resultbox
	editor.clearSelection()	
	var a = editor.selection.getCursor()
	var f = editor.session.insert(a, string+'\n')
	// todo: fix ace
	editor.renderer.$desiredScrollLeft=0
}
function clearResult(){
	resultbox.value="";
	codebox.focus();
}

/********* textbox utils *******/
function insertText(iText,editor){
	editor.session.insert(editor.selection.getCursor(), iText)
}
function insertTextAtEnd(iText, editor){
	editor.clearSelection()
	editor.selection.moveCursorFileEnd()
	var a = editor.selection.getCursor()
	var f = editor.session.insert(a, iText)
	editor.selection.selectTo(a.row, a.column)
	editor.renderer.$desiredScrollLeft=0
}

function nextCommandFromHistory(){
	if(currentCommandHistoryPos>=commandHistory.length-1)
		return;
	codebox.value = commandHistory[++currentCommandHistoryPos];
}
function previousCommandFromHistory(){
	if(currentCommandHistoryPos==0)
		return;
	codebox.value = commandHistory[--currentCommandHistoryPos];
}


/*****************************************************************
 *  code completion utils
 ****************/

/**======================-==-======================*/
jsExplore={}
jsExplore.qi=function(){
	autocompleter.start(jn.qi(autocompleter.object),autocompleter.filterText)
}

jsExplore._p=function(){
	var protoList=[autocompleter.object]
	var p = protoList[0]
	var n = 20 
	while((p = p.__proto__) && n--)
		protoList.push(p)
	autocompleter.sayInBubble(
		'__proto__ chain for'+(n<=0?'truncated at'+n:'')+'\n'+
		protoList.map(function(x)jn.inspect(x)).join('\n'),
		true
	)
}
jsExplore.si=function(){
	autocompleter.sayInBubble(
		'interfaces supported by\n'+
		autocompleter.object+'\n'+
		supportedInterfaces(autocompleter.object).join('\n')
	)
}

jsExplore.reveal=function(){
	if(!Services.jsd.isOn){
		Services.jsd.asyncOn(jsExplore.reveal)
		return
	}
	let script = Services.jsd.wrapValue(autocompleter.selectedObject.object).script
	if(script)
		return $shadia.externalEditors.edit(script.fileName, script.baseLineNumber)
	let script = Services.jsd.wrapValue(autocompleter.selectedObject.object.constructor).script
	if(script)
		$shadia.externalEditors.edit(script.fileName, script.baseLineNumber)
	
	alert('unable to find script:(')
}
jsExplore.eval=function(){
	var f = autocompleter.selectedObject.object
	var o = autocompleter.object
	try{
		if(typeof f == 'function')
			var result = jn.inspect(f.call(o))
		else
			var result = 'not a function'
	}catch(e){
		result = e
	}

	autocompleter.sayInBubble(result, true)
}

jsExplore.getParent=function(){
	var p=jn.getParent(autocompleter.selectedObject.object)
	autocompleter.sayInBubble(jn.inspect2(p, 'long'), true)
}
/*****************
 *  end of code completion utils
 ****************************************************************/

Firebug.evaluate = function(code, onSuccess, onerror){
	try{
		//unwrap
		var win = jn.unwrap(getTargetWindow())
		
		if(!win || win.closed)
			return appendToConsole('window is closed')
		
		//add jn
		win.jn=jn
		jn.$useResultBuffer = true
		jn.safeLoopCounter = 100000;
		//evaluate
		stackStartLineNumber=Components.stack.lineNumber
		var ans=win.eval(code)

		onSuccess(ans, Firebug.currentContext)
	}catch(e){
		dump(e)
		onerror(e, Firebug.currentContext)
	}finally{
		//remove jn
		jn.$useResultBuffer = false
		//if(win.location.href!=window.location.href)
		if(!win.location || /^http/.test(win.location.href))
			win.jn=''
		if(jn.resultBuffer.length){
			appendToConsole2(jn.resultBuffer.map(jn.inspect).join('\n'))
		}
		jn.resultBuffer = []
	}
	return ans	

}
Firebug.dir = function(obj){
	if(typeof obj == 'string'){
		appendToConsole("String source:");
		appendToConsole(obj.toSource().slice(12,-2))
		return
	}
	appendToConsole("Properties for object:");
	var n = 0
	var ans=''
	for(var i in obj){
		ans+=i+': '
		try{
			ans+=jn.inspect(obj[i])
		}catch(e){
			ans+=jn.inspect(e)
		}
		ans+='\n'
		n++
	}
	appendToConsole(jn.inspect(obj)+' ~'+n)	
	appendToConsole(ans)
}
jn.dir = function(obj){
	if(typeof obj == 'string'){
		jn.say("String source:");
		jn.say(obj.toSource().slice(12,-2))
		return
	}
	jn.say("Properties for object:");
	var n = 0
	var ans=''
	for(var i in obj){
		ans+=i+': '
		try{
			ans+=jn.inspect(obj[i])
		}catch(e){
			ans+=jn.inspect(e)
		}
		ans+='\n'
		n++
	}
	jn.say(jn.inspect(obj)+' ~'+n)	
	jn.say(ans)
}
Firebug.log = function(obj){
	appendToConsole(obj)
}
Firebug.currentContext = {
	get window(){
		return  getTargetWindow()
	},
	get global(){
		return  getTargetWindow()
	}
}

FBL.unwrapObject = jn.unwrap
$=function(x)document.getElementById(x)
/**======================-==-======================*/

aceManager = Firebug.Ace

function toggleEditorFocus(env){
	if(env.editor != codebox)
		codebox.focus()
	else
		resultbox.focus()
}
Firebug.jsMirror = {
	initialize: function(window) {
		var editor = window.editor;
		editor.session.owner = 'console';
		Firebug.Ace.sessionOwners = {console:Firebug.jsMirror}
		editor.session.href = '';
		editor.session.autocompletionType = 'console';

		// set mode which allows cells and, js+coffeescript combination
		window.initConsoleMode(editor)

		//add shortcuts
		editor.addCommands({
			execute: function(env)Firebug.jsMirror.enter(true, false, env.editor),
			dirExecute: function(env)Firebug.jsMirror.enter(true, true, env.editor)
		});
		window.canon.addCommand({
			name: "toggleEditorFocus",
			bindKey: {
				win: "Ctrl-Up|Ctrl-Down",
				mac: "Command-Up|Command-Down",
				sender: "editor"
			},
			exec: toggleEditorFocus
		});
		
		if(!this.otherEditorReady)
			return this.otherEditorReady = true
		
		// fixme
		codebox = Firebug.Ace.win2.editor
		resultbox = Firebug.Ace.win1.editor
		var data = $shadia.$jsMirrorData
		if(data && data.newTarget){
			initTargetWindow(data.newTarget.winRef.get())
			codebox.session.doc.setValue(data.newTarget.code||'')
			//data.newTarget = null
			codebox.selectAll();
		}
		codebox.focus()
	},

	_setValue: function(text) {
		var editor = Firebug.Ace.win2.editor;
		editor.session.doc.setValue(text);
		return text;
	},

	//* * * * * * * * * * * * * * * * * * * * * * * * *
	set value(val) {
		var mode = Firebug.Ace.win2.editor.session.getMode()
		if (mode.setCellText)
			return mode.setCellText(val)
		return this.setValue(val);
	},

	addContextMenuItems: function(items, editor, editorText) {
		items.unshift(
			{
				label: ("Execute selection"),
				onclick: function(event) {
					Firebug.jsMirror.enter(false, event.button||event.shiftKey||event.ctrlKey, editorText)
				},
				disabled: !editorText
			},
			{
				label: ("Stream comment"),
				command: function() {
					editor.execCommand('toggleStreamComment');
				}
			},
			"-"
		);
	},

	// * * * * * * * * * * * * * * * * * * * * * *
	enter: function(runSelection, dir, text) {
		var editor, cell
		this.$useConsoleDir = dir;
		if(typeof text == "object"){
			editor = text
			text = ""
		} else {
			editor = Firebug.Ace.win2.editor;
		}
		var mode = editor.session.getMode()
		if (mode.getCurrentCell)
			cell = this.cell = mode.getCurrentCell();
		else
			cell = this.cell = {body: editor.getCopyText()};

		if (runSelection)
			var text = editor.getCopyText();
		if (!text) {
			//log lines with breakpoints
			var bp = editor.session.$breakpoints;
			if (cell.coffeeError) {
				this.logCoffeeError(cell.coffeeError);
				return;
			} else if (cell.coffeeText) {
				text = cell.coffeeText
			} else
				text = cell.body.map(function(x, i) {
					if (bp[i + cell.bodyStart]) {
						// strip comments and ;
						x = x.replace(/\/\/.*$/, '')
							 .replace(/;\s*$/, '')
							 .replace(/^\s*var\s+/g, '')
						if(x)
							x = 'jn.say(' + x + ')'
					}
					return x;
				}).join('\n');
			//Firebug.commandHistory.appendToHistory(cell.body.join('\n'));
		}
		text = text.replace(/[\.,:]\s*$/, '').replace(/^\s*[\.,:]/, '');

		Firebug.jsMirror.runUserCode(text, cell);
	},
	setThisValue: function(code, cell){
		cell = cell || Firebug.Ace.win2.editor.session.getMode().getCurrentCell();
		var thisValue = cell.headerText.match(/this\s*=(.*)/)
		if (thisValue&&code){
			code = '(function(){return eval(' + code.quote() + ')}).call(' + thisValue[1] + ')'
		}

		return code
	},
	setErrorLocation: function(context){
		Firebug.evaluate(
			'++++',
			dump,
			function(error) {
				var source = ['','']//error.source.split('++++')
				context.errorLocation={
					fileName: error.fileName,
					lineNumber: error.lineNumber,
					before: source[0].length,
					after: -source[1].length,
				}
			}
		);
	},

	runUserCode: function(code, cell) {
		var context = Firebug.currentContext;
		if(!context.errorLocation)
			this.setErrorLocation(context);

	   // Firebug.log("in:" + (inputNumber++) + ">>> " + cell.sourceLang);

		this.lastEvaledCode = code;
		code = this.setThisValue(code, this.cell);
		Firebug.evaluate(code,
			Firebug.jsMirror.logSuccess,
			Firebug.jsMirror.logError
		);
	},
	logSuccess: function(e){
		Firebug.jsMirror.$useConsoleDir?
			Firebug.dir(e):
			Firebug.log(jn.inspect(e, 'long'));
	},
	logError: function(error) {
		var loc = Firebug.currentContext.errorLocation
		var self = Firebug.jsMirror;

		if(self.$useConsoleDir)
			Firebug.dir(error)
		else if(loc.fileName == error.fileName || loc.fileName == error.filename) {
			var source = error.source || self.lastEvaledCode//.slice(loc.before, loc.after);
			var cellStart = self.cell.bodyStart;
			var lineNumber = error.lineNumber - loc.lineNumber;
			var lines = source.split('\n');
			var line = lines[lineNumber]||lines[lineNumber-1];
			var message = error.message||error.toString()
			Firebug.log(message + ' `' + line + '` @'+(lineNumber+cellStart));
		} else 
			Firebug.log(jn.inspect(error));
			Components.utils.reportError(error)
	},
	logCoffeeError: function(error) {
		Firebug.log(error.text + ' `' + error.source + '` @'+(error.row+this.cell.bodyStart));
	}
};

var inputNumber = 0;

/**======================-==-======================*/

var ConfigManager = {
	CONFIG_FILE_NAME: "executhistory.xml",
	thisFile: 'chrome://shadia/content/jsMirror/jsMirror.xul',

	readHistory: function(){
		return []
	},

	saveHistory: function(historyArray){
		return
	},

	getConfigFile: function(){
		
		}
}

/*********************************************************************
 * window picker
 **********************************************************/
 
windowViewer={
	getContextMenuItems: function(_, target){
		var items = []
        items.push({
                label: "focus",
                command: function() {
					getTargetWindow().focus()
                },
            },{
                label: "copy location",
                command: function() {
					gClipboardHelper.copyString(getTargetWindow().location.href);
                },
            },'-', {
                label: "reopen",
                command: function() {
					$shadia.openWindow(getTargetWindow().location.href)
                },
            }, {
                label: "reload",
                command: function() {
					getTargetWindow().location.reload()
                },
            },"-",{
                label: "edit",
                command: function() {
                   $shadia.externalEditors.edit(getTargetWindow().location.href);
                }
            },{
                label: "inspect",
                command: function() {
                   shadia.inspect(getTargetWindow().document.documentElement);
                }
            }
        );

        return items;
	},
	
	initialize: function(){
		this.tree=$('window-tree')
		this.button=$('targetWindow')
		this.button.setAttribute("oncommand", "windowViewer.$hidePopupOnClick=true")
		this.popup=$("window-menu")
		this.popup.setAttribute('onpopupshown','if(event.target==this)windowViewer.activate()')
		this.popup.setAttribute('onpopuphiding','windowViewer.deactivate()')
		this.view=new multiLevelTreeView()
		//this.tree.onselect=init2()
		this.tree.setAttribute('onselect','selectObjectInTree("windowViewer")')
		this.tree.setAttribute('onmousedown','selectObjectInTree("windowViewer")')
		this.tree.setAttribute('onclick','windowViewer.onClick(event)')
		this.tree.setAttribute('ondblclick','windowViewer.selectWindow()')

		this.tree.addEventListener('keypress',this,true)
		
		this.tree.ownerPanel = this
		this.button.ownerPanel = this
	},
	fillWindowList: function(){
		function toUp(el){
			return Services.domUtils.getParentForNode(el, true)||{};
		}
		var winTable=[],index=0,slf=this
		function inspwin(w,level){
			var d=w.document;
			var uri=sayHref(d.documentURI)
			var t=d.title.substring(0,40)
			t= t.length==0? uri : t+'->'+uri//.substring(0,50)+'...'+uri.slice(-10)

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
				var o = toUp(a.document).compareDocumentPosition(toUp(b.document));
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
				}catch(e){
					Components.utils.reportError(e);
					dump('--->why! error in innerFrame.frames?',innerFrame.location)
				}//
			}
		}
		var fWins = Services.wm.getEnumerator('');
		while(fWins.hasMoreElements()){
			iterateInnerFrames(fWins.getNext(),0)
		}
		this.view.childData=winTable


	},
	
	addBootstrapScopes: function(){	
		var XPIProviderBP = Components.utils.import("resource://gre/modules/XPIProvider.jsm")
		var index = this.view.childData.length
		this.view.childData.push({
			level: 0,
			text: "bootstrapped addons",
			parent: null,
			frame: XPIProviderBP,
			index: index++,
			rowProp: 'head',
			showChildren: true
		})
		var bs = XPIProviderBP.XPIProvider.bootstrapScopes
		for(var i in bs){
			if(!bs[i].id)
				bs[i].id = i
			this.view.childData.push({
				level: 1,
				text: i + ' :Sandbox',
				parent: null,
				frame: bs[i],
				index: index++,
				cellProp: 'DOCUMENT_TYPE_NODE'
			})
		
		}
		var t=XPIProviderBP.XPIProvider.bootstrapScopes["right@context.a.am"]
	},
	
	updateVisibleList: function(showDepth){
		var mWindow = getOuterWindowWithId(targetWindowId)
		var winTable = this.view.childData
		this.view.visibleData=[]
		var lastAdded = 0
		var showChildren = false
		for (var i=0; i < winTable.length; i++) {
			var w = winTable[i]
			i
			if(w.level <= showDepth){
				showChildren = w.showChildren
				lastAdded = i
				this.view.visibleData.push(winTable[i]);				
			}else if(showChildren){
				lastAdded = i
				this.view.visibleData.push(winTable[i]);	
			}
			
			if(w.frame == mWindow){				
				while(lastAdded < i){
					lastAdded++
					this.view.visibleData.push(winTable[lastAdded]);
				}
				
				this.curWinIndex = this.view.visibleData.length - 1
				var lastLevel = w.level
				w = winTable[i+1]
				while(w && w.level > showDepth && w.level <= lastLevel){
					i++
					this.view.visibleData.push(w);
					w = winTable[i+1]
				}
			}

		}
	},

	rebuild: function(){
		this.fillWindowList()
		this.addBootstrapScopes()
		this.updateVisibleList(0)
		this.tree.view=this.view
		this.tree.view.selection.select(this.curWinIndex)
		this.tree.treeBoxObject.ensureRowIsVisible(this.curWinIndex)
	},
	activate: function(){
		this.showList(true)
		this.tree.focus()
		//this.tree.parentNode.style.MozUserFocus='normal'
		this.button.checked=false
		this.button.setAttribute('open', true)
		this.active=true
		this.rebuild()
	},
	deactivate: function(){
		this.$hidePopupOnClick = false
		
		this.tree.view=null
		this.view.visibleData=this.view.childData=[]
		this.showList(false)

		this.button.checked=true
		this.button.setAttribute('open', false)
		this.active=false
		
		this.popup.hidePopup()
	},
	showList: function(show){
		if(show){
		
		}else{
			
		}
	},
	onClick: function(event){
		if (!this.$hidePopupOnClick || event.button != 0)
			return;
	
		var row = {}, col = {}, obj = {};
		this.tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, obj);
		
		if (obj.value == 'text'){
			this.popup.hidePopup()
		}
	},
	onSelect: function(){
		var i = this.tree.currentIndex, data = this.view.visibleData
		var mWindow = data[i].frame
		this.setWindow(mWindow)		
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
		if(codebox)
			codebox.focus()
	},

	updateButton: function(mWindow){
		if(mWindow.document)try{
			var t = mWindow.document.title		
			var uri = sayHrefEnd(mWindow.document.documentURI)
			if(!t)
				t = uri
			else if(t != uri)
				t += ' '  + uri
		}catch(e){}
		if(!t)
			t = jn.inspect(mWindow)
		this.button.label = t
	},

	//window service
	getSelectedWinID: function(){
		return targetWindowId
		var win
		return getOuterWindowID(win)
	},
	setWindow: function(window) {
		if(!window){
			var e = Services.wm.getZOrderDOMWindowEnumerator(null, 1)
			window = e.getNext()
		}
		targetWindowId = getOuterWindowID(window)
		//descripton of
		this.updateButton(window)
	},

	currentURI: function(){
		var i=this.tree.currentIndex
		if(i>=0)
			return this.view.visibleData[i].frame.location.href
	},
}
	initializeables.push(windowViewer)

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
