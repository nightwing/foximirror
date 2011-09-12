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
	
	if(Class=='Array'){
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
			dump( name); 
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
	var document = window.document
	var bu = Services.io.newURI(document.baseURI, null, null)
	var s = document.querySelectorAll('script')
	s = Array.prototype.slice.call(s).map(function(x){
		return Services.io.newURI(x.getAttribute("src"),null,bu).spec
	})
	return s
}
//sr=jn.getScripts(window)[4];jn.loadScript(sr, window)

jn.loadScript = function(src, window){
   return Services.scriptloader.loadSubScript(src+'?'+Date.now(), window, 'UTF-8')
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
 /** start of tral ***/
/**/
var stackStartLineNumber
function executeJS(sel, printProps){
	/*jn.exec();return;*/
	var code = codebox.value;

	if(sel){
		let s = codebox.selectionStart, e = codebox.selectionEnd
		if (sel=='line') {
			s = code.lastIndexOf('\n', s)
			if(s == -1)
				s = 0
			let e1 = code.indexOf('\n', e)
			if(e1 != -1)
				e = e1
	}
		if(s < e)
			code = code.substring(s, e)
}
	if(!code){
		appendToConsole("no code entered:(");
		codebox.focus();
		return null
	}

	printProps&&appendToConsole("Properties for object:");

	try{
		var result = evalStringOnTarget(code)
	}catch(e){
		result=LastError=e;
		Components.utils.reportError(e)
		appendToConsole(ejsInspectError(e));
		codebox.focus();
		return result;
	}
	appendToConsole(jn.inspect(result,'long'));

	codebox.focus();
	printProps&&printPropertiesForTarget(result)
	return result;
}
function ejsInspectError(e){
	var fn=e.filename||Components.stack.fileName
	if(!stackStartLineNumber||Components.stack.fileName!==fn ){
		stackStartLineNumber=0
		Components.utils.reportError(e)
	}
	return e.lineNumber-stackStartLineNumber+': '+e.message+'->'+e.fn
}
function evalStringOnTarget(string){
	var evalString = string//replaceShortcuts(string);
	var win = getTargetWindow()
	if(cntContentWinCB.checked==true && cntContentWinCB.disabled==false){
		win = win.content||win
	}
	//unwrap
	try{
		win = XPCNativeWrapper.unwrap(win)
	}catch(e){
		if('wrappedJSObject' in win)
		win = win.wrappedJSObject||win
	}
		
	//add jn
	win.jn=jn
	//evaluate
	stackStartLineNumber=Components.stack.lineNumber
	var ans=win.eval(evalString)
	//remove jn
	if(win.location.href!=window.location.href)
		win.jn=''
		
	return ans	
}
  /**/
 /** end of tral **/
/********************************************************/


var utils = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils)
var targetWindowId 
if(utils.getOuterWindowWithId){
	getTargetWindow=function(){
	var win = getOuterWindowWithId(targetWindowId)
		if(!win||win.closed)
			win = null
		return win
	}
	getOuterWindowID = function(window){
		return window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).outerWindowID
	}
getOuterWindowWithId = function(id){
	return utils.getOuterWindowWithId(id)
}
/***/
}
else//old versions
{
	getTargetWindow=function(){
		var win = targetWindowId
		if(!win||win.closed)
			win = null
		return win
	}
	getOuterWindowID = function(window){
		return window
	}
}

var commandHistory = new Array();
var currentCommandHistoryPos = 0;
var allOpenWins = new Object();
var cntTargetWinML = null;
var cntContentWinCB = null;
var codebox = null;
var resultbox = null;
var cntFunctionNameML = null;


function byId(id){
	return document.getElementById(id);
}

function doOnload(){
	initGlobals();
	
	var starter = FBL.bind(Firebug.jsMirror.initialize, Firebug.jsMirror)
	Firebug.Ace.initialize({
		win2: {id:"jsCode", starter:starter, deps:['fbace/consoleMode', "fbace/worker"]},
		win1: {id:"result", starter:starter, deps:['fbace/consoleOutputMode']}
	})
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
	cntTargetWinML = byId("targetWin")
	//cntTargetWinML.editable=true
	cntContentWinCB = byId("contentWinCB")
	codebox = byId("jsCode")
	resultbox = byId("result")
	cntFunctionNameML = byId("functionName")

	commandHistory = ConfigManager.readHistory();
	currentCommandHistoryPos = commandHistory.length
}

initTargetWindow = function(window){
	if(!window){
		var e=Services.wm.getZOrderDOMWindowEnumerator(null, 1)
		window = e.getNext()
		if(e.hasMoreElements())
			window = e.getNext()
	}
	targetWindowId = getOuterWindowID(shadowInspector.getTopWindow(window))
	
	var opener=window.window//strange bug with weakref and mediator
	var mediator = Cc["@mozilla.org/rdf/datasource;1?name=window-mediator"].getService(Ci.nsIWindowDataSource);
	var resources = cntTargetWinML.menupopup.childNodes//[6].id
	for(var i=0;i<resources.length;i++)
		if(mediator.getWindowForResource(resources[i].id)==opener){
			cntTargetWinML.selectedIndex = i;
			var found=true
			break
		}
	
	found||(cntTargetWinML.selectedIndex=1);

	targetWinChanged();
}

function targetWinChanged(){
	//Set current target
	targetWindowId = getSelectedWinID()
}

function getSelectedWinID(){
	var mediator = Cc["@mozilla.org/rdf/datasource;1?name=window-mediator"].getService(Ci.nsIWindowDataSource);
	var resource = cntTargetWinML.selectedItem.getAttribute('id')
	var win = mediator.getWindowForResource(resource);
	var id = getOuterWindowID(win)
	dump(resource, id)
	return id
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
	if(typeof f == 'function')
		autocompleter.sayInBubble(jn.inspect(f()), true)
	else
		autocompleter.sayInBubble('not a function', true)
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
		//dump(ans)

		onSuccess(ans, Firebug.currentContext)
	}catch(e){
		dump(e)
		onerror(e, Firebug.currentContext)
	}finally{
		//remove jn
		jn.$useResultBuffer = false
		//if(win.location.href!=window.location.href)
		if(/^http/.test(win.location.href))
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
		dump(4)
		var editor = window.editor;
		editor.session.owner = 'console';
		Firebug.Ace.sessionOwners = {console:Firebug.jsMirror}
		editor.session.href = '';
		editor.session.autocompletionType = 'console';

		// set mode which allows cells and, js+coffeescript combination
		window.initConsoleMode(editor)

		//add shortcuts
		editor.addCommands({
			execute: function()Firebug.jsMirror.enter(true, false),
			dirExecute: function()Firebug.jsMirror.enter(true, true)
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
			data.newTarget = null
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
		this.$useConsoleDir = dir;
		var editor = editor || Firebug.Ace.win2.editor;
		var cell = editor.session.getMode().getCurrentCell();
		this.cell = cell;

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
		//dump(code)
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

		dump(loc.fileName, error.fileName, error.filename)
		if(self.$useConsoleDir)
			Firebug.dir(error)
		else if(loc.fileName == error.fileName || loc.fileName == error.filename) {
		dump(error.source,'*************')
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



/**----------------------------------------**\
 | Basic comment block based on             |
 | source code found at jslib.mozdev.org    |
\**----------------------------------------**/

cleardump = function(){
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	consoleService.reset()
	consoleService.logStringMessage(""); //new Date() + ":  "
	//Components.utils.reportError(e); // report the error and continue execution
}

/*⨭⨮⫷⫸✓✑✎ ✏ ✐✘✳✯❖➺⟳⟲Ͼ ✓Ͽ߷௵෴༒ↂ⊰ ⊱▒▢ ⚶▣⚜*/







/*
Copyright (C) 2011 by Angus Croll
http://javascriptweblog.wordpress.com
Available under MIT license <http://mths.be/mit>
*/

;(function(){
  var traverse = function(util, searchTerm, options) {
	var options = options || {};
	var obj = options.obj || window;
	var path = options.path || ((obj==window) ? "window" : "");
	var props = Object.keys(obj);
	props.forEach(function(prop) {
	  if ((tests[util] || util)(searchTerm, obj, prop)){
		jn.say([path, ".", prop].join(""), "->",["(", typeof obj[prop], ")"].join(""), obj[prop]);
	  }
	  if(Object.prototype.toString.call(obj[prop])=="[object Object]" && (obj[prop] != obj) && path.split(".").indexOf(prop) == -1) {
		traverse(util, searchTerm, {obj: obj[prop], path: [path,prop].join(".")});
	  }
	});
  }

  var dealWithIt = function(util, expected, searchTerm, options) {
	(!expected || typeof searchTerm == expected) ?
	  traverse(util, searchTerm, options) :
	  jn.say([searchTerm, 'must be', expected].join(' '));
  }

  var tests = {
	'name': function(searchTerm, obj, prop) {return searchTerm == prop},
	'nameContains': function(searchTerm, obj, prop) {return prop.indexOf(searchTerm)>-1},
	'type': function(searchTerm, obj, prop) {return obj[prop] instanceof searchTerm},
	'value': function(searchTerm, obj, prop) {return obj[prop] === searchTerm},
	'valueCoerced': function(searchTerm, obj, prop) {return obj[prop] == searchTerm}
  }

  jn.find={
	byName: function(searchTerm, options) {dealWithIt('name', 'string', searchTerm, options);},
	byNameContains: function(searchTerm, options) {dealWithIt('nameContains', 'string', searchTerm, options);},
	byType: function(searchTerm, options) {dealWithIt('type', 'function', searchTerm, options);},
	byValue: function(searchTerm, options) {dealWithIt('value', null, searchTerm, options);},
	byValueCoerced: function(searchTerm, options) {dealWithIt('valueCoerced', null, searchTerm, options);},
	custom: function(fn, options) {traverse(fn, null, options);}
  }
})();



/*
Copyright (C) 2011 by Angus Croll and John-David Dalton
http://javascriptweblog.wordpress.com
http://allyoucanleet.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

//alternate version by John-David Dalton <http://allyoucanleet.com/>
//1) works in IE 8
//2) allows repeating prop names in path
//3) does not risk exceeding stack limit
//4) logs circular/shared references w/ indicator

;(function(window) {

  function dealWithIt(util, expected, searchTerm, options) {
	// integrity check arguments
	(!expected || typeof searchTerm == expected)
	  ? traverse(util, searchTerm, options)
	  : jn.say(searchTerm + ' must be ' + expected);
  }

  function traverse(util, searchTerm, options) {
	util = tests[util] || util;
	options || (options = {});

	var data;
	var pool;
	var pooled;
	var prevPath;

	var obj = options.obj || window;
	var ownProp = options.hasOwnProperty;
	var path = options.path || ((obj == window) ? 'window' : '');
	var queue = [{ 'obj': obj, 'path': path }];

	// a non-recursive solution to avoid call stack limits
	// http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
	while ((data = queue.pop())) {
	  obj = data.obj;
	  path = data.path;
	  pooled = false;

	  // clear pool when switching root properties
	  path.indexOf(prevPath) && (pool = [data]);
	  prevPath = path;

	  for (var prop in obj) {
		// IE may throw errors when accessing/coercing some properties
		try {
		  if (ownProp.call(obj, prop)) {
			// inspect objects
			if ([obj[prop]] == '[object Object]') {
			  // check if already pooled (prevents circular references)
			  for (var i = -1; pool[++i] && !(pooled = pool[i].obj == obj[prop] && pool[i]); ) { }
			  // add to stack
			  if (!pooled) {
				data = { 'obj': obj[prop], 'path': path + '.' + prop };
				pool.push(data);
				queue.push(data);
			  }
			}
			// if match detected, log it
			if (util(searchTerm, obj, prop)) {
			  jn.say(path + '.' + prop, '->', '(' + (pooled ? '<' + pooled.path + '>' : typeof obj[prop]) + ')', obj[prop]);
			}
		  }
		} catch(e) { }
	  }
	}
  }

  var tests = {
	'propName': function(searchTerm, obj, prop) {
	  return searchTerm == prop;
	},
	'type': function(searchTerm, obj, prop) {
	  return obj[prop] instanceof searchTerm;
	},
	'value': function(searchTerm, obj, prop) {
	  return obj[prop] === searchTerm;
	},
	'valueCoerced': function(searchTerm, obj, prop) {
	  return obj[prop] == searchTerm;
	}
  };

  // expose
  jn.find2 = {
	'byPropName': function(searchTerm, options) {
	  dealWithIt('propName', 'string', searchTerm, options);
	},
	'byType': function(searchTerm, options) {
	  dealWithIt('type', 'function', searchTerm, options);
	},
	'byValue': function(searchTerm, options) {
	  dealWithIt('value', null, searchTerm, options);
	},
	'byValueCoerced': function(searchTerm, options) {
	  dealWithIt('valueCoerced', null, searchTerm, options);
	},
	'custom': function(fn, options) {
	  traverse(fn, null, options);
	}
  };
}(this));


