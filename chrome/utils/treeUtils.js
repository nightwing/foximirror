  /***************************************/
 /**-----------tree views--------------**/
/***************************************/
function treeView(table) {
    this.rowCount = table.length;
    this.getCellText  = function(row, col) {return table[row][col.id];};
    this.getCellValue = function(row, col) {return table[row][col.id];};
    this.setTree = function(treebox) {this.treebox = treebox;};
    this.isEditable = function(row, col) {return false;};

    this.isContainer = function(row) {return false;};
    this.isContainerOpen = function(row) {return false;};
    this.isContainerEmpty = function(row) {return true;};
    this.getParentIndex = function(row) { return 0;};
    this.getLevel = function(row) {return 0;};
    this.hasNextSibling = function(row) {return false;};

    this.isSeparator = function(row) {return false;};
    this.isSorted = function() {return false;};
    this.getImageSrc = function(row, col) {}; // return "chrome://global/skin/checkbox/cbox-check.gif"; };
    this.getRowProperties = function(row, props) {
        
    };
    this.getCellProperties = function(row, col, props) {
        props && props.AppendElement(Services.atom.getAtom('d'+table[row].depth));
        return 'd'+table[row].depth
    };
    this.getColumnProperties = function(colid, col, props) {};
    this.cycleHeader = function(col, elem) {};
}

function plainOneColumnView(table){
	this.rowCount = table.length;
	this.getCellText = function(row, col){return domNodeSummary(table[row]);};
	this.getCellValue = function(row, col){return ;};
	this.setTree = function(treebox){this.treebox = treebox;};
	this.isEditable = function(row, col){return false;};

	this.isContainer = function(row){ return false; };
	this.isContainerOpen = function(row){ return false; };
	this.isContainerEmpty = function(row){ return true; };
	this.getParentIndex = function(row){ return 0; };
	this.getLevel = function(row){ return 0; };
	this.hasNextSibling = function(row){ return false; };

	this.isSeparator = function(row){ return false; };
	this.isSorted = function(){ return false; };
	this.getImageSrc = function(row,col){}// return "chrome://global/skin/checkbox/cbox-check.gif"; };
	this.getRowProperties = function(row,props){
		/* if((row %4) == 0){
			var aserv=Components.classes["@mozilla.org/atom-service;1"].
					  getService(Components.interfaces.nsIAtomService);
			props.AppendElement(aserv.getAtom("makeItBlue"));
		} */
	};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader = function(col, elem){};
}

function multiLevelTreeView(){
}
multiLevelTreeView.prototype = {
	treeBox: null,
	selection: null,

	get rowCount()                     { return this.visibleData.length; },
	setTree:     function(treeBox)     { this.treeBox = treeBox; },
	getCellText: function(row, col) { return this.visibleData[row][col.id]; },
	isContainer: function(row)         {
		var t=this.visibleData[row]
		/*if(typeof t.isContainer!='undefined'){
			return t.isContainer
		}dump('ss')t.isContainer=*/
		var l=t.level,t1=this.childData[t.index+1]
		return t1&&t.level<t1.level;
	},
	isContainerOpen:  function(row)    { var t=this.visibleData[row+1];return t&&t.index==this.visibleData[row].index+1; },
	isContainerEmpty: function(row)    { return false; },
	isSeparator: function(row)         { return false; },
	isSorted:    function()            { return false; },
	isEditable:  function(row, column) { return false; },

	getParentIndex: function(row){
		var item=this.visibleData[row],l=item.level
		if(l!=0) l--
		var i=row-1;
		while(i>=0&&(item=this.visibleData[i])&&item.level!=l){
			i--
		}
		return i
	},
	getLevel: function(row){
		return this.visibleData[row].level;
	},
	hasNextSibling: function(row, after){
		var thisLevel = this.getLevel(row);
		for (var t = after + 1; t < this.visibleData.length; t++) {
			var nextLevel = this.getLevel(t);
			if (nextLevel == thisLevel) return true;
			if (nextLevel < thisLevel) break;
		}
		return false;
	},
	toggleOpenState: function(row){
		var  item=this.visibleData[row];

		var thisLevel = item.level;
		var deletecount = 0;
		for (var t = row + 1; t < this.visibleData.length; t++) {
			if (this.visibleData[t].level > thisLevel) deletecount++;
			else break;
		}
		if(deletecount){
			this.visibleData.splice(row + 1, deletecount);
			this.treeBox.rowCountChanged(row + 1, -deletecount);
		}else{//open
			var index=item.index+1, a, l, splicePos=row
			while((a=this.childData[index])&&(l=a.level)>thisLevel){
				if(l==thisLevel+1){
					splicePos++
					this.visibleData.splice(splicePos, 0, a);
				}
				index++
			}
			this.treeBox.rowCountChanged(row+1, splicePos-row);
		}
		this.treeBox.invalidateRow(row);
	},

	getImageSrc: function(row, column) {},
	getProgressMode : function(row,column) {},
	getCellValue: function(row, column) {},
	cycleHeader: function(col, elem) {},
	selectionChanged: function() {},
	cycleCell: function(row, column) {},
	performAction: function(action) {},
	performActionOnCell: function(action, index, column) {},
	getRowProperties: function(row, prop) {
		var pn=this.visibleData[row].rowProp
		if(!pn)return
		prop && prop.AppendElement(Services.atom.getAtom(pn));
        return pn
	},
	getCellProperties: function(row, column, prop) {
		var pn=this.visibleData[row].cellProp
		if(!pn)return
		prop && prop.AppendElement(Services.atom.getAtom(pn));
        return pn
	},
	getColumnProperties: function(column, element, prop) {
	},

};

//***************************************/
//filtering trees
treeUtils = {}
treeUtils.moveTreeSelection = function(direction){
	var tree = this.tree || this.viewer.tree
	var view = tree.view
	var c = view.selection.currentIndex
	c += direction
	if(c >= view.rowCount)
		c = -1
	else if(c < -1)
		c = view.rowCount-1

	view.selection.timedSelect(c, tree._selectDelay);
	tree.treeBoxObject.ensureRowIsVisible(c)
}
//leftPaneSearch = new treeUtils.searchBox('leftPane-search')
treeUtils.searchBox = function(id, viewer){
	this.textboxId = id
	this.viewer = viewer
	this.initialize()
}
treeUtils.searchBox.prototype = {
	textboxId: "", 
	initialize: function(){
		this.findbar = document.getElementById(this.textboxId);
		this.textbox = this.findbar.querySelector('textbox');
		this.textbox.searchBox = this
		this.textbox.setAttribute('oninput','this.searchBox.onInput(this.value)')
		var self = this
		this.textbox.addEventListener('command',function(){
			self.onInput(self.textbox.value)
		})
		this.textbox.addEventListener('focus', function(e){
			if(e.target.nodeName=="html:input")
				e.currentTarget.mIgnoreFocus||self.onInput(this.value)
		})

		this.textbox.addEventListener('keypress',this,true)
	},
	onInput: function(text){
		treeUtils.setTreeFilter(this.viewer.view, this.viewer.tree, text)
	},
	handleEvent: function(event){
		switch(event.keyCode){
			case KeyEvent.DOM_VK_UP:
				this.moveTreeSelection(-1);
				event.preventDefault();
				event.stopPropagation();
				break
			case KeyEvent.DOM_VK_DOWN:
				this.moveTreeSelection(1);
				event.preventDefault();
				event.stopPropagation();
				break
			case KeyEvent.DOM_VK_RETURN:
				if(event.ctrlKey){
					this.tree.changeOpenState(this.tree.currentIndex)
					event.preventDefault();
					event.stopPropagation();
					break
				}

				this.onInput(this.lastXpath)
				this.tree.view.selection.select(this.index)
				this.tree.treeBoxObject.scrollToRow(this.topRow)

				event.preventDefault();
				event.stopPropagation();
				break
		}
	},
	moveTreeSelection: treeUtils.moveTreeSelection 
}

treeUtils.setTreeFilter = function(view,tree,text){
	if(!text){
		view.visibleData = view.childData.concat()
		tree.view = view
	}
	if(view.filter==text)
		return
	this.filter=text=text.toLowerCase()

	var index=0,cd=view.childData
	view.visibleData=[]
	for(var i =0;i<cd.length;i++){
		var k=cd[i]
		if(k.rowProp=='head'||springyIndex(k.text||k.name,text)>-1){
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
function selectObjectInTree(treeID){
	if(treeID.substring(0, 9) == "$timeout_"){
		selectObjectInTree[treeID] = null
		treeID = treeID.substr(9)
		window[treeID].onSelect()
	}else{
		var id = "$timeout_" + treeID
	
		if(selectObjectInTree[id] != null)
			clearTimeout(selectObjectInTree[id])

		selectObjectInTree[id] = setTimeout(selectObjectInTree, 10, id)
	}	
}
