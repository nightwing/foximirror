
/**/
jn.inspect=function(x,long){
	var Class=jn.getClass(x)
	
	if(x == null) return String(x);
	var name, t = typeof x;
	switch(t){
		case 'object': break;
		//case 'string': return x;
		case 'function':
			if(long) return x.toString(0)
			name=x.toString()

			var i=name.indexOf("{")
			var t=name.substr(i)=='{[native code]}'?'function[n]': 'function'

			name=t+name.substring(name.indexOf(" "),i-1)+'~'+x.length

			return name
		case 'xml': x = x.toXMLString();
		default: return  t+' '+x;
	}
	try{
		var l=x.length
	}catch(e){}//[xpconnect wrapped native prototype].length: throws Illegal operation on WrappedNative prototype object

	if(long&&typeof l==='number' && typeof x.push==='function' &&typeof x.splice==='function') {
		name = 'array~  '+x.length+'\n   '+x.join(',\n   ');return name
	}
	//d.constructor
	var name = '`'+Class+'` '+x.toString()//\u25b7'\u25ba'
	//for files
	try{
		if(x.spec)
			return name+" "+x.spec
		else if(x.path)
			return name+" "+x.path
		//for dom nodes
		if(x.nodeName)
			name+=x.nodeName
		if(x.id)
			name+="#"+x.id
		if(x.className)
			name+="."+x.className.toString().replace(" ",".",'g')
		if(x.value)
			name+=" ="+x.value.substring(0,30)
		else if(x.nodeValue)
			name+=" ="+x.nodeValue.substring(0,30)
		if(typeof l==='number')
			name+=' ~'+l
	}catch(e){}

	return name
}
/**/
function outer() {
    var communicationChannel = 24;
    function innerGetter() {
        return communicationChannel;
    }
    function innerSetter(x) {
        communicationChannel = 42;
    }
var io=1
    return [innerGetter, innerSetter];
}
i=outer()
ui=jn.getParent(i[0])








/********************

************/
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


