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