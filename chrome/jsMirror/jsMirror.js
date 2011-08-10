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
jn.say=function(a){
	appendToConsole(a?a.toString():a)
}

jn.inspect=function(x,long){	
	if(x == null) return String(x);
	var c, nameList=[], t = typeof x, 
		Class=Object.prototype.toString.call(x),
		string=x.toString()
	if(Class==string)
		string=''//most objects have same class and toString
	
	Class=Class.slice(8,-1)
	
	if(Class=='Function'){
		var isNative=/\[native code\]\s*}$/.test(string)//is native function		
		if(!long){
			var i=string.indexOf("{")
			t=isNative?'function[n]': 'function'
			return t+string.substring(string.indexOf(" "),i-1)+'~'+x.length		
		}
		if(isNative){
			return string+'~'+x.length
		}		
		return	string		
	}
	if(Class=='XML')
		return Class+'` '+x.toXMLString();
	if(t!='object')
		return Class+'` '+string
	
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
		nameList.push('{')
		for(var i in x){
			if(nameList.length>12)
				break
			nameList.push(i,',')
		}
		nameList.push('}')
	}

	return nameList.join('')
}
var InspectHandlers={
	 CSSStyleSheet:function(x)'~'+x.cssRules.length+' ->'+x.href
	,CSSNameSpaceRule:function(x)x.cssText
	,CSSStyleRule:function(x)x.cssText
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



function getClass(x) {
	if(x == null) return String(x);
    return Object.prototype.toString.call(x).slice(8,-1)
}
function supportedInterfaces(element){
	var ans=[]
	for each(var i in Ci){
		try{
			if(element instanceof i)
				ans.push(i)
		}catch(e){Components.utils.reportError(e)}
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
	return o.wrappedJSObject||o
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
 
/********************************************************
 * start of tral
 **/
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
	printProps&&printPropertiesForTarget(target)
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

function consoleSummary(x){
  if(x == null) return String(x);
  var name,t = typeof x;
  switch(t){
    case 'object': break;
    case 'string': return x;
    case 'function':
      name=x.toString()
      var i=name.indexOf("{")
      return name.substring(0,i)+x.length;
    case 'xml': x = x.toXMLString();
    default: return x +'  '+ t;
  }
//  var O2S = Object.prototype.toString;

  var name =x.toString() //O2S.call(x);
  //for dom nodes
  var l=x.length
  if(typeof l==='number')
     name+='\u2022'+l
  if(x.nodeName)
    name+=x.nodeName
  if(x.id)
    name+="#"+x.id
  if(x.className)
    name+="."+x.className.toString().replace(" ",".",'g')
  if(x.value)
    name+="="+x.value
        if(x.nodeValue)
    name+="@"+x.nodeValue


  return name

}
function printPropertiesForTarget(target){
  var result = new Array();
  if(target.wrappedJSObject!=null){
    target = target.wrappedJSObject;
  }
  var index = 0;

  for(var i in target){
    try{
        result[index++] = i + ": " +consoleSummary( target[i]);
    }catch(e){
		result[index++] = i + ": " +consoleSummary( e)
    }
  }
  appendToConsole(index+'\n'+result.join("\n"));
}
/**
 * end of tral
 ********************************************************/


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
		shortCuts=new initShortCuts()
	initTargetWindow()
	if($shadia.jsMirror && $shadia.jsMirror.value){
		codebox.value = $shadia.jsMirror.value
		codebox.select();		
	}
	    codebox.focus();

}
function doOnUnload(){
	if(!$shadia.jsMirror)
		$shadia.jsMirror = {}
	$shadia.jsMirror.value = codebox.value
	$shadia.jsMirror.targetWindowId = targetWindowId
	
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

initTargetWindow = function(){
	if(window.opener){
		targetWindowId = getOuterWindowID(shadowInspector.getTopWindow(window.opener))
		var opener=window.opener
		var mediator = Cc["@mozilla.org/rdf/datasource;1?name=window-mediator"].getService(Ci.nsIWindowDataSource);
		var resources = cntTargetWinML.menupopup.childNodes//[6].id
		for(var i=0;i<resources.length;i++)
			if(mediator.getWindowForResource(resources[i].id)==opener){
				cntTargetWinML.selectedIndex = i;
				var found=true
				break
			}
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
function commentBlock(){
	commentBlockTB(codebox)
	codebox.focus();
}
function commentBlockTB(elem){
	var value=elem.value
	var selectedText= value.substring(elem.selectionStart,elem.selectionEnd);
	if(selectedText==""){
		if(value[elem.selectionStart-1]=="/"&&value[elem.selectionStart-2]=="*")
			var next=elem.selectionStart-2
		else if(value[elem.selectionStart]=="/"&&value[elem.selectionStart-1]=="*")
			var next=elem.selectionStart-1
		else var next=value.indexOf("*/",elem.selectionStart)
		var prev=value.lastIndexOf("/*",elem.selectionStart)
		if(next<0||prev<0)return;
		elem.selectionStart=prev;elem.selectionEnd=next+2
		selectedText= value.substring(prev+2,next);
	}else if (selectedText.search(/^[\s]*\/\*[\s\S]*\*\/[\s]*$/)){ //comment it
		selectedText = "/*" + selectedText + "*/";

	} else { //uncomment it
		selectedText = selectedText.replace(/^([\s]*)\/\*([\s\S]*)\*\/([\s]*)$/gm,"$1$2$3");

	}
	insertText(selectedText, elem)
	elem.selectionStart-=selectedText.length
}
function commentLine() {
    commentLineTB(codebox)
    codebox.focus();
}
function commentLineTB(elem) {
	var start=elem.selectionStart
	var end=elem.selectionEnd
    var prevLine = elem.value.lastIndexOf("\n", start)+1
    var nextLine = elem.value.indexOf("\n", end)
	if(nextLine<prevLine)return
    var alltext = elem.value.substring(prevLine, nextLine)
    if (alltext[0] == "/" && alltext[1] == "/") { //needs uncomment
		alltext=alltext.replace(/^\/\/+/mg,"")
	}else{
		alltext=alltext.replace(/^(?!\/\/)/mg,"//")
	}
    elem.selectionStart = prevLine
    elem.selectionEnd = nextLine
	insertText(alltext, elem)
	elem.selectionStart = elem.selectionEnd = start

appendToConsole(alltext+" "+nextLine+" "+elem.selectionEnd)
}

function insertTimer(){
	var st=codebox.selectionStart, en=codebox.selectionEnd
	codebox.selectionEnd=st
	var text='timerStart=Date.now()\nfor(var timerI=0;timerI<100;timerI++){\n\n\n}timerStart-Date.now()'
	insertText(text,codebox)

}


function appendToConsole(string){
	insertTextAtEnd("\n"+ string, resultbox)
}
function clearResult(){
	resultbox.value="";
    codebox.focus();
}

/********* textbox utils *******/
function insertText(iText, elem){
	elem.editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(iText);
}
function insertTextAtEnd(iText, elem){
		var ed=elem.editor,	sc=ed.selectionController
		sc.completeMove(1,false)//codebox.editor.endOfDocument()
		var l=elem.selectionStart,st=ed.rootElement.scrollHeight-16//Math.min(,ed.rootElement.scrollHeight)
		elem.editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(iText);//elem.editor.insertText(iText)//
		elem.selectionStart=l;//	elem.selectionEnd=l+10;
		//sc.intraLineMove(1,true)
		//elem.focus()
		//scrollSelectionIntoView(in short type, in short  region, in boolean isSynchronous)
		//sc.scrollSelectionIntoView(1, 0, false)
		ed.rootElement.scrollTop=st
}
function toggleWrap(codebox){	
	let wr=(codebox.hasAttribute('wrap')&&(codebox.getAttribute('wrap')=='off'))?'on':'off'	
	codebox.setAttribute('wrap',wr)	
	codebox.editor.QueryInterface(Ci.nsIPlaintextEditor).wrapWidth= wr=='off'?-1:1
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
function treeView(table){
	this.rowCount = table.length;
	this.getCellText  = function(row, col){return table[row][col.id]}
	this.getCellValue = function(row, col){return table[row][col.id]}
	this.setTree = function(treebox){this.treebox = treebox}
	this.isEditable = function(row, col){return false}

	this.isContainer = function(row){return false}
	this.isContainerOpen = function(row){return false}
	this.isContainerEmpty = function(row){return true }
	this.getParentIndex = function(row){ return 0}
	this.getLevel = function(row){return 0}
	this.hasNextSibling = function(row){return false}

	this.isSeparator = function(row){return false}
	this.isSorted = function(){ return false}
	this.getImageSrc = function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
		
		//var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
		//props.AppendElement(aserv.getAtom(table[row].depth));		
		//props.AppendElement(aserv.getAtom('a'));		
	};
	this.getCellProperties = function(row,col,props){
		var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
		props.AppendElement(aserv.getAtom('d'+table[row].depth));
	};
	this.getColumnProperties = function(colid,col,props){}
	this.cycleHeader = function(col, elem){}
}

function startCodeCompletion(mode){
	var editor=codebox.editor
	editor.rootElement.normalize()
	var selection = editor.selection//.getRangeAt(0);
	var range = selection.getRangeAt(0);

	var line=range.startContainer,br=line, completionEndIndex=range.startOffset, lineLength=0,evalString
	if(line&&line.nodeType!=3){
		line=line.childNodes[range.startOffset]
		completionEndIndex='end'
	}
	if(line&&line.nodeType!=3)
		line=line.previousSibling
	//2

	if(line&&line.nodeType==3){
		if(completionEndIndex=='end'){
			evalString=line.nodeValue
			lineLength=completionEndIndex=evalString.length
		}else{
			evalString=line.nodeValue
			lineLength=evalString.length
			evalString=evalString.substring(0,completionEndIndex)
		}
	}else{
		 evalString=''
		 lineLength=completionEndIndex=0
	}
	//*********************
	autocompleter.specFunc=false
	var [objString,filterText]=parseJSFragment(evalString)
	var error = false
	if(objString==""){
		var evalObj = getTargetWindow()
	}else{
		try{
			var evalObj = evalStringOnTarget(objString)
		}catch(e){
			appendToConsole('autocomlater got an error: '+e.message)
			return
		}
	}


	//var utils=(window.getInterface||window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface)(Ci.nsIDOMWindowUtils);
	//br=utils.sendQueryContentEvent(utils.QUERY_CARET_RECT, 0, 0, 0, 0)

	if(modernFox){
		var cl=codebox.editor.selection.getRangeAt(0).getClientRects()
		var clLast=cl.length-1
		if(clLast>-1)
			var {right:pX,bottom:pY}=cl[clLast]
		else // bug in firefox when selection is at end getClientRects is empty
			var {right:pX,bottom:pY}=editor.rootElement.lastChild.getClientRects()[0]
	}else{
		br=line||br
		var nbr=br.nextSibling
		if(nbr&&nbr.nodeType==1)
			br=nbr//br.nextSibling
		else if(br.nodeType!='br'){
			br=editor.rootElement.lastChild
		}
		//dump(br.nodeName,br.offsetHeight,br.offsetTop)
		var pX,pY
		pY=br.offsetHeight+br.offsetTop
		pX=br.offsetLeft
		if(lineLength>0)
			pX=completionEndIndex/lineLength*pX
	}
	pX=window.mozInnerScreenX+pX-editor.rootElement.scrollLeft
	pY=window.mozInnerScreenY+pY-editor.rootElement.scrollTop
	//try{autocompleter.finish()}catch(e){}

	autocompleter.create(codebox,mode)
	autocompleter.start(evalObj,filterText,pX,pY)

}

function parseJSFragment(evalString){
	var i=evalString.length-1,i0
	var rx=/[a-z$_0-9]/i
	var next
	var skipWord=function(){i0=i
		while(rx.test(next=evalString.charAt(i))){
			i--;
		}
	}
	var skipString=function(comma){
		next=evalString.charAt(--i)
		while(next&&(next!=comma||evalString.charAt(i-1)=="\\")){
			next=evalString.charAt(--i)
		}
	}
	var skipStacks=function(){
		var stack=[]
		while(next=evalString.charAt(--i)){
			skipWord();//print(next)
			switch(next){
				case ".":
					skipWord();//print(next)
					break;
				case "'":
				case '"':
					skipString(next);
					break;
				case '}':stack.push("{");break;
				case ']':stack.push("[");break;
				case ')':stack.push("(");break;
					stack.push(next);
					break;
				case '{':
				case '[':
				case '(':
									//print(next+"bb");
					if(stack.pop()!==next)
						return;
									//print(next+"bb2");
					break;
				default:   //print(next+22);
					if(stack.length===0)
						return;
			}
		}
	++i;
	}

	skipWord()
	var it=i
	if(next==="."){
		skipStacks()
		i+=1
	}else if(next==="("){
		var irestore=i
		i--;skipWord()
		var funcName=evalString.substring(i+1,it)
		if(funcName&&"QueryInterface,getAttribute,setAttribute,hasAttribute,getInterface,getService".indexOf(funcName)!=-1){
			var jsf=parseJSFragment(evalString.substring(0,i+1))[0]
			autocompleter.specFunc=[jsf,funcName]
		}else if(funcName=="getElementById"){
			autocompleter.specFunc=['',funcName]
		}
		i=irestore
	}
	return [evalString.substr(i,it-i),evalString.substr(it+1)];
}
/******/
/**************************************/
autocompleter={
	mode:false,
	toggleMode: function(all){
		if(typeof all=='undefined')
			this.mode=!this.mode
		else
			this.mode=all
		if(this.mode){
			this.tree.width=620
			this.tree.setAttribute('hidecolumnpicker',false)
			this.tree.columns[2].element.width=32

			this.tree.columns[0].element.setAttribute('hideheader',false)
			this.tree.columns[1].element.setAttribute('hideheader',false)
			this.tree.columns[1].element.hidden=false
			this.tree.columns[2].element.setAttribute('hideheader',false)
		}else{
			this.tree.width=280
			this.tree.columns[2].element.width=32
			this.tree.setAttribute('hidecolumnpicker',true)
			this.tree.columns[0].element.setAttribute('hideheader',true)
			this.tree.columns[1].element.setAttribute('hideheader',true)
			this.tree.columns[1].element.hidden=true
			this.tree.columns[2].element.setAttribute('hideheader',true)
		}

	},
	create: function(inputField,mode){
		if(!this.panel){//get domNodes
			this.inputField=inputField;
			this.panel=document.getElementById("autocomplatePanel")
			this.tree=this.panel.getElementsByTagName('tree')[0]
			this.number=this.panel.getElementsByTagName('label')[0]

			this.bubble=document.getElementById("autocomplate-bubble")
			//tree view doesnt exist for closed popups
			this.panel.setAttribute('onpopupshown','if(event.target==this)autocompleter.setView(0)')
			this.tree.setAttribute('ondblclick','autocompleter.insertSuggestedText(),autocompleter.finish()')
			this.tree.setAttribute('onselect','autocompleter.onSelect()')
		}
		try{this.toggleMode(mode)}catch(e){}

		this.inputField.addEventListener("keypress", this, true);
	},
	start:function(evalObj,filterText,posX,posY){

		if(typeof posX=='undefined'||typeof posY=='undefined'){
			let bo=this.panel.boxObject
			posX=bo.screenX;posY=bo.screenY;

		}
		this.object=evalObj
		this.text=filterText
		var t=Date.now()
		this.unfilteredArray=getProps(evalObj)

		if(this.specFunc)
			this.getSpecialEntries()

		this.filterText=filterText
		this.filter(this.unfilteredArray,filterText)

		if(this.panel.state=='open'){
			this.setView(0)
			this.panel.moveTo(posX,posY)
		}else
			this.panel.showPopup(null,posX,posY, "popup")
	},
	getSpecialEntries: function(){
		var [spo,funcName]=this.specFunc
		var ans=[]
		try{
			if(funcName=='QueryInterface'||funcName=='getService'){
				var spo = evalStringOnTarget(spo)
				if(funcName=='getService')try{
					spo = spo.getService()
				}catch(e){}
				supportedInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=="getInterface"){
				var spo = evalStringOnTarget(spo)
				supportedgetInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=='getElementById'){
				ans=getIDsInDoc()
			}else if(funcName=="getAttribute"||funcName=="setAttribute"||funcName=="hasAttribute"){
				var spo = evalStringOnTarget(spo)
				var att=spo.attributes
				for(var i=0;i<att.length;i++){
					var x=att[i]
					ans.push({name:'\u2555"'+x.nodeName+'")',comName: '"'+x.nodeName.toLowerCase(),description:x.value, depth:-1,special:true})
				}
			}
		}catch(e){Cu.reportError(e)}
		this.unfilteredArray=ans.concat(this.unfilteredArray)
	},
	setView: function(si){
		if(typeof si!='number')
			si=this.tree.currentIndex
		this.tree.view=new treeView(this.sortedArray)
		this.tree.view.selection.select(si);
        this.tree.treeBoxObject.ensureRowIsVisible(si);
		this.number.value=si+':'+this.sortedArray.length+'/'+this.unfilteredArray.length
	},
	finish:function(i){
		this.hidden=true
		this.inputField.removeEventListener("keypress", this, true);
		window.removeEventListener("mousedown",this.u,true)

		this.panel.hidePopup()
	},

	filter:function(data,text){
		var table =[];
		if(!text){
			data.forEach(function(val) {table.push(val)})
			table.sort()
			this.sortedArray=table
			return;
		}
		var filterText=text.toLowerCase()
		var filterTextCase=this.text

		//**funcs*****/
		function springyIndex(val){
			var lowVal=val.comName
			var priority=0,lastI=0,ind1=0;
			if(val.name.indexOf(filterTextCase)===0){
				val.priority=-2
				table.push(val);
				return;//exact match
			}
			for(var j=0;j<filterText.length;j++){
				lastI = lowVal.indexOf(filterText[j],ind1);				
				if(lastI===-1)
					break;//doesn't match
				priority += lastI-ind1
				ind1 = lastI+1;
			}
			if(lastI != -1){
				val.priority=priority
				table.push(val);
			}
		}

		function sorter(a,b){

		}
		var sortVals=['priority','depth','comName']

		data.forEach(springyIndex)
		table.sort(function (a, b) {
			if(!a.special&&b.special) return 1;
			if(a.special&&!b.special) return -1;//???
			for each(var i in sortVals){
			  if (a[i]<b[i]) return -1;
			  if (a[i]>b[i]) return 1;
			}
			return 0;
		})
		this.sortedArray=table
	},

	handleEvent: function(event){
		if(String.fromCharCode(event.charCode)=='t'&&event.ctrlKey){
			this.toggleMode()
			event.preventDefault();event.stopPropagation();
		}
		var t
		if(event.ctrlKey||event.altKey){
			if(event.charCode!=0&&(t=String.fromCharCode(event.charCode))){
				if (t=='.'){//complete object and start inspecting it
					var o=this.sortedArray[this.tree.currentIndex]
					if(o){
						this.insertSuggestedText(t)
						this.start(o.object,"")
					}
				}
			}
			return;
		}
		switch(event.keyCode){
			case KeyEvent.DOM_VK_HOME:
				if(this.moveTreeSelectionBig('top')){
				event.preventDefault();event.stopPropagation();
				}
				break
			case KeyEvent.DOM_VK_END:
				if(this.moveTreeSelectionBig('end')){
				event.preventDefault();event.stopPropagation();
				}
				break
			case KeyEvent.DOM_VK_UP:
				this.moveTreeSelection(-1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				this.moveTreeSelection(1);
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_BACK_SPACE:
				this.text=this.text.substr(0,this.text.length-1)
				this.filter(this.unfilteredArray,this.text);
				this.setView(0);
				break
			case KeyEvent.DOM_VK_RETURN:
				this.insertSuggestedText();
				this.finish()
				event.preventDefault();event.stopPropagation();
				break
			case 46:
			this.startMain(this.object[this.selected()],"")
				break;
			case KeyEvent.DOM_VK_RIGHT:
				this.finish();break
			case KeyEvent.DOM_VK_RIGHT:
			default:

				if(event.charCode==0){
					this.finish();event.preventDefault();event.stopPropagation();break
				}
				var t=String.fromCharCode(event.charCode)
				if (!event.ctrlKey&&/[; \+\-\*\:;\]\)\(\)\}\{\?]/.test(t))
					this.finish()

				this.text+=t;

				this.filter(this.unfilteredArray,this.text);
				this.setView(0)
				//break
		}
	},

	moveTreeSelectionBig: function(to){
		var tree=this.tree,view=tree.view
		switch(to){
			case 'end':var c=view.rowCount-1;break
			case 'top':var c=0;break
			case 'pup':var c=view.rowCount-1;break
			default: return false
		}

		if(c == tree.currentIndex)
			return false
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c)//(c>0?c:0)
		return true
	},
	moveTreeSelection: function(direction){
		var tree=this.tree,view=tree.view,c=view.selection.currentIndex
		c+=direction
		if(c>=view.rowCount)	c=-1
		if(c<-1)				c=view.rowCount-1
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c>=0?c:(direction>0?0:view.rowCount-1))
	},
	selectedText: function(){
		var c=this.tree.view.selection.currentIndex
		if(c<0) return
		return this.sortedArray[c].name
	},
	insertSuggestedText: function(additionalText){
		var c=this.tree.view.selection.currentIndex
		if(c<0) return
		var c=this.sortedArray[c]
		var isSpecial=c.special
		var text=c.name

		var l=this.text.length
		if(isSpecial){
			text=text.substr(1)
		}else if(/^\d*$/.test(text)){
			text='['+text+']'
			l++
		}else if(!/^[a-z$_][a-z$_0-9]*$/i.test(text)){
			text='["'+text+'"]'
			l++
		}
		if(additionalText)
			text=text+additionalText
		this.inputField.selectionStart=this.inputField.selectionStart-l;
		insertText(text, this.inputField)
	},

	/****helper bubble******/
	onSelect: function(immediate){
		if(!immediate){
			if(this.onSelectTimeOut)
				clearTimeout(this.onSelectTimeOut)
			this.onSelectTimeOut=setTimeout(function(){autocompleter.onSelect(true)},10)
			return
		}
		/**	 doOnselect  **/
		this.onSelectTimeOut=null
		
		try{
			var o=this.tree.currentIndex
			if(o<0||o>this.tree.view.rowCount){
				item.textContent=''
				return
			}			
			var o = this.selectedObject = this.sortedArray[o]
			if(!o)
				return//why is o undefined?
			var text=setget(this.object,o.name)
			if(!text)
				text=o.object
			text += '\n'+o.description
			if(o.depth!=0)
				text += '\ninherited from level: '+o.depth
			this.sayInBubble(text)
		}catch(e){}
	},
	sayInBubble: function(text, append){
		if(append){
			insertTextAtEnd('\n'+text, this.bubble)
		}else
		this.bubble.value=text
	},
}
getIDsInDoc=function(){
	var doc=getTargetWindow().document
	var xpe = new XPathEvaluator();
	var nsResolver = xpe.createNSResolver(doc.documentElement);
	result = xpe.evaluate('//*[@id]', doc.documentElement, nsResolver,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

	var ans=[]
    for(var i = 0; i < result.snapshotLength; i++){
		var x=result.snapshotItem(i).id
		ans[i]={name:' "'+x+'")',comName: 'ci.'+x.toString().toLowerCase(),description:'id', depth:-1,special:true}
    }
	return ans
}
getClassesInDoc=function(doc){
	var xpe = new XPathEvaluator();
	var nsResolver = xpe.createNSResolver(doc.documentElement);
	result = xpe.evaluate('//*[@class]', doc.documentElement, nsResolver,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

	var ans=[]
    for(var i = 0; i < result.snapshotLength; i++){
		var x=result.snapshotItem(i).className
		if(ans.indexOf(x)==-1)ans.push(x)
    }
	return ans
}


/**======================-==-======================*/
jsExplore={}
jsExplore.qi=function(){
	autocompleter.start(jn.qi(autocompleter.object),autocompleter.filterText)
}

jsExplore._p=function(){
	var protoList=[autocompleter.object]
	var p=protoList[0]
	while(p=p.__proto__)
		protoList.push(p)
	jn.say(protoList.join('\n'))
}
jsExplore.si=function(){
	autocompleter.sayInBubble(
		'interfaces supported by\n'+
		autocompleter.object+'\n'+
		supportedInterfaces(autocompleter.object).join('\n')
	
	
	)
}
jsExplore.gs=function(){
	jn.say(setget(autocompleter.object,autocompleter.selectedText()))
}
jsExplore.all=function(){
	autocompleter.toggleMode()
}
jsExplore.reveal=function(){
	if(!Services.jsd.isOn){
		Services.jsd.asyncOn(jsExplore.reveal)
		return
	}
	let script = Services.jsd.wrapValue(autocompleter.selectedObject.object).script
	if(script)
		$shadia.externalEditors.edit(script.fileName, script.baseLineNumber)
}
jsExplore.eval=function(){
	var f = autocompleter.selectedObject.object
	if(typeof f == 'function')
		autocompleter.sayInBubble(jn.inspect(f()), true)
}
/*****************
 *  end of code completion utils
 ****************************************************************/




function initShortCuts(){
	codebox.addEventListener("keydown", this, true);
	codebox.addEventListener("keypress", this.keypress, true);
	//codebox.addEventListener("keyup", this, true);
}

initShortCuts.prototype={
	pressed:false,
	stopEvent:function(e){
		e.preventDefault();e.stopPropagation();
	},
	handleEvent:function(e){
		if(e.ctrlKey)
			switch(e.which){
				case KeyboardEvent.DOM_VK_K:
				case KeyboardEvent.DOM_VK_SPACE:
					//autocompleter.toggleMode()
					startCodeCompletion(e.shiftKey?!autocompleter.mode:autocompleter.mode);
					this.stopEvent(e)
					break
				case KeyboardEvent.DOM_VK_RETURN:
					if(e.shiftKey)
						printProperties()
					else
						executeJS();
					this.stopEvent(e)
					break
				case KeyboardEvent.DOM_VK_DOWN:
					nextCommandFromHistory();
					this.stopEvent(e)
					break
				case KeyboardEvent.DOM_VK_UP:
					previousCommandFromHistory();
					this.stopEvent(e)
					break
			}
	},
	keypress:function(e){
		
		if ((e.keyCode == e.DOM_VK_TAB) && !(e.ctrlKey || e.altKey || e.metaKey)) {//tab key

			//var start = t.selectionStart, end = t.selectionEnd;
			var ed=codebox.editor
			var sel=ed.selection
			var text=sel.toString()
			var selCon=ed.selectionController
			if(!text){
				insertText('\t', codebox)
			}else{
				var start, end = codebox.selectionEnd;
				sel.collapseToStart()
				selCon.intraLineMove(false,false)
				start = codebox.selectionStart
				codebox.selectionEnd = end

				text = codebox.value.slice(start, end)
				text = e.shiftKey?text.replace('\n\t','\n','g').replace(/^\t/,''):
								'\t'+text.replace('\n','\n\t','g')
				insertText(text, codebox)
				codebox.selectionStart=start
			}

			e.stopPropagation();
			e.preventDefault();
		}
		if(String.fromCharCode(e.charCode).toLowerCase()=='d'&& e.ctrlKey){
			var ed=codebox.editor
			var sel=ed.selection
			var text=sel.toString()
			var selCon=ed.selectionController
			if(!text){
				selCon.intraLineMove(false,false)
				selCon.intraLineMove(true,true)
				text=sel.toString()
				sel.collapseToEnd()
				insertText('\n'+text, codebox)
			}else{
				sel.collapseToEnd()
				insertText(text, codebox)
			}
			e.stopPropagation();
			e.preventDefault();
		}
	},
}





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