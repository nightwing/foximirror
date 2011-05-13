function getParserStyleSheet(){
	var pss=document.getElementById('shadia-ParserStyleSheet')
	if(!pss){
		pss=document.createElementNS('http://www.w3.org/1999/xhtml','style')
		pss.id='shadia-ParserStyleSheet'		
		document.documentElement.appendChild(pss)
		pss.sheet.disabled=true
	}
	return pss
}
//todo: charset rules
function setCSSRules(sheet, rules){
	var n=sheet.cssRules.length
	//clear
	for(var i=0; i<n; ++i)
		sheet.deleteRule(0)
	//copy
	n=rules.length
	for(var i=0; i<n; ++i)try{
		sheet.insertRule(rules[i].cssText, i)
	}catch(e){dump(rules[i].cssText,'--------------')}
}

function reloadStyleSheet(styleSheet){
	var styleCode=makeReq(styleSheet.href)
	var parser=getParserStyleSheet()
	parser.textContent=styleCode
	parser.sheet.disabled=true
	var rules=parser.sheet.cssRules

	setCSSRules(styleSheet, rules)
	//fWins = winService.getEnumerator('navigator:browser');
	//while(fWins.hasMoreElements()){		
	//}
}


domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);

function getHuntTargets(){
	var start='<box hidden="true" id="hiddenBox"><', mid='/><', end='/></box>'
	//var start='<', mid='/><', end='/>'
	var tags=[
		'scrollbar', 'tree', 'textbox type="autocomplete" id="searchbar"', 'toolbarbutton',
		'toolbar', 'button', 'checkbox', 'menu', 'menulist', 'panel', 'listbox',
		'richlistbox', 'groupbox','splitter',
		'progressmeter', 'menuitem id="copy"', 'window', 'popup', 'script'
	]
	return start+tags.join(mid)+end
}

function getSnareParent(document){
	var el=document.getElementById('shadia-SnareParent')
	if(el){
		el.parentNode.removeChild(el)
	}
	el=document.createElement('box')
	el.id='shadia-SnareParent'
	el.setAttribute('hidden', 'true')
	document.documentElement.appendChild(el)
	return el
}

function appendInnerXML(element,xml){
	var document=element.ownerDocument;
	var range=document.createRange();
	range.selectNode(element);
	var fragment=range.createContextualFragment(xml);
	return element.appendChild(fragment)	
}

function getStyleSheetsFromNode(mNode,styleList){
	dump(mNode.nodeName)
	var inspectedRules=domUtils.getCSSStyleRules(mNode)
	if(!inspectedRules)	return
	for(var i = inspectedRules.Count()-1; i >=0 ; --i){
		var rule= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule);
		var sheet=rule.parentStyleSheet
		
		//while(sheet.ownerRule){sheet=sheet.ownerRule.parentStyleSheet;}
		if(sheet.ownerNode)continue
		//if(sheet.href.slice(0,5)=='data:')continue
		if(sheet.href=='chrome://global/content/xul.css')continue
		
		if(styleList.indexOf(sheet)==-1){
			styleList.push(sheet);//dump('axept')
		}
		//dump(sheet.href)
	}
}

function collectAgentSheets(){
	var stTime=Date.now()
	var snare=getSnareParent(document)
	var xml=getHuntTargets()
	appendInnerXML(snare,xml)	
	
	var elements=snare.firstChild.childNodes
	var userAgentStyles=[]
	for(var i=0, ii=elements.length; i<ii; i++){
		getStyleSheetsFromNode(elements[i],userAgentStyles)
	}
	userAgentStyles.sort(function(a,b){return a.href>b.href})
	dump('**********************',stTime-Date.now())
	return userAgentStyles
}

var userAgentStyles=collectAgentSheets()
userAgentStyles.forEach(reloadStyleSheet)














styleSheet=userAgentStyles[1]

var styleCode=makeReq(styleSheet.href)
	var parser=getParserStyleSheet()
	parser.textContent=styleCode
	parser.sheet.disabled=true
	var rules=parser.sheet.cssRules

rules[0].cssText
styleSheet.cssRules[203].cssText

parser.sheet.insertRule('@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");',0)
parser.sheet.insertRule('*{color:red}',0)






/********************************************************
 **
 **
 *************************************************/



function getManifestText(addonFolder){
	var a=fileHandler.getURLSpecFromFile(addonFolder)
	var baseURI=ios.newURI(a, null, null)
	var manifestText = makeReq(a+'chrome.manifest')
	var lines=manifestText.split('\n'), newLines=[]
	var urlIndices={content: 2, skin: 3, locale: 3, resource: 2}
	lines.forEach(function(line){
		var m=line.trim().split(/\s+/),
			i = urlIndices[m[0]]
		if(m[0][0]=='#')//skip comments
			return
		if(i)//convert registration urls to absolute
			m[i]=ios.newURI(m[i], null, baseURI).spec	
		//only normalize space otherwise
		newLines.push(m.join(' '))	
	})	
	return newLines.join('\n')
}

function getDummyManifestFile(){
	var file=getLocalFile('chrome://chromeroot/content/options.xul')
	file=file.parent.parent
	file.append('chrome.manifest')	
	return file
}

function writeFile(file, text){
	var fostream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	fostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);// write, create, truncate
	var converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	converter.init(fostream, "UTF-8", 4096, 0x0000);
	converter.writeString(text);
	converter.close();
}

doAddChrome=function(file){
	var newText=getManifestText(file)+'\n\ncontent chromeroot content/'
	var manifestFile=getDummyManifestFile()
	writeFile(manifestFile, newText)
	gChromeReg.checkForNewChrome()
}

doAddChrome(mAddonData.file)