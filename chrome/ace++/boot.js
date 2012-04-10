//add stub console since ace calls console.error
if (!window.console) {
    console={};
    console.log = console.error = function() {};
}

var aceRoot = './res/ace/';
var PATHS = {
	'ace/theme/'              :  aceRoot + 'theme-',
	'ace/keyboard/'           :  aceRoot + 'keybinding-',
	'ace/mode/'               :  aceRoot + 'mode-',
	'fbace/'                  :  '',
	'res/'                    :  'res/',
	'shadia/'                 :  '../'
}

function transformPath(path) {
	for (var sub in PATHS){
        if(path.indexOf(sub) === 0) {
			return PATHS[sub] + path.substr(sub.length) + '.js';
        }
    }

    return aceRoot + path
}

loadScripts = function(deps, callback, lastUrl) {
    //console.log(deps)
    if (typeof deps === 'string') // module's path is wrong
        return;

    var url = deps.shift();
    if (!url)
        return callback && callback(_require(lastUrl));

    var script = document.createElementNS('http://www.w3.org/1999/xhtml', "script")
    script.type = "text/javascript;version=1.8";
    script.onload = function() {
        this.onload = null;
        loadScripts(deps, callback, url);
    };
	script.onerror = alert

    script.src = transformPath(url);
    document.documentElement.appendChild(script);
};

//*******************************************************************************************
//mini require from ace doesn't work :(
var _define = function(module, deps, payload) {
    if (arguments.length == 2)
        payload = deps;

    if (typeof module !== 'string') {
        console.error('dropping module because define wasn\'t a string.');
        return;
    }
    if(!require.modules[module])
        require.modules[module] = payload;
};

window.define = _define;

var _require = function(module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(module[i]);
            if (!dep)
                return loadScripts.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(module);
        if (!payload && _require.original)
            return;

        if (callback)
            callback();

        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

_require.modules = {};
if (window.require)
    _require.original = window.require;

window.require = _require;
require.packaged = true;

var lookup = function(moduleName) {
    var module = require.modules[moduleName];
    if (module == null) {
        //console.error('Missing module: ' + moduleName);
        return null;
    }

    if (typeof module === 'function') {
        var exports = {};
        module(require, exports, { id: moduleName, uri: '' });
        // cache the resulting module object for next time
        require.modules[moduleName] = exports;
        return exports;
    }

    return module;
};
//*********************************************************************************************

var onLaunch, launched;
var startAce = function(callback, options, deps) {
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