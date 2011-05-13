numerPrefs=[
"IMERawInputUnderlineStyle", 
"IMESelectedRawTextUnderlineStyle", 
"IMEConvertedTextUnderlineStyle", 
"IMESelectedConvertedTextUnderlineStyle",
"SpellCheckerUnderlineStyle" 
]
floats=[
"ui.IMEUnderlineRelativeSize",
"ui.SpellCheckerUnderlineRelativeSize",
"ui.caretAspectRatio"
]
colorPrefs=[
 "textBackground", "textForeground",
 "textSelectBackground", "textSelectForeground", 
 "textSelectBackgroundDisabled", "textSelectBackgroundAttention",
 "textHighlightBackground", "textHighlightForeground",
 "SpellCheckerUnderline",
 
 "IMERawInputBackground", "IMERawInputForeground", "IMERawInputUnderline",
 "IMESelectedRawTextBackground", "IMESelectedRawTextForeground", "IMESelectedRawTextUnderline",
 "IMEConvertedTextBackground", "IMEConvertedTextForeground", "IMEConvertedTextUnderline",
 "IMESelectedConvertedTextBackground", "IMESelectedConvertedTextForeground", "IMESelectedConvertedTextUnderline"
]
pp={
SELECTION_FIND: 128,
SELECTION_NORMAL: 1,
SELECTION_SPELLCHECK: 2,
SELECTION_IME_RAWINPUT: 4,
SELECTION_IME_SELECTEDRAWTEXT: 8,
SELECTION_IME_CONVERTEDTEXT: 16,
SELECTION_IME_SELECTEDCONVERTEDTEXT:32  ,
SELECTION_ACCESSIBILITY: 64}
pp2={
SELECTION_OFF: 0, 
SELECTION_HIDDEN: 1,
SELECTION_ON: 2,
SELECTION_DISABLED: 3,
SELECTION_ATTENTION: 4 
}
tb={}
var initSel=function(j){
	//cont=document.createElement('vbox')
	var cont=document.getElementById('buttonbox')//.appendChild(cont)
	for (i in pp2){		
		u=document.createElement('button')
		cont.appendChild(u)	
		u.label=i
		u.setAttribute('onclick','initSel2("'+i+'")')		
	}
	initSel2()
}
var initSel2=function(j){
	qq={}
	if(typeof j=='undefined')
		j='SELECTION_ATTENTION'
	cont=document.getElementById('textcontainer')
	/* if(cont)
		cont.parentNode.removeChild(cont)
	cont=document.createElement('groupbox')
	cont.id='cont'
	cont.style.width='1000px'
	cont.style.height='300px'
	cont.style.overflow='scroll'
	document.documentElement.appendChild(cont) */

	for (var i in pp){		
		u=tb[i]=tb[i]||cont.appendChild(document.createElement('textbox'))	
		u.value=i+' '+j
		u.style.width='100%'
		qq[i]=new selLight(u,i,j)		
	}

}
/***/
updateFields=function(){
	for(var i in qq){
		qq[i].selCon.repaintSelection(nsiSelCon[i])
	}
}
/***/
var selLight=function(textArea,seltype,selstate){
	this.editor=textArea.editor
	if(typeof Ci =="undefined")
		Ci = Components.interfaces;
	nsiSelCon=Components.interfaces.nsISelectionController 
	
	this._searchRange = document.createRange()
	this._searchRange.selectNodeContents(this.editor.rootElement);
	
	this.selCon=this.editor.selectionController
	this.seltype=nsiSelCon[seltype]
	this.findSelection = this.selCon.getSelection(this.seltype);
	this.selCon.setDisplaySelection(nsiSelCon[selstate]);
	this.selCon.setCaretVisibilityDuringSelection(true);	

	this.findSelection.addRange(this._searchRange);

}
selLight.prototype={
	notifySelectionChanged:function(){		
		var text=this.selCon.getSelection(1).toString()		
		if(text!==this.text){
			if(this.timeout){
				clearTimeout(this.timeout)
			}
			if(this.active)
				this.findSelection.removeAllRanges()
			var self=this
			this.text=text
			if(text)
				this.timeout=setTimeout(function()self.addRanges(text), text.length<3?300:100)
		}
	},
	addRanges:function(text){	
		this._startPt = this._searchRange.cloneRange();
		this._startPt.collapse(true);
		this._endPt = this._searchRange.cloneRange();
		this._endPt.collapse(false);
		this.active=false
		while ((retRange = this.finder.Find(text, this._searchRange,this._startPt, this._endPt))) {
			this.findSelection.addRange(retRange);
			this._startPt = retRange.cloneRange();
			this._startPt.collapse(false);
			this.active=true
		}
		this.timeout=''
	}

}




xi=0;yi=0;len=24;xn=10;
var initAll=function(){
	initSel()
}

/***********************************************************
 *
 * pref utils
 *****************/
 Ci=Components.interfaces
 Cc=Components.classes
 gPrefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
 gPrefBranch = gPrefService.getBranch(null).QueryInterface(Ci.nsIPrefBranch2)

function savePref(name,val,type){
	prefName="ui."+name
	try{
        var prefBranch = gPrefBranch;        
        switch (type||prefBranch.getPrefType(prefName)){            
			case 'string':
			case prefBranch.PREF_STRING:
				return prefBranch.setCharPref(prefName,val);            
			case 'int':
			case prefBranch.PREF_INT:
				return prefBranch.setIntPref (prefName,val);            
			case 'bool':
			case prefBranch.PREF_BOOL:
				return prefBranch.setBoolPref(prefName,val);
			default:
				return 'failed';
        }
    }catch(e){}
}

function clearPref(name){
	prefName="ui."+name
	try{gPrefBranch.clearUserPref(prefName)}catch(e){}
}

function getPref(name){
	prefName="ui."+name
	try{
        var prefBranch = gPrefBranch;        
        switch (prefBranch.getPrefType(prefName)){            
			case prefBranch.PREF_STRING:
				return prefBranch.getCharPref(prefName);            
			case prefBranch.PREF_INT:
				return prefBranch.getIntPref(prefName);            
			case prefBranch.PREF_BOOL:
				return prefBranch.getBoolPref(prefName);
			default:
				return null;
        }
    }catch(e){}
}






