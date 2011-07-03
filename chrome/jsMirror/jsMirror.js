//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
//Cu.import('resource://xqjs/Services.jsm');


jn={};
jn.say=function(a){
	EJS_appendToConsole(a?a.toString():a)
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



/*
jn.inspect=function(x,long){
	var Class=jn.getClass(x)
	
	if(x == null) return String(x);
	var name, t = typeof x;
	switch(t){
		case 'object': break;
		//case 'string': return x;
		case 'function':
			if(long) return x.toString(0)
			name=x.toString()

			var i=name.indexOf("{")
			var t=name.substr(i)=='{[native code]}'?'function[n]': 'function'

			name=t+name.substring(name.indexOf(" "),i-1)+'~'+x.length

			return name
		case 'xml': x = x.toXMLString();
		default: return  t+' '+x;
	}
	try{
		var l=x.length
	}catch(e){}//[xpconnect wrapped native prototype].length: throws Illegal operation on WrappedNative prototype object

	if(long&&typeof l==='number' && typeof x.push==='function' &&typeof x.splice==='function') {
		name = 'array~  '+x.length+'\n   '+x.join(',\n   ');return name
	}
	//d.constructor
	var name = '`'+Class+'` '+x.toString()//\u25b7'\u25ba'
	//for files
	try{
		if(x.spec)
			return name+" "+x.spec
		else if(x.path)
			return name+" "+x.path
		//for dom nodes
		if(x.nodeName)
			name+=x.nodeName
		if(x.id)
			name+="#"+x.id
		if(x.className)
			name+="."+x.className.toString().replace(" ",".",'g')
		if(x.value)
			name+=" ="+x.value.substring(0,30)
		else if(x.nodeValue)
			name+=" ="+x.nodeValue.substring(0,30)
		if(typeof l==='number')
			name+=' ~'+l
	}catch(e){}

	return name
}*/
/*function outer() {
    var communicationChannel = 24;
    function innerGetter() {
        return communicationChannel;
    }
    function innerSetter(x) {
        communicationChannel = 42;
    }
var io=1
    return [innerGetter, innerSetter];
}
i=outer()
ui=jn.getParent(i[0])
*/
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
jn.getClass=getClass

jn.bait=(function(a){
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
})()


jn.exec=function go(s){
  _win=EJS_currentTargetWin

  EJS_executeJS
  /*if (_win.closed) {
    jn.printError("Target window has been closed.");
    return;
  }

  try { ("jn" in _win) }
  catch(er) {
    jn.printError("The JavaScript Shell cannot access variables in the target window.  The most likely reason is that the target window now has a different page loaded and that page has a different hostname than the original page.");
    return;
  }

  if (!("jn" in _win))
    initTarget(); // silent*/

	var code = codebox.value;






  // Evaluate Shell.question using _win's eval (this is why eval isn't in the |with|, IIRC).
  _win.location.href = "javascript:try{\
  jn.yyyyyyyyyy(eval(' "+ code + String.fromCharCode(10) +" ')); \
  } catch(er) {jn.yyyyyyyyyyyyyy(er)}; void 0";

  	EJS_appendToConsole(result);
	codebox.focus();
   // return result;
}

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

jn.supportedInterfaces=supportedInterfaces
jn.setget=setget
jn.qi=qi
jn.compare=compare
jn.wr=wr

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
 
 /***************************************/
var stackStartLineNumber
function EJS_executeJS(sel){
/*jn.exec();return;*/
    var code = sel?codebox.editor.selection.toString():codebox.value;


    try{
    	var result = EJS_evalStringOnTarget(code)
    }catch(e){
		result=EJS_LastError=e;
		Components.utils.reportError(e)
        EJS_appendToConsole(ejsInspectError(e));
        codebox.focus();
        return result;
    }
    EJS_appendToConsole(jn.inspect(result,'long'));

    codebox.focus();
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

function EJS_evalStringOnTarget(string){
	var evalString = string//EJS_replaceShortcuts(string);
	var contentWin = null
	if(EJS_cntContentWinCB.checked==true && EJS_cntContentWinCB.disabled==false){
		/* var win = EJS_currentTargetWin.content.wrappedJSObject
		stackStartLineNumber=0
		win.jn=jn
		jn.yyyyyyy=function(a){this.result=a}
		win.location.href = "javascript:try{\
jn.yyyyyyyy(eval('"+ evalString +" ')); \
} catch(er) {jn.yyyyyyyyyyyyyyy(er)}; void 0";
		return jn.result */
	}else{
		EJS_currentTargetWin.jn=jn
		stackStartLineNumber=Components.stack.lineNumber
		var ans=EJS_currentTargetWin.eval(evalString)
		if(EJS_currentTargetWin!=window)EJS_currentTargetWin.jn=''
		return ans
	}
}

/**
 * end of tral
 ********************************************************/







var EJS_currentTargetWin = null;
var EJS_commandHistory = new Array();
var EJS_currentCommandHistoryPos = 0;
var EJS_allOpenWins = new Object();

//Form elements
var EJS_cntTargetWinML = null;
var EJS_cntContentWinCB = null;
var codebox = null;
var EJS_cntFunctionNameML = null;


function EJS_byId(id){
	return document.getElementById(id);
}

function EJS_doOnload(){

    try{
	    EJS_initGlobVars();
		EJS_shortCuts=new EJS_initShortCuts()
	    codebox.focus();
    }catch(e){throw e }

}

function EJS_doOnUnload(){
	var maxHistSize = 100
	var startIndex = Math.max(0, EJS_commandHistory.length-maxHistSize)
	EJS_commandHistory = EJS_commandHistory.slice(startIndex)
	ConfigManager.saveHistory(EJS_commandHistory);
}


function EJS_initGlobVars(){
	EJS_cntTargetWinML = EJS_byId("targetWin")
	//EJS_cntTargetWinML.editable=true
	EJS_cntContentWinCB = EJS_byId("contentWinCB")
	codebox = EJS_byId("jsCode")
	EJS_cntFunctionNameML = EJS_byId("functionName")

	if(window.opener){
		EJS_currentTargetWin=shadowInspector.getTopWindow(window.opener)
		var opener=window.opener
		var mediator = Cc["@mozilla.org/rdf/datasource;1?name=window-mediator"].getService(Ci.nsIWindowDataSource);
		var resources = EJS_cntTargetWinML.menupopup.childNodes//[6].id
		for(var i=0;i<resources.length;i++)
			if(mediator.getWindowForResource(resources[i].id)==opener){
				EJS_cntTargetWinML.selectedIndex = i;
				var found=true
				break
			}

	}
	found||(EJS_cntTargetWinML.selectedIndex=1);

	EJS_targetWinChanged();
	EJS_commandHistory = ConfigManager.readHistory();
	EJS_currentCommandHistoryPos = EJS_commandHistory.length
}

function EJS_targetWinChanged(){
	//Set current target
  	EJS_currentTargetWin = EJS_getSelectedWin()
}



function EJS_getSelectedWin(){
	var mediator = Cc["@mozilla.org/rdf/datasource;1?name=window-mediator"].getService(Ci.nsIWindowDataSource);
  	var resource = EJS_cntTargetWinML.selectedItem.getAttribute('id')
  	return mediator.getWindowForResource(resource);
}

/***/
function EJS_commentBlock(){
	commentBlock(codebox)
	codebox.focus();
}
function commentBlock(elem){
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
function EJS_commentLine() {
    commentLine(codebox)
    codebox.focus();
}
/*pp*/
function commentLine(elem) {
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

EJS_appendToConsole(alltext+" "+nextLine+" "+elem.selectionEnd)
}
/*pp*/
//codebox.style.fontSize = "12px"
function insertTimer(){
var st=codebox.selectionStart, en=codebox.selectionEnd
codebox.selectionEnd=st
var text='timerStart=Date.now()\nfor(var timerI=0;timerI<100;timerI++){\n\n\n}timerStart-Date.now()'
insertText(text,codebox)

}



function EJS_appendToConsole(string){
   var resultTB = document.getElementById("result");
  insertTextAtEnd("\n"+ string, resultTB)
}

function EJS_clearResult(){
    document.getElementById("result").value="";
    document.getElementById("jsCode").select();
}

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

function EJS_printProperties(){
	EJS_appendToConsole("Properties for object:");
	var target = EJS_executeJS();
	EJS_printPropertiesForTarget(target)
}

function EJS_printPropertiesForTarget(target){
	var result = new Array();
	if(target.wrappedJSObject!=null){
		target = target.wrappedJSObject;
	}
	var index = 0;
	for(var i in target){
		//try catch as error could occur, but why???
		try{
    		result[index++] = i + ": " + target[i];
		}catch(e){
			result[index++] = i + ": " + e
		}
	}
	EJS_appendToConsole(index+'\n'+result.join("\n"));
}

function EJS_nextCommandFromHistory(){
	if(EJS_currentCommandHistoryPos>=EJS_commandHistory.length-1)
		return;
	codebox.value = EJS_commandHistory[++EJS_currentCommandHistoryPos];
}

function EJS_previousCommandFromHistory(){
	if(EJS_currentCommandHistoryPos==0)
		return;
	codebox.value = EJS_commandHistory[--EJS_currentCommandHistoryPos];
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
		var evalObj = EJS_currentTargetWin
	}else{
		try{
			var evalObj = EJS_evalStringOnTarget(objString)
		}catch(e){
			EJS_appendToConsole('autocomlater got an error: '+e.message)
			return
		}
	}


	//var utils=(window.getInterface||window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface)(Ci.nsIDOMWindowUtils);
	//br=utils.sendQueryContentEvent(utils.QUERY_CARET_RECT, 0, 0, 0, 0)

	if(modernfox){
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
		if(funcName&&"QueryInterface,getAttribute,setAttribute,hasAttribute,getInterface".indexOf(funcName)!=-1){
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
			if(funcName=='QueryInterface'){
				var spo = EJS_evalStringOnTarget(spo)
				supportedInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=="getInterface"){
				var spo = EJS_evalStringOnTarget(spo)
				supportedgetInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcName=='getElementById'){
				ans=getIDsInDoc()
			}else if(funcName=="getAttribute"||funcName=="setAttribute"||funcName=="hasAttribute"){
				var spo = EJS_evalStringOnTarget(spo)
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
	}

	,handleEvent: function(event){
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
				this.moveTreeSelectionBig('top');
				event.preventDefault();event.stopPropagation();
				break
			case KeyEvent.DOM_VK_END:
				this.moveTreeSelectionBig('end');
				event.preventDefault();event.stopPropagation();
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
/* listbox{
-moz-user-focus:none;
}

*/
	moveTreeSelectionBig: function(to){
		var tree=this.tree,view=tree.view
		switch(to){
			case 'end':var c=view.rowCount-1;break
			case 'top':var c=0;break
			case 'pup':var c=view.rowCount-1;break
			default: return
		}
		view.selection.timedSelect(c, tree._selectDelay);
		tree.treeBoxObject.ensureRowIsVisible(c)//(c>0?c:0)
	}
	,moveTreeSelection: function(direction){
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
			var o=this.sortedArray[o]
			if(!o)return//why is o undefined?
			var text=setget(this.object,o.name)
			if(!text)text=o.object
			this.sayInBubble(text+'\n'+o.description+'\n'+o.depth)
		}catch(e){}
	},
	sayInBubble: function(text){
		/*if(this.bubble.state=='open'){
			this.bubble.moveTo(0,0)
		}else
			this.bubble.showPopup(null,0,0, "popup")
		var item = this.bubble.firstChild;
		if(!item){
			item=document.createElementNS("http://www.w3.org/1999/xhtml","div");
			this.bubble.appendChild(item);
		}
		item.textContent=text*/
		this.bubble.value=text
	},
}
getIDsInDoc=function(){
	var doc=EJS_currentTargetWin.document
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


/********************

as=function(x){
var t=1
var l=2
var f=function(s){return eval(s)}

return f
}

ty=as(455)
ar=window.getInterface(Ci.nsIDOMWindowUtils).getParent(ty)
typeof ar
for (var i in ar){
  jn.say(i+':  '+ar[i])
}


ar.toString=function(){return 'call'}
ar.toString()


top.gIdentityHandler


shadia.createInfoPanel()
shadia.showPanel()
shadia.fillPanel(gURLBar)
shadia.infoPanel.firstChild.innerHTML=jn.setget(window,'top')

shadia.infoPanel.style.backgroundColor='LightYellow'

tooltip{-moz-appearance:none!important;background-color: LightYellow!important;}
//shadia.inspect(shadia.infoPanel)

shadia.getDataUrl=function () {

    var code = "D550FF";
    var code = "tooltip{-moz-appearance:none!important;background-color: LightYellow!important;};*[shadia-lighted=\"0\"]{outline:1px solid rgb( 83,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}*[shadia-lighted=\"1\"]{outline:1px solid rgb(173,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}*[shadia-lighted=\"2\"]{outline:1px solid rgb(213,80,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}*[shadia-lighted=\"off\"]{outline:1px solid rgb(80,213,255)!important;outline-offset:-3px!important;-moz-outline-radius:2px!important;}*[shadia-lighted=\"lime\"]{outline:2px solid lime!important;outline-offset:-2px!important;-moz-outline-radius:2px!important;}*[shadia-lighted=\"click\"]{outline:2px solid #d528ff!important;outline-offset:-2px!important;-moz-outline-radius: 2px!important;}";
    var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
    return ios.newURI("data:text/css," + encodeURIComponent(code), null, null);
}
shadia.register


()

************/

var modernfox=!!Object.getOwnPropertyNames
/**============-=========-===============**/
if(!modernfox)//for old versions
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
/*****************
 *  end of code completion utils
 ****************************************************************/



cleardump = function(){
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.reset()
	consoleService.logStringMessage(""); //new Date() + ":  "
    //Components.utils.reportError(e); // report the error and continue execution
}

function EJS_initShortCuts(){
	codebox.addEventListener("keydown", this, true);
	codebox.addEventListener("keypress", this.keypress, true);
	//codebox.addEventListener("keyup", this, true);
}

EJS_initShortCuts.prototype={
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
						EJS_printProperties()
					else
						EJS_executeJS();
					this.stopEvent(e)
					break
				case KeyboardEvent.DOM_VK_DOWN:
					EJS_nextCommandFromHistory();
					this.stopEvent(e)
					break
				case KeyboardEvent.DOM_VK_UP:
					EJS_previousCommandFromHistory();
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




function EJS_openCommandWin(){
	document.location=document.location
   toOpenWindowByType('shadia:jsMirror', "chrome://executejs/content/executejs/executeJS.xul")
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

function EJS_printPropertiesForTarget(target){
  var result = new Array();
  if(target.wrappedJSObject!=null){
    target = target.wrappedJSObject;
  }
  var index = 0;

  for(var i in target){
    //try catch as error could occur, but why???
    try{
        result[index++] = i + ": " +consoleSummary( target[i]);
    }catch(e){
      result[index++] = i + ": " +consoleSummary( e)
    }
  }
  EJS_appendToConsole(index+'\n'+result.join("\n"));
}


/**
u=window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(
Ci.nsIDOMWindowUtils)
u.sendSelectionSetEvent(codebox,0,false)
//window.addEventListener('mousedown',function(e){EJS_appendToConsole(e)},false)
u.sendMouseEvent('mousedown',150,150,0,2,0)
codebox.selectionStart=codebox.selectionStart-20
codebox.selectionEnd=codebox.selectionEnd+20














[window.mozInnerScreenY-
codebox.boxObject.screenY,codebox.boxObject.y]

line=codebox.editor.selection.focusNode.nextSibling

r=line.getBoundingClientRect()
pY=2*line.offsetHeight+line.offsetTop

pX=line.offsetLeft

pX=window.mozInnerScreenY+pX
pY=window.mozInnerScreenY+pY
autocompleter.finish()

autocompleter.start(autocompleter.object,'',pX,pY)



/**

[codebox.editor.rootElement.scrollTop,
codebox.editor.rootElement.childNodes[10].getBoundingClientRect().top]

//codebox.boxObject.*/

//autocompleter.finish()

var ConfigManager = {
	CONFIG_FILE_NAME: "executejs_history.xml",
	thisFile: 'chrome://shadia/content/jsMirror/jsMirror.xul',

	readHistory: function(){
		var configFile = this.getConfigFile();
		var xmlData = FileIO.read(configFile);
		var data = new XML(xmlData);
		var commandHistory = new Array();
		var histEntries = data.entry
		for(var i=0; i<histEntries.length(); i++){
			commandHistory[i] = histEntries[i].toString()
		}
		return commandHistory;
	},

	saveHistory: function(historyArray){
		var root = <JsCodeHistory></JsCodeHistory>;
		for(var i=0; i<historyArray.length; i++){
			var command = historyArray[i];
			var entry = <entry>{command}</entry>
			root.appendChild(entry);
		}
		var configFile = this.getConfigFile();
		FileIO.write(configFile, root.toXMLString());

	},

	getConfigFile: function(){
		var fileurl = chromeToPath(this.thisFile);
		var configFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		configFile.initWithPath(fileurl);
		configFile=configFile.parent.parent.parent.parent
		configFile.append(this.CONFIG_FILE_NAME)
		configFile = FileIO.open(configFile.path);
		if(!configFile){
			throw new Error("Config File could not be created")
		}
		if(!configFile.exists()){
			var success = FileIO.create(configFile);
			if(!success){
				throw new Error("Config File could not be created")
			}
		}
		return configFile;
	}
}


function chromeToPath (aPath) {
   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
   var rv;

      var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
        rv = cr.convertChromeURL(uri).spec;

        if (/^file:/.test(rv))
          rv = this.urlToPath(rv);
        else
          rv = this.urlToPath("file://"+rv);

      return rv;
}

function urlToPath (aPath) {
    if (!aPath || !/^file:/.test(aPath))
      return;
    var rv;
	var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}
/*
stylePath='chrome://global/content/bindings/toolbar.xml#toolbarpaletteitem'
var fileurl = chromeToPath(stylePath);
fileurl=fileurl.substring(2,fileurl.indexOf('!'))
var file1 = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
file1.initWithPath(fileurl);
file1.reveal()
*/

/** ---------------------------------------**\
 | Basic Directory IO object based on JSLib |
 | source code found at jslib.mozdev.org    |
\**----------------------------------------**/
var FileIO ={
	localfileCID:  '@mozilla.org/file/local;1',
	localfileIID:  Components.interfaces.nsILocalFile,

	finstreamCID:  '@mozilla.org/network/file-input-stream;1',
	finstreamIID:  Components.interfaces.nsIFileInputStream,

	foutstreamCID: '@mozilla.org/network/file-output-stream;1',
	foutstreamIID: Components.interfaces.nsIFileOutputStream,

	sinstreamCID:  '@mozilla.org/scriptableinputstream;1',
	sinstreamIID:  Components.interfaces.nsIScriptableInputStream,

	suniconvCID:   '@mozilla.org/intl/scriptableunicodeconverter',
	suniconvIID:    Components.interfaces.nsIScriptableUnicodeConverter,

	open: function(path){
		try{
			var file = Components.classes[this.localfileCID].createInstance(this.localfileIID);
			file.initWithPath(path);
			return file;
		}
		catch(e){
			return false;
		}
	},
	read: function(file, charset){
		try{
			var data = new String();
			var fiStream = Components.classes[this.finstreamCID].createInstance(this.finstreamIID);
			var siStream = Components.classes[this.sinstreamCID].createInstance(this.sinstreamIID);
			fiStream.init(file, 1, 0, false);
			siStream.init(fiStream);
			data += siStream.read(-1);
			siStream.close();
			fiStream.close();
			if (charset){
				data = this.toUnicode(charset, data);
			}
			return data;
		}
		catch(e){
			return false;
		}
	},

	write: function(file, data, mode, charset){
		try{
			var foStream = Components.classes[this.foutstreamCID].createInstance(this.foutstreamIID);
			if (charset){
				data = this.fromUnicode(charset, data);
			}
			var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
			if (mode == 'a'){
				flags = 0x02 | 0x10; // wronly | append
			}
			foStream.init(file, flags, 0664, 0);
			foStream.write(data, data.length);
			// foStream.flush();
			foStream.close();
			return true;
		}
		catch(e){
			return false;
		}
	},

	create: function(file){
		try{
			file.create(0x00, 0664);
			return true;
		}catch(e){
			return false;
		}
	},

	unlink: function(file){
		try{
			file.remove(false);
			return true;
		}catch(e){
			return false;
		}
	},

	path: function(file){
		try{
			return 'file:///' + file.path.replace(/\\/g, '\/').replace(/^\s*\/?/, '').replace(/\ /g, '%20');
		}
		catch(e){
			return false;
		}
	},

	toUnicode: function(charset, data){
		try{
			var uniConv = Components.classes[this.suniconvCID]
								.createInstance(this.suniconvIID);
			uniConv.charset = charset;
			data = uniConv.ConvertToUnicode(data);
		}
		catch(e){
			// foobar!
		}
		return data;
	},

	fromUnicode: function(charset, data){
		try{
			var uniConv = Components.classes[this.suniconvCID]
								.createInstance(this.suniconvIID);
			uniConv.charset = charset;
			data = uniConv.ConvertFromUnicode(data);
			// data += uniConv.Finish();
		}
		catch(e){
			// foobar!
		}
		return data;
	},

	getWriteStream: function(file){
		var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(file, 0x02 | 0x08 | 0x20, 420, -1);
		return stream;
	}

}

//




/*


HTMLParagraphElement.prototype

getClass(Element.prototype)

getClass(gURLBar.constructor.prototype)

*/


