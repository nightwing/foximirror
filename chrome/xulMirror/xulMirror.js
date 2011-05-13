//*****************************************//
var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
//Cu.import('resource://xqjs/Services.jsm');

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
		xblCode = EJS_byId("xblCode")
		xulCode = EJS_byId("xulCode")
		overlayCode = EJS_byId("overlayCode")
		codebox=xulCode;
		dump(codebox)
		codebox.focus();
		var a=window.location.href
		a=a.slice(0, a.lastIndexOf('/')+1)
		
		oldVals.xblCode=xblCode.value=makeReq(a+'template.xbl')
		oldVals.xulCode=xulCode.value=makeReq(a+'template.xul')
		oldVals.overlayCode=overlayCode.value=makeReq(a+'template.overlay')
		
		onChange("xblCode", false)
		
		wrap= EJS_byId("wrap")
		result= EJS_byId("result")

		
		EJS_shortCuts=new EJS_initShortCuts()
    }catch(e){throw e }
	
}

function EJS_doOnUnload(){
}



toggleOrient=function(){
	var or=wrap.style.MozBoxOrient=='horizontal'?'vertical':'horizontal'
	wrap.style.MozBoxOrient=or
	wrap.children[1].setAttribute("orient",or)
	wrap.children[1].firstChild.removeAttribute("height")
	wrap.children[1].firstChild.removeAttribute("width")
}
var changeTimeout,oldVals={}
onChange=function(id, afterTimeout){
	dump(id)
	var val=window[id].value
	
	if(oldVals[id]==val)return	
	if(!afterTimeout){
		clearTimeout(changeTimeout)
		changeTimeout=setTimeout(function(){onChange(id,true)},500)
		return
	}
	oldVals[id]=val	
	var xbl="data:text/xml" + ";base64," + btoa(oldVals.xblCode);
	var overlay="data:text/xml" + ";base64," + btoa(oldVals.overlayCode);
	//xbl="data:text/xml;charset=utf-8,"+encodeURIComponent(oldVals.xblCode)
	var xul=oldVals.xulCode.replace('xulMirrorBindingURL',xbl).replace('xulMirrorOverlayURL',overlay)
	dump(xul)
	xul="data:application/vnd.mozilla.xul+xml" + ";base64," + btoa(xul);
	
	result.contentWindow.location=xul
	//result.contentWindow.location="data:application/vnd.mozilla.xul+xml," + encodeURIComponent(old)
	dump(41)
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
var text='timerStart=Date.now()\nfor(var timerI=0;timerI<100;timerI++){\n\n\n}timerStart=Date.now()'
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
		//elem.selectionStart=l;//	elem.selectionEnd=l+10;
		//sc.intraLineMove(1,true)
		//elem.focus()
		//scrollSelectionIntoView(in short type, in short  region, in boolean isSynchronous)
		//sc.scrollSelectionIntoView(1, 0, false)
		ed.rootElement.scrollTop=st
	//dump('--------------',st,ed.rootElement.scrollTop,ed.rootElement.scrollHeight)
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
	};
	this.getCellProperties = function(row,col,props){
		/*if((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		}*/
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
dump('jsMirror---->',objString,filterText)
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
dump(evalObj,'*************')

	//
	//bo = codebox.boxObject;var [pX,pY]=[bo.screenX+bo.width,bo.screenY]
	//line=codebox.editor.selection.focusNode.nextSibling
	br=line||br
	var nbr=br.nextSibling
	if(nbr&&nbr.nodeType==1)
		br=nbr//br.nextSibling
	else if(br.nodeType!='br'){
		br=editor.rootElement.lastChild
	}
	dump(br.nodeName,br.offsetHeight,br.offsetTop)
	var pX,pY
	pY=br.offsetHeight+br.offsetTop
	pX=br.offsetLeft
	if(lineLength>0)
		pX=completionEndIndex/lineLength*pX

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
	dump(next)		
	if(next==="."){
		skipStacks()
		i+=1
	}else if(next==="("){
		var irestore=i	
		i--;skipWord()
		dump('-->',next,i0,i,it)
		var funcName=evalString.substring(i+1,it)
		if(funcName=="QueryInterface"||funcName=="getAttribute"||funcName=="setAttribute"){
			var jsf=parseJSFragment(evalString.substring(0,i+1))[0]
			dump(jsf,funcName,evalString.substr(it+1))
			autocompleter.specFunc=[jsf,funcName]
		}else if(funcName=="getElementById"){
			autocompleter.specFunc=['',funcName]
		}
		i=irestore
	}
	return [evalString.substr(i,it-i),evalString.substr(it+1)];
}

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
		if(!this.panel){
			this.inputField=inputField;
			this.panel=document.getElementById("autocomplatePanel")
			this.tree=this.panel.getElementsByTagName('tree')[0]
			this.number=this.panel.getElementsByTagName('label')[0]
		}
		try{this.toggleMode(mode)}catch(e){}
		this.panel.setAttribute('onpopupshown','autocompleter.setView(0)')
		this.tree.setAttribute('ondblclick','autocompleter.insertSuggestedText(),autocompleter.finish()')
		this.inputField.addEventListener("keypress", this, true);
	},
	start:function(evalObj,filterText,posX,posY){
			dump('start',posX,posY)

		if(typeof posX=='undefined'||typeof posY=='undefined'){
			let bo=this.panel.boxObject
			posX=bo.screenX;posY=bo.screenY;

		}
		dump('start',posX,posY);
		this.object=evalObj
		this.text=filterText
		var t=Date.now()
		this.unfilteredArray=getProps(evalObj)
		
		if(this.specFunc)
			this.getSpecialEntries()
		dump('propsTime',t-Date.now())

		this.filterText=filterText
		this.filter(this.unfilteredArray,filterText)

		if(this.panel.state=='open'){
			this.setView(0)
			this.panel.moveTo(posX,posY)
		}else
			this.panel.showPopup(null,posX,posY, "popup")
	},
	getSpecialEntries: function(){
		var [spo,funcname]=this.specFunc
		var ans=[]
		dump(spo)
		try{
			if(funcname=='QueryInterface'){
				var spo = EJS_evalStringOnTarget(spo)			
				supportedInterfaces(spo).forEach(function(x){
					ans.push({name:'\u2555Ci.'+x+')',comName: 'ci.'+x.toString().toLowerCase(),description:'interface', depth:-1,special:true})
				})
			}else if(funcname=='getElementById'){
				ans=getIDsInDoc()
			}else if(funcname=='getAttribute'){
				var spo = EJS_evalStringOnTarget(spo)
				var att=spo.attributes
				for(var i=0;i<att.length;i++){
					var x=att[i]
					ans.push({name:'\u2555"'+x.nodeName+'")',comName: '"'+x.nodeName.toLowerCase(),description:x.value, depth:-1,special:true})
				}	
			}
		}catch(e){}
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
	doComplete:function(i){
		EJS_appendToConsole(this.activeArray[i])

		var valueToInsert = event.target.value
		var selectionEnd = codebox.selectionStart + valueToInsert.length;
		insertText(valueToInsert , codebox)
		codebox.setSelectionRange(selectionEnd, selectionEnd);
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
				priority += lastI-ind1
				ind1 = lastI+1;
				if(lastI===-1)
					break;//springy matches
			}
			if(lastI != -1){
				val.priority=priority
				table.push(val);
			}
		}

		function sorter(a,b){

		}
		var sortVals=['priority','depth','name']

		data.forEach(springyIndex)
		table.sort(function (a, b) {
			if(!a.special&&b.special) return 1;
			if(a.special&&!b.special) return -1;//???
			for each(i in sortVals){
			  if (a[i]<b[i]) return -1;
			  if (a[i]>b[i]) return 1;
			}
			return 0;
		})
		this.sortedArray=table
	}

	,handleEvent: function(event){
	dump(event.charCode,String.fromCharCode(event.charCode))
		if(String.fromCharCode(event.charCode)=='t'&&event.ctrlKey){
			this.toggleMode()
			event.preventDefault();event.stopPropagation();
		}
		if(event.ctrlKey||event.altKey)
			return;
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
				else if (!event.ctrlKey&&t=='.'){
					this.insertSuggestedText();

					dump(this.object[this.selectedText()],this.object,this.selectedText())
					this.start(this.object[this.selectedText()],"")
				}
				this.text+=t;
			dump('-===>',t,this.text)

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
		tree.treeBoxObject.ensureRowIsVisible(c>0?c:(direction>0?0:view.rowCount-1))
	},
	selectedText: function(){
		var c=this.tree.view.selection.currentIndex
		if(c<0) return
		return this.sortedArray[c].name
	},
	insertSuggestedText: function(){
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
		this.inputField.selectionStart=this.inputField.selectionStart-l;
		insertText(text, this.inputField)
	}
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

/**============-=========-===============**/
if(!Object.getOwnPropertyNames)//for old versions
	var getProps=function(targetObj){var t=Date.now()
		targetObj=targetObj.wrappedJSObject||targetObj
		var data=[]
		var protoList=[targetObj]
		var p=targetObj
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
			try{var d=jn.inspect(targetObj[i])}catch(e){var d=e.message}
			data.push({name:i, comName: i.toLowerCase(),description:d, depth:depth})
		}dump('-----------------------------**',t-Date.now())
		return data;
	}
else//4.0b2+
	var getProps=function(targetObj){
		var x= targetObj.wrappedJSObject||targetObj,data=[],protoList=[],depth=0,allProps=[]
		if(typeof x!='object'&&typeof x!='function'){
			x=x.constructor
			jn.say(x,targetObj)
		}
		while(x){
			var props=Object.getOwnPropertyNames(x)
			outerloop:for each(var i in props){
				if(allProps.indexOf(i)>-1)
					continue outerloop
				/*if(!x.hasOwnProperty(i)){
					data.push({name:i+'---', comName: i+'---',description:i, depth:depth})
					continue outerloop
				}
				for(var p in protoList){//dont show same prop twice
					if(protoList[p].hasOwnProperty(i))
						continue outerloop
				}*/
				/* data.push({name:i, comName: i.toLowerCase(),get description function(){
					dump(this.name);
					delete this.description;
					this.description=jn.inspect(autocompleter.object[this.name]);
					return this.description}
					, depth:depth}) */
				try{var d=jn.inspect(targetObj[i])}catch(e){var d=e.message}
				data.push({name:i, comName: i.toLowerCase(),description:d, depth:depth})

			}
			protoList.push(x);x=x.__proto__;depth++;allProps=allProps.concat(props)
		}
		return data
	}

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
	jn.say(supportedInterfaces(autocompleter.object).join('\n'))
}
jsExplore.all=function(){
	autocompleter.toggleMode()
}
/*****************
 *  end of code completion utils
 ****************************************************************/



dump = function(){
var aMessage="aMessage: "
 for (var i = 0; i < arguments.length; i++)
    aMessage += arguments[i] + " , ";
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("" + aMessage); //new Date() + ":  "
    //Components.utils.reportError(e); // report the error and continue execution
}
cleardump = function(){
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.reset()
	consoleService.logStringMessage(""); //new Date() + ":  "
    //Components.utils.reportError(e); // report the error and continue execution
}

function EJS_initShortCuts(){
	codebox.addEventListener("keydown", this, true);
	//codebox.addEventListener("keyup", this, true);
}

EJS_initShortCuts.prototype={
	pressed:false,
	stopEvent:function(e){
		e.preventDefault();e.stopPropagation();
	},
	handleEvent:function(e){
	//dump(e.which,e.keycode,e.charcode)
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
	}
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












