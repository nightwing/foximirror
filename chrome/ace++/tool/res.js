t=makeReq("https://raw.github.com/einars/js-beautify/master/beautify.js")+
makeReq("https://raw.github.com/einars/js-beautify/master/beautify-css.js")+
makeReq("https://raw.github.com/einars/js-beautify/master/beautify-html.js")

f=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile)
f.initWithPath("D:\\ffaddons\\shadia-the-light@inspector.am\\chrome\\ace++\\res\\beautify.js")

writeToFile(f, t)


t=makeReq("https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js")
f=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile)
f.initWithPath("D:\\ffaddons\\shadia-the-light@inspector.am\\chrome\\ace++\\res\\coffee-script.js")

writeToFile(f, t)