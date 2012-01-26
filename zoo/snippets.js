/***/
var docShell = content.window.QueryInterface(Ci.nsIInterfaceRequestor)
                                .getInterface(Ci.nsIWebNavigation)
                                .QueryInterface(Ci.nsIDocShell);
selCon= docShell.QueryInterface(Ci.nsIInterfaceRequestor)
                                   .getInterface(Ci.nsISelectionDisplay)
                                   .QueryInterface(Ci.nsISelectionController);

viewDoc.body.contentEditable=true
docShell.editor.selectionController


ff=document.getElementById('slate-browser').fastFind
//ff.findAgain('i',false)//find('cu',false)
ff.find('i',false)
ff.caseSensitive=false
ff.findAgain('i',0)



/****/


u=viewDoc.defaultView.getSelection().focusNode.parentNode.parentNode.parentNode.attributes[0].value
r=currentRules[u].parentStyleSheet
sayCSS

viewDoc.body.innerHTML=sayCSS(r.cssRules)


/****/
i=content.wrappedJSObject.lt.parentNode.parentNode.getAttribute('slateid')

parseInt(i)
currentRules[i].style.setProperty('display','block','')
currentRules[i].style.setProperty('width','50px','')
currentRules[i].cssText

lt=content.wrappedJSObject.lt
lt.previousElementSibling.textContent


/**/
cssSearch.findBindingRules().length
ios.getProtocolHandler("about").QueryInterface(Ci.nsIProtocolHandler).newURI('about:config',null,null)
Services.dirsvc.getFile()
cssSearch.findBindingRules().length
ios.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler).hasSubstitution('resource://gre/res/forms.css')
/**/
h=new XMLSerializer().serializeToString(document)

XML(h).toXMLString()



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
