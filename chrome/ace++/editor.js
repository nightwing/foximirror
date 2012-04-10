Components.utils.import("resource://gre/modules/Services.jsm");
/*devel__(*/
	Services.obs.notifyObservers(null, "startupcache-invalidate", null);		
/*devel__)*/

void function(exports) {


if (!window.console) {
    console={};
    console.log = console.error = function() {};
}

var aceRoot = './res/ace/';
var PATHS = exports.PATHS = {
	'ace/theme/'              :  aceRoot + 'theme-',
	'ace/keyboard/'           :  aceRoot + 'keybinding-',
	'ace/mode/'               :  aceRoot + 'mode-',
	'fbace/'                  :  '',
	'res/'                    :  'res/',
	'shadia/'                 :  '../'
}

function transformPath(path) {
	for (var sub in PATHS){
        if (path.indexOf(sub) === 0) {
			return PATHS[sub] + path.substr(sub.length) + '.js';
        }
    }

    return aceRoot + path
}

//*******************************************************************************************
//mini require from ace doesn't work :(
var define = exports.define = function(id, deps, payload) {
    if (arguments.length == 2)
        payload = deps;
	else if (arguments.length == 1) {
        payload = id;
		id = exports.currentID;
	}

    if(!require.modules[id])
        require.modules[id] = payload;
};

var require = exports.require = function(id, callback) {
    if (Object.prototype.toString.call(id) === "[object Array]") {
        for (var i = 0, l = id.length; i < l; ++i)
			require.lookup(id[i], true);

        var params = [];
		for (var i = 0, l = id.length; i < l; ++i)
            params.push(require.lookup(id[i]));

        if (callback)
            callback.apply(null, params);
    }
    else if (typeof id === 'string') {
        var payload = require.lookup(id);

        if (callback)
            callback(payload);

        return payload;
    }
};

require.modules = {};

require.lookup = function(id, loadOnly) {
    var payload = require.modules[id];
    if (payload == null) {
        require.loadScript(id);
		payload = require.modules[id];
		if (loadOnly)
			return
    }

    if (typeof payload === 'function') {
        var exports = {};
		var module = { id: id, uri: '', exports: exports}
        var ret = payload(require, exports, module);
        // cache the resulting module object for next time
        payload = require.modules[id] = ret || module.exports;
    }

    return payload;
};

require.loadScript = exports.loadScript = function(id) {
    var url = transformPath(id)
	if (!/\w+\:/.test(url)) {
		//url = exports.root + url
		url = Components.stack.filename + '/../' + url
	}
	
	var defineOriginal = window.define
	window.define = exports.define
	exports.currentID = id
	try {
		Services.scriptloader.loadSubScript(url, window);
	}catch(e) {
		Components.utils.reportError(e)
	} finally {	
		window.define = defineOriginal;
		exports.currentID = null
	}
};
//*********************************************************************************************

var onLaunch, launched;
window.startAce = function(callback, options, deps) {
    if (onLaunch) {
        onLaunch = callback || onLaunch;
		if(launched)
			onLaunch(window)
        return;
    }
    onLaunch = callback || true;
    // "ace/mode/javascript", "ace/mode/css", are loaded with html 
    var rootDeps = ["fbace/startup", "res/ace/ace"];
    if (!options)
        options = {
			softtabs: true,
			wordwrap: false,
			highlightactiveline: true,
			highlightselectedword: true,
			validateasyoutype: false,
			autopair: true,
		};
    //"ace/theme/textmate" is built into ace.js so there's no need to load that
    if (!options.theme)
        options.theme = "ace/theme/textmate";
    else if (options.theme != "ace/theme/textmate")
        rootDeps.unshift(options.theme);
		
	if(deps)
		rootDeps.unshift.apply(rootDeps, deps)

	require(rootDeps, function() {
        require("fbace/startup").launch({}, options);
		launched = true
		
		onLaunch.call && onLaunch(window)
		onLaunch = true
    });
};
}(window.ace = {root: Components.stack.fileName + '/../'})