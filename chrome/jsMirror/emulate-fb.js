FBL = {}
if(Function.bind)
	FBL.bind = function (x, y) x.bind(y)
else
	FBL.bind = function (fn, object) {
		return function bound() fn.apply(object, arguments);
	}
FBL.extend = function (l, r) {
    var newOb = {};
    for (var n in l) {
        newOb[n] = l[n];
    }
    for (var n in r) {
        newOb[n] = r[n];
    }
    return newOb;
}
FBL.eraseNode = function (node) {
    while (node.lastChild)
        node.removeChild(node.lastChild);
}
FBL.createMenuItem = MenuUtils.createMenuItem
Firebug = {Ace: {}}
var Cc = Components.classes;
var Ci = Components.interfaces;
