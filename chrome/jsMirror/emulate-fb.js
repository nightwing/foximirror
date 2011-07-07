FBL = {}
if(Function.bind)
	FBL.bind = function (x, y) x.bind(y)
else
	FBL.bind = function () {
		return function bound() fn.apply(object, arguments);
	}
FBL.extend = function (l, r) {
    if (!l || !r) {
        throw new Error("FBL.extend on undefined object");
    }
    var newOb = {};
    for (var n in l) {
        newOb[n] = l[n];
    }
    for (var n in r) {
        newOb[n] = r[n];
    }
    return newOb;
}
Firebug = {Ace: {}}
var Cc = Components.classes;
var Ci = Components.interfaces;
