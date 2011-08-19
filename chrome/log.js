var nsiError = Ci.nsIScriptError
var nsiError2 = Ci.nsIScriptError2
var nsiMessage = Ci.nsIConsoleMessage
var chromeRe = /http/i

parseError = function(w) {
	var p = {}
	var f = e.flags
	p.class = (f & 1) ? (f == 9 ? 'dump': 'warn') : 'error'
	p.code = e.sourceLine
	p.fullText = e.message
	p.text = e.errorMessage
	p.src = e.sourceName
	p.col = e.columnNumber
	p.row = e.lineNumber
	p.category = e.category
	p.isChrome = !p.src.test(chromeRe)

	var c = p.category
	if(c == 'HTML' || c == 'malformed-xml' || c == 'SVG')
		p.lang = 'xml'
	if(c == 'CSS Parser' || c == 'CSS Loader')
		p.lang = 'css'
	return p	
}

var errorList = []
if(e instanceof nsiError){
	e.QueryInterface(nsiError)
	errorList.push(parseError(e))
}else if(e instanceof nsiMessage){
	errorList.push({class:'log', text: e.message, isChrome:true})
}

function addHTML(e){
	'<div class="'+e.class+'">'+
	
	'</div>'
}
function escapeHTML(str) str.replace(/[&"<>]/g, function(m)"&"+escapeMap[m]+";");
var escapeMap = { "&": "amp", '"': "quot", "<": "lt", ">": "gt" }


cropString = function(text, limit){
    // Make sure it's a string.
    text = text + "";

    // Use default limit if necessary.
    if (!limit)
        limit = 55;
    if (text.length > limit){
		var halfLimit = (limit / 2)-1;
		return text.substr(0, halfLimit) + '\u22EF' + text.substr(text.length-halfLimit);
	}
    return text;
}


sayError = function(e){
	
	p=
	
	['<em>flags:</em> '+e.
	,'<em>message:</em> '+e.message
	,'<em>errorMessage:</em> '+e.errorMessage
	,'<em>sourceName:</em> '+
	,'<em>sourceLine:</em> '+e.sourceLine
	,'<em>lineNumber:</em> '+e.
	,'<em>columnNumber:</em> '+
	,'<em>category:</em> '+e.
	,'<em>outerWindowID:</em> '+e.outerWindowID
	]

	return '<pre>'+p.join('\n')+'</pre>'
}
var a={},n={}
Services.console.getMessageArray(a, n)
n=n.value
a=a.value
var ans=[]
for(i=0;i<n;i++){
	var e = a[i]
	if(e instanceof nsiError)
		e.QueryInterface(nsiError)
	if(e instanceof nsiError2)
		e.QueryInterface(nsiError2)
	
	ans.push(sayError(e))
}
content.wrappedJSObject.document.body.innerHTML=ans.join()

var isWarning = aMessage.flags & Components.interfaces.nsIScriptError.warningFlag;
if (/^(uncaught exception: )?\[Exception... /.test(aMessage.errorMessage)){
	aMessage = this.parseUncaughtException(aMessage);
}
var row = this.createConsoleRow(aMessage.errorMessage, (isWarning)?"warning":"error");
										
aMessage.category)
					
if (aMessage.sourceLine){
	// malformed-xml errors include their own caret -----v
	row.setAttribute("code", aMessage.sourceLine.replace(/\n\-+\^$/, "").replace(/\s/g, " "));
	row.setAttribute("column", aMessage.columnNumber || 0);
}



/*** from the one-regexp-is-worth-a-whole-parser dept. ***/					
// cf. http://lxr.mozilla.org/mozilla/source/js/src/xpconnect/src/xpcexception.cpp#347 and http://lxr.mozilla.org/mozilla/source/js/src/xpconnect/src/xpcstack.cpp#318 and http://lxr.mozilla.org/mozilla/source/dom/src/base/nsDOMException.cpp#315
if (/^(?:uncaught exception: )?\[Exception... "(?!<no message>)([\s\S]+)"  nsresult: "0x\S+ \((.+)\)"  location: "(?:(?:JS|native) frame :: (?!<unknown filename>)(.+) :: .+ :: line (\d+)|<unknown>)"  data: (?:yes|no)\]$/.test(aMessage.errorMessage) || /^(?:uncaught exception: )?\[Exception... "(?!<no message>)([\s\S]+)"  code: "\d+" nsresult: "0x\S+ \((.+)\)"  location: "(?:(.+) Line: (\d+)|<unknown>)"\]$/.test(aMessage.errorMessage)){
	return {
		errorMessage: RegExp.$1 + ((RegExp.$1.indexOf(RegExp.$2) == -1)?" = " + RegExp.$2:""),
		sourceName: RegExp.$3,
		lineNumber: RegExp.$4
	};
}
return aMessage;