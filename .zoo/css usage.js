domUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);

this.mDOMUtils.setContentState

stylishStyles=[]
documentStyles=[]
userAgentStyles=[]
hrefs=[]
std=document.styleSheets
for(var j = 0; j < std.length; j++){
	hrefs.push(std[j].href)
	documentStyles.push(std[j])
}

function collectAgentSheets(element){
	var inspectedRules=domUtils.getCSSStyleRules(element)
	if(!inspectedRules)return
	for(var i = 0; i < inspectedRules.Count(); ++i){
		var sheet= inspectedRules.GetElementAt(i).QueryInterface(Ci.nsIDOMCSSStyleRule).parentStyleSheet;
		var href=sheet.href;  // Null means inline
		if(!href)
			return
		else if(href.substring(0,5)=='data:')
			stylishStyles.push(sheet)
		else if(hrefs.indexOf(href)<0){
			hrefs.push(href)
			userAgentStyles.push(sheet)
		}
	}
}
elements=['scrollbar','tree','textbox','toolbarbutton','toolbar','button','checkbox','menu']
for each(var i in elements){
	var k=document.documentElement.appendChild(document.createElement(i))
	collectAgentSheets(k)
	k.parentNode.removeChild(k)
}

userAgentStyles.map(function(x)x.href)








findStylesheet=function(href,awin){
	var ss = document.styleSheets;
    for (var i = ss.length - 1; i >= 0; i--) {
      if (ss[i].href===href) 
		return ss[i]		
    }
}
findStylesheet(ref,win)


ans[4][1].parentStyleSheet.parentStyleSheet









var doCssRules = function(cssrules, stylesheets){
	for(var j = 0; j < cssrules.length; j++){
		var rule = cssrules[j];
		if (rule.styleSheet){ //@import				
			stylesheets.push(rule.styleSheet);					
		}else if (rule.type===1){
			var selector = rule.selectorText;
			if(selector.indexOf(ss)>-1)
			ans.push(selector)
		}
		else{//@charset or something					
		}
	}
}
t=Date.now()
ss=".signature"
ans=[]
st=[]
std=document.styleSheets
for(var j = 0; j < std.length; j++)
	st.push(std[j])
std=document.childNodes
for(var j = 0; j < std.length; j++){
if(std[j].sheet)
	st.push(std[j].sheet)
}
for(var i in st)
doCssRules(st[i].cssRules,st)
st.length-std.length
t-Date.now()
st

for(var i in st){
//if(st[i].href.indexOf("smarttext")>-1)
ans.push(st[i].href)
}
ans.join("\n")









































XPCU={
	getService: function (aURL, aInterface){
		try{
			return Components.classes[aURL].getService(Components.interfaces[aInterface]);
		} catch (ex) {
			dump("Error getting service: " + aURL + ", " + aInterface + "\n" + ex);
			return null;
		}
	},
	createInstance: function (aURL, aInterface) {
		try {
			return Components.classes[aURL].createInstance(Components.interfaces[aInterface]);
		} catch (ex) {
			dump("Error creating instance: " + aURL + ", " + aInterface + "\n" + ex);
			return null;
		}
	},
	QI: function (aEl, aIName) {
		try {
			return aEl.QueryInterface(Components.interfaces[aIName]);
		} catch (ex) {
			throw "Unable to QI " + aEl + " to " + aIName;
		}
	}
}
domUtils=XPCU.getService("@mozilla.org/inspector/dom-utils;1", "inIDOMUtils")
inspectedRules=domUtils.getCSSStyleRules(gURLBar)
ans=[]
 for (var i = 0; i < inspectedRules.Count(); ++i) {
                var rule = XPCU.QI(inspectedRules.GetElementAt(i), Components.interfaces.nsIDOMCSSStyleRule);

                var href = rule.parentStyleSheet.href;  // Null means inline
ans.push(href,rule)
}
ans[7].parentStyleSheet


domUtils.getRuleLine(ans[7])





var doCssRules = function(cssrules, stylesheets){
	for (var j = 0; j < cssrules.length; j++){
		var rule = cssrules[j];
		if (rule.styleSheet){ //@import				
			stylesheets.push(rule.styleSheet);					
		}else if (rule.type===1){
			var selector = rule.selectorText;
			if(selector.indexOf(ss)>-1)
			ans.push(selector)
		}
		else{//@charset or something					
		}
	}
}
t=Date.now()
ss=".signature"
ans=[]
st=[]
std=document.styleSheets
for(var j = 0; j < std.length; j++)
	st.push(std[j])
for(var i in st)
doCssRules(st[i].cssRules,st)
st.length-std.length
t-Date.now()
ans


for(var i in st)
ans.push(st[i].href)
ans










gBrowser.getAttribute("type")
gb=gBrowser.browsers[17]
gb.setAttribute("type","crome")
gb.getAttribute("type")

var doCssRules = function(cssrules, stylesheets){
	for (var j = 0; j < cssrules.length; j++){
		var rule = cssrules[j];
		if (rule.styleSheet){ //@import				
			stylesheets.push(rule.styleSheet);					
		}else if (rule.type===1){
			var selector = rule.selectorText;
			if(selector.indexOf(ss)>-1)
			ans.push(selector)
		}
		else{//@charset or something					
		}
	}
}
t=Date.now()
ss=":"
ans=[]
st=[]
std=gb.contentDocument.styleSheets
for(var j = 0; j < std.length; j++)
	st.push(std[j])
for(var i in st)
doCssRules(st[i].cssRules,st)
st.length-std.length
t-Date.now()
ans







var doCssRules = function(cssrules, stylesheets){
	for (var j = 0; j < cssrules.length; j++){
		var rule = cssrules[j];
		if (rule.styleSheet){ //@import				
			stylesheets.push(rule.styleSheet);					
		}else if (rule.type===1){
			var selector = rule.selectorText;
			if(selector.indexOf(ss)>-1)
			ans.push(selector)
		}
		else{//@charset or something					
		}
	}
}
t=Date.now()
ss="scrollbar"
ans=[]
st=[]
std=document.styleSheets
for(var j = 0; j < std.length; j++)
	st.push(std[j])
for(var i in st)
doCssRules(st[i].cssRules,st)
st.length-std.length
t-Date.now()
ans

ans=[]
for(var i in st)
ans.push(st[i].href)
ans.join('\n')
















XPCU={
	getService: function (aURL, aInterface){
		try{
			return Components.classes[aURL].getService(Components.interfaces[aInterface]);
		} catch (ex) {
			dump("Error getting service: " + aURL + ", " + aInterface + "\n" + ex);
			return null;
		}
	},
	createInstance: function (aURL, aInterface) {
		try {
			return Components.classes[aURL].createInstance(Components.interfaces[aInterface]);
		} catch (ex) {
			dump("Error creating instance: " + aURL + ", " + aInterface + "\n" + ex);
			return null;
		}
	},
	QI: function (aEl, aIName) {
		try {
			return aEl.QueryInterface(Components.interfaces[aIName]);
		} catch (ex) {
			throw "Unable to QI " + aEl + " to " + aIName;
		}
	}
}
domUtils=XPCU.getService("@mozilla.org/inspector/dom-utils;1", "inIDOMUtils")
inspectedRules=domUtils.getCSSStyleRules(gURLBar)
ans=[]
 for (var i = 0; i < inspectedRules.Count(); ++i) {
                var rule = XPCU.QI(inspectedRules.GetElementAt(i), Components.interfaces.nsIDOMCSSStyleRule);

                var href = rule.parentStyleSheet.href;  // Null means inline
ans.push([href,rule])
}
ans[3][1].parentStyleSheet.cssRules[0].deleteRule(7)//
ans[3][1].parentStyleSheet.cssRules[0].cssRules[7].cssText
ans[3][1].parentStyleSheet.cssRules[0].insertRule("stsegment:hover { color: green ! important; }",
7)
