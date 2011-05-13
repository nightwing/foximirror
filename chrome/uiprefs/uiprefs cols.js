/*{ "ui.windowTitleHeight", eMetric_WindowTitleHeight, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.windowBorderWidth", eMetric_WindowBorderWidth, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.windowBorderHeight", eMetric_WindowBorderHeight, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.widget3DBorder", eMetric_Widget3DBorder, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textFieldBorder", eMetric_TextFieldBorder, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textFieldHeight", eMetric_TextFieldHeight, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.buttonHorizontalInsidePaddingNavQuirks",eMetric_ButtonHorizontalInsidePaddingNavQuirks, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.buttonHorizontalInsidePaddingOffsetNavQuirks",eMetric_ButtonHorizontalInsidePaddingOffsetNavQuirks, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.checkboxSize", eMetric_CheckboxSize, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.radioboxSize", eMetric_RadioboxSize, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textHorizontalInsideMinimumPadding",eMetric_TextHorizontalInsideMinimumPadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textVerticalInsidePadding", eMetric_TextVerticalInsidePadding,PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textShouldUseVerticalInsidePadding",eMetric_TextShouldUseVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.textShouldUseHorizontalInsideMinimumPadding",eMetric_TextShouldUseHorizontalInsideMinimumPadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.listShouldUseHorizontalInsideMinimumPadding",eMetric_ListShouldUseHorizontalInsideMinimumPadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.listHorizontalInsideMinimumPadding",eMetric_ListHorizontalInsideMinimumPadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.listShouldUseVerticalInsidePadding",eMetric_ListShouldUseVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.listVerticalInsidePadding", eMetric_ListVerticalInsidePadding,PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.caretBlinkTime", eMetric_CaretBlinkTime, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.caretWidth", eMetric_CaretWidth, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.caretVisibleWithSelection", eMetric_ShowCaretDuringSelection, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.submenuDelay", eMetric_SubmenuDelay, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.dragFullWindow", eMetric_DragFullWindow, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.dragThresholdX", eMetric_DragThresholdX, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.dragThresholdY", eMetric_DragThresholdY, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.useAccessibilityTheme", eMetric_UseAccessibilityTheme, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.isScreenReaderActive", eMetric_IsScreenReaderActive, PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.menusCanOverlapOSBar", eMetric_MenusCanOverlapOSBar,PR_FALSE, nsLookAndFeelTypeInt, 0 },
{ "ui.skipNavigatingDisabledMenuItem", eMetric_SkipNavigatingDisabledMenuItem, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.treeOpenDelay", eMetric_TreeOpenDelay, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.treeCloseDelay", eMetric_TreeCloseDelay, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.treeLazyScrollDelay", eMetric_TreeLazyScrollDelay, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.treeScrollDelay", eMetric_TreeScrollDelay, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.treeScrollLinesMax", eMetric_TreeScrollLinesMax, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "accessibility.tabfocus", eMetric_TabFocusModel, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.alertNotificationOrigin", eMetric_AlertNotificationOrigin, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.scrollToClick", eMetric_ScrollToClick, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 
 { "ui.IMERawInputUnderlineStyle", eMetric_IMERawInputUnderlineStyle, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.IMESelectedRawTextUnderlineStyle", eMetric_IMESelectedRawTextUnderlineStyle, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.IMEConvertedTextUnderlineStyle", eMetric_IMEConvertedTextUnderlineStyle, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.IMESelectedConvertedTextUnderlineStyle", eMetric_IMESelectedConvertedTextUnderline, PR_FALSE, nsLookAndFeelTypeInt, 0 },
 { "ui.SpellCheckerUnderlineStyle", eMetric_SpellCheckerUnderlineStyle, PR_FALSE, nsLookAndFeelTypeInt, 0 },
};
/
nsLookAndFeelFloatPref nsXPLookAndFeel::sFloatPrefs[] =
{
 { "ui.textFieldVerticalInsidePadding", eMetricFloat_TextFieldVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.textFieldHorizontalInsidePadding", eMetricFloat_TextFieldHorizontalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.textAreaVerticalInsidePadding", eMetricFloat_TextAreaVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.textAreaHorizontalInsidePadding", eMetricFloat_TextAreaHorizontalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.listVerticalInsidePadding", eMetricFloat_ListVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.listHorizontalInsidePadding", eMetricFloat_ListHorizontalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.buttonVerticalInsidePadding", eMetricFloat_ButtonVerticalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.buttonHorizontalInsidePadding", eMetricFloat_ButtonHorizontalInsidePadding, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.IMEUnderlineRelativeSize", eMetricFloat_IMEUnderlineRelativeSize, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.SpellCheckerUnderlineRelativeSize", eMetricFloat_SpellCheckerUnderlineRelativeSize, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
 { "ui.caretAspectRatio", eMetricFloat_CaretAspectRatio, PR_FALSE, nsLookAndFeelTypeFloat, 0 },
};
154
155
156// This array MUST be kept in the same order as the color list in nsILookAndFeel.h.
157/* XXX If you add any strings longer than
158 * "ui.IMESelectedConvertedTextBackground"
159 * to the following array then you MUST update the
160 * sizes of the sColorPrefs array in nsXPLookAndFeel.h
161 * /
162const char nsXPLookAndFeel::sColorPrefs[][38] =
163{
164 "ui.windowBackground",
165 "ui.windowForeground",
166 "ui.widgetBackground",
167 "ui.widgetForeground",
168 "ui.widgetSelectBackground",
169 "ui.widgetSelectForeground",
170 "ui.widget3DHighlight",
171 "ui.widget3DShadow",
172 "ui.textBackground",
173 "ui.textForeground",
174 "ui.textSelectBackground",
175 "ui.textSelectForeground",
176 "ui.textSelectBackgroundDisabled",
177 "ui.textSelectBackgroundAttention",
178 "ui.textHighlightBackground",
179 "ui.textHighlightForeground",
180 "ui.IMERawInputBackground",
181 "ui.IMERawInputForeground",
182 "ui.IMERawInputUnderline",
183 "ui.IMESelectedRawTextBackground",
184 "ui.IMESelectedRawTextForeground",
185 "ui.IMESelectedRawTextUnderline",
186 "ui.IMEConvertedTextBackground",
187 "ui.IMEConvertedTextForeground",
188 "ui.IMEConvertedTextUnderline",
189 "ui.IMESelectedConvertedTextBackground",
190 "ui.IMESelectedConvertedTextForeground",
191 "ui.IMESelectedConvertedTextUnderline",
192 "ui.SpellCheckerUnderline",
193 "ui.activeborder",
194 "ui.activecaption",
195 "ui.appworkspace",
196 "ui.background",
197 "ui.buttonface",
198 "ui.buttonhighlight",
199 "ui.buttonshadow",
200 "ui.buttontext",
201 "ui.captiontext",
202 "ui.graytext",
203 "ui.highlight",
204 "ui.highlighttext",
205 "ui.inactiveborder",
206 "ui.inactivecaption",
207 "ui.inactivecaptiontext",
208 "ui.infobackground",
209 "ui.infotext",
210 "ui.menu",
211 "ui.menutext",
212 "ui.scrollbar",
213 "ui.threeddarkshadow",
214 "ui.threedface",
215 "ui.threedhighlight",
216 "ui.threedlightshadow",
217 "ui.threedshadow",
218 "ui.window",
219 "ui.windowframe",
220 "ui.windowtext",
221 "ui.-moz-buttondefault",
222 "ui.-moz-field",
223 "ui.-moz-fieldtext",
224 "ui.-moz-dialog",
225 "ui.-moz-dialogtext",
226 "ui.-moz-dragtargetzone",
227 "ui.-moz-cellhighlight",
228 "ui.-moz_cellhighlighttext",
229 "ui.-moz-html-cellhighlight",
230 "ui.-moz-html-cellhighlighttext",
231 "ui.-moz-buttonhoverface",
232 "ui.-moz_buttonhovertext",
233 "ui.-moz_menuhover",
234 "ui.-moz_menuhovertext",
235 "ui.-moz_menubartext",
236 "ui.-moz_menubarhovertext",
237 "ui.-moz_eventreerow",
238 "ui.-moz_oddtreerow",
239 "ui.-moz_mac_chrome_active",
240 "ui.-moz_mac_chrome_inactive",
241 "ui.-moz-mac-focusring",
242 "ui.-moz-mac-menuselect",
243 "ui.-moz-mac-menushadow",
244 "ui.-moz-mac-menutextdisable",
245 "ui.-moz-mac-menutextselect",
246 "ui.-moz_mac_disabledtoolbartext",
247 "ui.-moz-mac-accentlightesthighlight",
248 "ui.-moz-mac-accentregularhighlight",
249 "ui.-moz-mac-accentface",
250 "ui.-moz-mac-accentlightshadow",
251 "ui.-moz-mac-accentregularshadow",
252 "ui.-moz-mac-accentdarkshadow",
253 "ui.-moz-mac-accentdarkestshadow",
254 "ui.-moz-mac-alternateprimaryhighlight",
255 "ui.-moz-mac-secondaryhighlight",
256 "ui.-moz-win-mediatext",
257 "ui.-moz-win-communicationstext",
258 "ui.-moz-nativehyperlinktext",
259 "ui.-moz-comboboxtext",
260 "ui.-moz-combobox"
261};
*/

nums=[
"ui.IMERawInputUnderlineStyle", 
"ui.IMESelectedRawTextUnderlineStyle", 
"ui.IMEConvertedTextUnderlineStyle", 
"ui.IMESelectedConvertedTextUnderlineStyle",
"ui.SpellCheckerUnderlineStyle" 
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
var initSel=function(j){
	cont=document.createElement('vbox')
	document.documentElement.appendChild(cont)
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
	cont=document.getElementById('cont')
	if(cont)
		cont.parentNode.removeChild(cont)
	cont=document.createElement('groupbox')
	cont.id='cont'
	cont.style.width='1000px'
	cont.style.height='300px'
	cont.style.overflow='scroll'
	document.documentElement.appendChild(cont)

	for (var i in pp){		
		u=document.createElement('textbox')
		cont.appendChild(u)	
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





notcols=["windowBackground",
 "windowForeground",
 "widgetBackground",
 "widgetForeground",
 "widgetSelectBackground",
 "widgetSelectForeground",
 "widget3DHighlight",
 "widget3DShadow"]
maccols=["-moz-mac-focusring",
 "-moz-mac-menuselect",
 "-moz-mac-menushadow",
 "-moz-mac-menutextdisable",
 "-moz-mac-menutextselect",
 "-moz_mac_disabledtoolbartext",
 "-moz-mac-accentlightesthighlight",
 "-moz-mac-accentregularhighlight",
 "-moz-mac-accentface",
 "-moz-mac-accentlightshadow",
 "-moz-mac-accentregularshadow",
 "-moz-mac-accentdarkshadow",
 "-moz-mac-accentdarkestshadow",
 "-moz-mac-alternateprimaryhighlight",
 "-moz-mac-secondaryhighlight",
]
allcolors=[ 
 "activeborder",
 "activecaption",
 "appworkspace",
 "background",
 "buttonface",
 "buttonhighlight",
 "buttonshadow",
 "buttontext",
 "captiontext",
 "graytext",
 "highlight",
 "highlighttext",
 "inactiveborder",
 "inactivecaption",
 "inactivecaptiontext",
 "infobackground",
 "infotext",
 "menu",
 "menutext",
 "scrollbar",
 "threeddarkshadow",
 "threedface",
 "threedhighlight",
 "threedlightshadow",
 "threedshadow",
 "window",
 "windowframe",
 "windowtext",
 "-moz-buttondefault",
 "-moz-field",
 "-moz-fieldtext",
 "-moz-dialog",
 "-moz-dialogtext",
 "-moz-dragtargetzone",
 "-moz-cellhighlight",
 "-moz_cellhighlighttext",
 "-moz-html-cellhighlight",
 "-moz-html-cellhighlighttext",
 "-moz-buttonhoverface",
 "-moz_buttonhovertext",
 "-moz_menuhover",
 "-moz_menuhovertext",
 "-moz_menubartext",
 "-moz_menubarhovertext",
 "-moz_eventreerow",
 "-moz_oddtreerow", 
 "-moz-win-mediatext",
 "-moz-win-communicationstext",
 "-moz-nativehyperlinktext",
 "-moz-comboboxtext",
 "-moz-combobox"
];
xi=0;yi=0;len=24;xn=10;
var initAll=function(){
	canv=document.createElementNS("http://www.w3.org/1999/xhtml",'canvas')
	document.documentElement.appendChild(canv)
	canv.setAttribute('width',xn*len+1+'px')
	canv.setAttribute('height',xn*len+1+'px')
	canv.setAttribute('onmousemove',"onMouseMover(event)")
	canv.setAttribute('onclick',"onclicker(event)")

	ctx = canv.getContext("2d");
	canv.style.outline='1px blue solid'
	canv.style.margin='5px'
	canv.style.padding='5px'
	canv.style.background='white'
	for(i in allcolors)draw(i)
	drawGrid();lastI=0
	info=document.getElementById('info')
	infop=info.parentNode
	infop.style.background='white'
	infop.style.outline='1px blue solid'
	info2=info.nextSibling
	colorinfo=info2.nextSibling||document.body||document.documentElement
	
	
	
initSel()
}

/**/
nsIPrefService = Components.interfaces.nsIPrefService;
nsIPrefBranch = Components.interfaces.nsIPrefBranch;
gPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(nsIPrefService);
gPrefBranch = gPrefService.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranch2)

function savePref(name,val){
	prefName="ui."+name
	gPrefBranch.setCharPref(prefName,val)
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










function onMouseMover(evt) {
	var r=canv.getBoundingClientRect()
	var x=-r.left+evt.layerX,y=-r.top+evt.layerY ;
	
	x=Math.floor(x/len);y=Math.floor(y/len);	
	var i=x+xn*y	
	var i2=Math.floor(i/xn),i1=i%xn;
	if(i==lastI||i>=allcolors.length||i1>=xn||i2>=xn) 
		return
	data=ctx.getImageData((x+0.5)*len, (y+0.5)*len, 1, 1)
	data=data.data;
	info.textContent=allcolors[i]+' : ';
	data.pop()
	info2.value='rgb('+data+')'//+'  ('+i1+', '+i2+') ('+x+', '+y+') '+i
	colorinfo.style.background='lime'
	colorinfo.style.background=allcolors[i].replace('_','-');
	colorinfo.style.minWidth=200+'px'
	
	drawNormal(lastI)
	drawHover(i)
	lastI=i
	
}
function onclicker(evt) {
dump(canv.hasAttribute('onmousemove'))
	canv.hasAttribute('onmousemove')?
	canv.removeAttribute('onmousemove'):
	canv.setAttribute('onmousemove',"onMouseMover(event)")

}

dump = function(){
var aMessage="aMessage"
 for (var i = 0; i < arguments.length; i++)
    aMessage += arguments[i] + " , ";
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("" + aMessage); //new Date() + ":  "
    //Components.utils.reportError(e); // report the error and continue execution
}


var draw=function (i) {
	i2=Math.floor(i/xn);i1=i%xn;
	//console.log(i1,i2)
	asd= allcolors[i].replace('_','-');
	
	ctx.fillStyle='red'	
	ctx.fillStyle=asd
	ctx.beginPath();
	ctx.rect(3+i1*len,3+i2*len,len-5,len-5)
	ctx.closePath();	
	ctx.fill();
	/* 	ctx.clearRect(0,0,300,300);

	data = ctx.getImageData(1, 1, 1, 1).data;
	ctx.fillStyle ='black'
	ctx.fillText(asd+data,10,10) */
}

var drawNormal=function (i) {
	i2=Math.floor(i/xn);i1=i%xn;
	asd= allcolors[i].replace('_','-');
	ctx.clearRect(1+i1*len,1+i2*len,len-1,len-1)
	ctx.fillStyle='red'	
	ctx.fillStyle=asd
	ctx.beginPath();
	ctx.rect(3+i1*len,3+i2*len,len-5,len-5)
	ctx.closePath();	
	ctx.fill();
}
var drawHover=function (i) {
	i2=Math.floor(i/xn);i1=i%xn;
	asd= allcolors[i].replace('_','-');
	ctx.clearRect(1+i1*len,1+i2*len,len-1,len-1)

	ctx.fillStyle='red'	
	ctx.fillStyle=asd
	ctx.beginPath();
	ctx.rect(5+i1*len,5+i2*len,len-5,len-5)
	ctx.closePath();	
	ctx.fill();	
}
function drawGrid(){
	ctx.fillStyle='black'
	ctx.lineWidth=1

	ctx.beginPath();  
	for(i=0;i<=xn;i++){
		ctx.moveTo(i*len+0.5,0);  
		ctx.lineTo(i*len+0.5,xn*len);  		
	}for(i=0;i<=xn;i++){
		ctx.moveTo(0,i*len+0.5);  
		ctx.lineTo(xn*len,i*len+0.5);  
	}
	ctx.stroke();  
}

