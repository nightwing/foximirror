/****************************************************************************
kCM_SRV = Components.classes["@mozilla.org/categorymanager;1"].
    		getService(Components.interfaces.nsICategoryManager);
            
f=kCM_SRV.enumerateCategories()

f.getNext().QueryInterface(Ci.nsISupportsCString).data

f=kCM_SRV.enumerateCategory('agent-style-sheets')

f.getNext().QueryInterface(Ci.nsISupportsCString).data
f.getNext().QueryInterface(Ci.nsISupportsCString).data

kCM_SRV.getCategoryEntry('agent-style-sheets', 'pluginGlue-pluginFinder')
kCM_SRV.getCategoryEntry('command-line-handler', 'b-jsconsole')
kCM_SRV.getCategoryEntry('command-line-handler', 'b-jsconsole')
*/


// classInfo obj.QueryInterface(Ci.nsIClassInfo)
var cii=[]
cii.splice(cii.indexOf(Ci.nsISupports),1)
for each(var i in Ci) {
    cii.push(i);
}
cii.splice(cii.indexOf(Ci.nsISupports), 1)
function supportedInterfaces(element) {
    var ans = [];
    for(var i = cii.length;i--;) {
		var p = cii[i]
		try {
			if (element instanceof p) {
				ans.push(p.name);
			}
		}catch(e){
			Components.utils.reportError(e);
		}
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


var comp2iface = {}
buildComponentMap = function(){
	var nsIJSCID = Ci.nsIJSCID
	comp2iface = {}
	intlRe = /intl\/((string)?charsetdetect|unicode)/
	for(var i in Cc){
		if(intlRe.test(i)'')>0 || i.indexOf('intl/stringcharsetdetect')>0)
			continue
		if(Cc[i] instanceof nsIJSCID)
			comp2iface[i] = supportedInterfaces(getserviceOrCreateInstance(Cc[i]))
		else
			dump(i)
	}
	var a=[]
	for (i in comp2iface){
		a.push({name: i, ob:comp2iface[i]})
	}
	a=a.sort(function(a,b){
		var x = a.ob.length-b.ob.length
		return x
	})

	var c={}
	for(i in a){
		p=a[i]
		c[p.name]=p.ob
	}

	return JSON.stringify(c,null,4)
}

//buildComponentMap()






iname = 'nsIUpdateChecker'

navigateToMXRInterface = function(iname){
	if(typeof iname != 'string')
		iname = iname.name

	var t = makeReq('http://mxr.mozilla.org/mozilla-central/ident?i='+iname+'&tree=mozilla-central&filter=.idl')
	href = t.match(/href="([^"]*.idl)"/)[1]

	makeReq('http://mxr.mozilla.org/'+href+'?raw=1')
}



  /***************************************/
 /**-----------tree views--------------**/
/***************************************/
function simpleView(){
}
simpleView.prototype = {
	treeBox: null,
	selection: null,

	get rowCount()                     { return this.data.length; },
	setTree:     function(treeBox)     { this.treeBox = treeBox; },
	getCellText: function(row, col)    { return this.data[row].name },
	isContainer: function(row)         { return false; },

	isContainerOpen:  function(row)    { return true },
	isContainerEmpty: function(row)    { return false; },
	isSeparator: function(row)         { return false; },
	isSorted:    function()            { return false; },
	isEditable:  function(row, column) { return false; },

	getParentIndex: function(row){-1},
	getLevel: function(row){return 0;},
	hasNextSibling: function(row, after){return true;},
	toggleOpenState: function(row){},

	getImageSrc: function(row, column) { return this.data[row].iconURL },
	getProgressMode : function(row,column) {},
	getCellValue: function(row, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(row, column) {},
	performAction: function(action) {},
	performActionOnCell: function(action, index, column) {},
	getRowProperties: function(row, prop) {
		var pn=this.data[row].rowProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getCellProperties: function(row, column, prop) {
		var pn=this.data[row].cellProp
		if(!pn)return
		prop.AppendElement(atomService.getAtom(pn));
	},
	getColumnProperties: function(column, element, prop) {
	},

};

function treeView(table){
	this.rowCount = table.length;
	this.getCellText  = function(row, col){return table[row][col.id]}
	this.getCellValue = function(row, col){}
	this.setTree = function(treebox){this.treebox = treebox}
	this.isEditable = function(row, col){return false}

	this.isContainer = function(row){return false}
	this.isContainerOpen = function(row){return false}
	this.isContainerEmpty = function(row){return false }
	this.getParentIndex = function(row){ return row?0:-1}
	this.getLevel = function(row){return row?1:0}
	this.hasNextSibling = function(row){return true}

	this.isSeparator = function(row){return false}
	this.isSorted = function(){ return false}
	this.getImageSrc = function(row,col){return ''}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
	};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){}
	this.cycleHeader = function(col, elem){}
	this.isSelectable=function(row,col){return true}
	return this
}

//***************************************/
//filtering trees
setTreeFilter = function(view,tree,text){
	if(!text){
		view.visibleData=view.childData.concat()
		tree.view=view
	}
	if(view.filter==text)
		return
	this.filter=text=text.toLowerCase()

	var index=0,cd=view.childData
	view.visibleData=[]
	for(var i =0;i<cd.length;i++){
		var k=cd[i]
		if(k.rowProp=='head'||springyIndex(k.text,text)>-1){
			view.visibleData.push(k)
			//k.index=index;index++
		}
	}
	tree.view=view
}
function springyIndex(val,filterText){
	var lowVal=val.toLowerCase()
	var priority=0,lastI=0,ind1=0;
	if(lowVal.indexOf(filterText)===0){
		return 0;//exact match
	}
	for(var j=0;j<filterText.length;j++){
		lastI = lowVal.indexOf(filterText[j],ind1);
		priority += lastI-ind1
		ind1 = lastI+1;
		if(lastI===-1)
			break;//springy matches
	}
	if(lastI != -1){
		return priority+1
	}
	return -1
}

   /******************************************************************************/
  ////** blends onselect and onmousedown
 /**************************/
 selectObjectInTreeTimeOuts={}
function selectObjectInTree(treeID,immediate){
	if(!immediate){
		if(selectObjectInTreeTimeOuts[treeID]){
			clearTimeout(selectObjectInTreeTimeOuts[treeID])
		}
		selectObjectInTreeTimeOuts[treeID]=setTimeout(function(){selectObjectInTree(treeID, true)},10)
		return
	}
	window[treeID].onSelect()
}
   //**************************
  //*
 //******/
function getId(el){
	var elId
	while(el&&!(elId=el.id)){
		el=el.parentNode
	}
	return [elId,el]
}
function getAttr(el,attr){
	var elId
	while(el&&el.nodeType==1&&!el.hasAttribute(attr)){
		el=el.parentNode
	}
	if(el&&el.nodeType==1)
		return [el.getAttribute(attr),el]
	return [null,null]
}


/**-----------//////**************************/