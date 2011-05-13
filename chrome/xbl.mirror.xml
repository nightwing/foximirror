/*ans=[]
bs=cssSearch.findBindingRules()
for each(var i in bs){
var u=i[1].match(/url\("?([^"^'^#]*)./)
if(u&&ans.indexOf(u[1])<0)ans.push(u[1])
}
ans

function makeReqXML(href){
	var req = new XMLHttpRequest;
	//req.overrideMimeType('text/plain')
	req.open("GET", href, false);
	try{
		req.send(null);
	}catch(e){}
	return req.responseXML;
}
timerStart=Date.now()


ans2=makeReqXML(ans[0])
ansd=ans2.documentElement
for(var i=1;i<ans.length;i++){
var d=makeReqXML(ans[i])
    d&&ansd.appendChild(d.documentElement)
}
timerStart-Date.now()
ansd

domViewer.mDOMView.rootNode=ans2

domViewer.mDOMView.whatToShow&= ~NodeFilter.SHOW_TEXT


*/


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

getClassesInDoc(ans2)























domNodeSummary= function(el){
	var name=el.nodeName
	if(el.nodeType==7){
		name+=el.target+' ->'+el.data
	}else if(el.nodeType==9){
		name+=': '+el.title +'->'
		try{name+=decodeURIComponent(el.documentURI)}catch(e){name+=el.documentURI}
	} if(el.nodeType==1){		
		var att=el.attributes,ans=[]
		for(var i=0;i<att.length;i++){
			var x=att[i]
if(x.name=='id')name+='#'+x.value
else if(x.name=='name')name+=' ~'+x.value
else if(x.name=='class')name+='.'+x.value.replace(' ','.','g')
else if(x.name.substring(0,5)=='xmlns')continue
else if(x.name=='extends')name+=' extends='+x.value.substr(x.value.lastIndexOf('#'))
else ans.push(x.name+'="'+x.value+'"')
		}	
		name+=' '+ans.join(' ')
				
	}
	return name
}







i=domViewer.tree.currentIndex
props={AppendElement:function(a){this.arr.push(a)},arr:[]}
tree=domViewer.tree
tree.view.getCellProperties(i,tree.columns[0],props)

props.arr[0].QueryInterface(Ci.nsIAtom).toUTF8String()















