## inspector
   press `F1` anywhere to start lightweight inspector (can be changed using options dialog) 
   
   `Numpad1` show/hide attributes
   
   `Numpad3` toggle between inspecting event.otiginalTarget/event.target
   
   `Numpad4/6` previous/next inspected node

   
   `arrows` navigate dom
   
   `Ctrl+Delete` remove node
   
   `Numpad5` open domInspector
   
   `Numpad7` open domMirror (built in dom inspector)
   
   `Numpad8` open Firebug

## edit:#any_web_address
foxiMirror adds edit: protocol allowing to edit any file inside browser with ace editor (  try [edit:c:](edit:c:) )

using the following js snippet

    Components.utils.import("resource://shadia/main.js")
	$shadia.editGlue.setDataSource("source", function(path, query, ext, editGlue){
	    editGlue.contentType = 'text/xml' // use this if you need to override automatic contentType based on ext
	    return xmlCode
    })

it is possible to load any text into url ``edit:@source`path.ext?query#index`` with chrome privileges

*note: edit: uris can be loaded only from browser chrome and are not accessible to web content*

## jsMirror

allows to run javascript in any scope. press: 
`Shift+Enter` to create new cell
`Ctrl+Enter` to evaluate selected text or current cell
`Ctrl+Shift+Enter` to do previous and print properties of the result
`Ctrl+Space|Alt+.|Ctrl+.` to start object inspector

jsMirror adds jn object into evaluation context (try jn.say, jn.getParent jn.`Ctrl+Space` to see all methods)

*note: since code is evaluated in window scope, without sandbox, it is better to use jsMirror only for trusted pages, use Acebug to run code in arbitrary webpages*

## chromeMirror ##
allows to view all registered chrome: locations
and 

## domMirror ##
better replacement for DomInspector, allows viewing dom structure of any open document (most useful for xul); xbl bindings, event listeners and css rules for any node
ability to search through all the css rules in document
ability to search nodes in document using `xpath`

`TODO` editable css rules, infotip 

## xulMirror
simple xul editor with live preview and autocompletion.
unlike xulPlayground uses edit@xulMirror` which allows to quickly test bindings and overlays

## cssMirror
allows to add stylesheets with (like stylish)

`TODO` edit any stylesheet

## prefMirror
`TBD`.

## magnifier
simple autohotkey script to show magnified and pick colors

*in development: version for windows using ctypes*


***
*on Mac shortcuts use Command instead of Controll*