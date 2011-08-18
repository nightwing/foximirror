Dom={}
Dom.collapse = function(elt, collapsed){
    if (!elt)
        return;
    elt.setAttribute("collapsed", collapsed ? "true" : "false");
}
Dom.getAncestorByClass = function(node, className){
    for (var parent = node; parent; parent = parent.parentNode)    {
        if (parent.classList.contains(className))
            return parent;
    }
    return null;
}
Dom.getBody = function(doc){
    if (doc.body)
        return doc.body;

    var body = doc.getElementsByTagName("body")[0];
    if (body)
        return body;

    return doc.documentElement;  // For non-HTML docs
};

Dom.getNextByClass = function(root, state)
{
    function iter(node) { return node.nodeType == 1 && Css.hasClass(node, state); }
    return Dom.findNext(root, iter);
};

Dom.getPreviousByClass = function(root, state)
{
    function iter(node) { return node.nodeType == 1 && Css.hasClass(node, state); }
    return Dom.findPrevious(root, iter);
};

Dom.findNextDown = function(node, criteria)
{
    if (!node)
        return null;

    for (var child = node.firstChild; child; child = child.nextSibling)
    {
        if (criteria(child))
            return child;

        var next = Dom.findNextDown(child, criteria);
        if (next)
            return next;
    }
};

Dom.findPreviousUp = function(node, criteria)
{
    if (!node)
        return null;

    for (var child = node.lastChild; child; child = child.previousSibling)
    {
        var next = Dom.findPreviousUp(child, criteria);
        if (next)
            return next;

        if (criteria(child))
            return child;
    }
};

Dom.findNext = function(node, criteria, upOnly, maxRoot)
{
    if (!node)
        return null;

    if (!upOnly)
    {
        var next = Dom.findNextDown(node, criteria);
        if (next)
            return next;
    }

    for (var sib = node.nextSibling; sib; sib = sib.nextSibling)
    {
        if (criteria(sib))
            return sib;

        var next = Dom.findNextDown(sib, criteria);
        if (next)
            return next;
    }

    if (node.parentNode && node.parentNode != maxRoot)
        return Dom.findNext(node.parentNode, criteria, true, maxRoot);
};

Dom.findPrevious = function(node, criteria, downOnly, maxRoot)
{
    if (!node)
        return null;

    for (var sib = node.previousSibling; sib; sib = sib.previousSibling)
    {
        var prev = Dom.findPreviousUp(sib, criteria);
        if (prev)
            return prev;

        if (criteria(sib))
            return sib;
    }

    if (!downOnly)
    {
        var next = Dom.findPreviousUp(node, criteria);
        if (next)
            return next;
    }

    if (node.parentNode && node.parentNode != maxRoot)
    {
        if (criteria(node.parentNode))
            return node.parentNode;

        return Dom.findPrevious(node.parentNode, criteria, true);
    }
};
Css = {}
Css.hasClass = function(node, cl){
	return node.classList.contains(cl)
}

//*************************************************************

var reSplitCSS =  /(url\("?[^"\)]+?"?\))|(rgba?\(.*?\))|(hsla?\(.*?\))|(#[\dA-Fa-f]+)|(-?\d+(\.\d+)?(%|[a-z]{1,4})?)|([^,\s\/!\(\)]+)|"(.*?)"|(!(.*)?)/;
var reURL = /url\("?([^"\)]+)?"?\)/;
function parseCSSValue(value, offset) {
	var start = 0;
	var m;
	while (true) {
		m = reSplitCSS.exec(value);
		if (m && m.index + m[0].length < offset) {
			value = value.substr(m.index + m[0].length);
			start += m.index + m[0].length;
			offset -= m.index + m[0].length;
		} else 
			break;
	}

	if (!m)
		return;

	var type;
	if (m[1]) type = "url";
	else if (m[2] || m[4]) type = "rgb";
    else if (m[3]) type = "hsl";
    else if (m[5]) type = "int";

    var cssValue = {
        value: m[0],
        start: start + m.index,
        end: start + m.index + (m[0].length - 1),
        type: type
    };

    if (!type && m[8] && m[8].indexOf("gradient") != -1) {
        var arg = value.substr(m[0].length).match(/\((?:(?:[^\(\)]*)|(?:\(.*?\)))+\)/);
        if (!arg)
			return;

        cssValue.value += arg[0];
        cssValue.type = "gradient";
    }
    return cssValue;
}



// ************************************************************************************************
// Constants

const maxWidth = 100, maxHeight = 80;
const infoTipMargin = 10;
const infoTipWindowPadding = 25;

// ************************************************************************************************

InfoTip = {
        onLoadImage: function(event) {
            var img = event.currentTarget;
            var bgImg = img.nextSibling;
            if (!bgImg)
                return; // Sometimes gets called after element is dead

            var caption = bgImg.nextSibling;
            var innerBox = img.parentNode;

            var w = img.naturalWidth, h = img.naturalHeight;
            var repeat = img.getAttribute("repeat");

            if (repeat == "repeat-x" || (w == 1 && h > 1)) {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat-x";
                bgImg.style.width = maxWidth + "px";
                if (h > maxHeight)
                    bgImg.style.height = maxHeight + "px";
                else
                    bgImg.style.height = h + "px";
            } else if (repeat == "repeat-y" || (h == 1 && w > 1)) {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat-y";
                bgImg.style.height = maxHeight + "px";
                if (w > maxWidth)
                    bgImg.style.width = maxWidth + "px";
                else
                    bgImg.style.width = w + "px";
            } else if (repeat == "repeat" || (w == 1 && h == 1)) {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat";
                bgImg.style.width = maxWidth + "px";
                bgImg.style.height = maxHeight + "px";
            } else {
                if (w > maxWidth || h > maxHeight) {
                    if (w > h)
                    {
                        img.style.width = maxWidth + "px";
                        img.style.height = Math.round((h / w) * maxWidth) + "px";
                    }
                    else
                    {
                        img.style.width = Math.round((w / h) * maxHeight) + "px";
                        img.style.height = maxHeight + "px";
                    }
                }
            }

            caption.innerHTML = w+':'+h;

            innerBox.classList.remove("infoTipLoading");
        },

        onErrorImage: function(event) {
            var img = event.currentTarget;
            var bgImg = img.nextSibling;
            if (!bgImg)
                return;

            var caption = bgImg.nextSibling;

            // Display an error in the caption (instead of dimensions).
            if (img.src.indexOf("moz-filedata") == 0)
                caption.innerHTML = "failedToPreviewObjectURL";
            else
                caption.innerHTML = "failedToPreviewImageURL";

            var innerBox = img.parentNode;
            innerBox.classList.remove("infoTipLoading");
        },
    

    initializeBrowser: function(browser) {
        browser.onInfoTipMouseOut = Obj.bind(this.onMouseOut, this, browser);
        browser.onInfoTipMouseMove = Obj.bind(this.onMouseMove, this, browser);

        var doc = browser.contentDocument;
        if (!doc)
            return;

        doc.addEventListener("mouseover", browser.onInfoTipMouseMove, true);
        doc.addEventListener("mouseout", browser.onInfoTipMouseOut, true);
        doc.addEventListener("mousemove", browser.onInfoTipMouseMove, true);

		var div = doc.createElement('div')
		div.className = 'infoTip'		
        return browser.infoTip = Dom.getBody(doc).appendChild(div)
    },

    uninitializeBrowser: function(browser) {
        if (browser.infoTip) {
            var doc = browser.contentDocument;
            doc.removeEventListener("mouseover", browser.onInfoTipMouseMove, true);
            doc.removeEventListener("mouseout", browser.onInfoTipMouseOut, true);
            doc.removeEventListener("mousemove", browser.onInfoTipMouseMove, true);

            browser.infoTip.parentNode.removeChild(browser.infoTip);
            delete browser.infoTip;
            delete browser.onInfoTipMouseMove;
        }
    },

    showInfoTip: function(infoTip, panel, target, x, y, rangeParent, rangeOffset){
        var show = panel.showInfoTip(infoTip, target, rangeParent, rangeOffset);

        if(show){
            var htmlElt = infoTip.ownerDocument.documentElement;
            var panelWidth = htmlElt.clientWidth;
            var panelHeight = htmlElt.clientHeight;

            if(x+infoTip.offsetWidth+infoTipMargin > panelWidth){
                infoTip.style.left = Math.max(0, panelWidth-(infoTip.offsetWidth+infoTipMargin)) + "px";
                infoTip.style.right = "auto";
            }else{
                infoTip.style.left = (x+infoTipMargin) + "px";
                infoTip.style.right = "auto";
            }

            if(y+infoTip.offsetHeight+infoTipMargin > panelHeight){
                infoTip.style.top = Math.max(0, panelHeight-(infoTip.offsetHeight+infoTipMargin)) + "px";
                infoTip.style.bottom = "auto";
            }else{
                infoTip.style.top = (y+infoTipMargin) + "px";
                infoTip.style.bottom = "auto";
            }

            infoTip.setAttribute("active", "true");
        }else {
            this.hideInfoTip(infoTip);
        }
    },

    hideInfoTip: function(infoTip){
        if (infoTip)
            infoTip.removeAttribute("active");
    },

    onMouseOut: function(event, browser){
        if (!event.relatedTarget)
            this.hideInfoTip(browser.infoTip);
    },

    onMouseMove: function(event, browser){
        // Ignore if the mouse is moving over the existing info tip.
        if (Dom.getAncestorByClass(event.target, "infoTip"))
            return;

        if (browser.currentPanel){
            var x = event.clientX, y = event.clientY;
            this.showInfoTip(browser.infoTip, browser.currentPanel, event.target, x, y, event.rangeParent, event.rangeOffset);
        }else
            this.hideInfoTip(browser.infoTip);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

    populateColorInfoTip: function(infoTip, color){
        this.node.innerHTML = '<div class="infoTipColorBox" style="background:'+ color +';width: 100px; height: 40px;"><div>'
        return true;
    },
    populateImageInfoTip: function(infoTip, url, repeat){
        if (!repeat)
            repeat = "no-repeat";

        this.tags.imgTag.replace({urlValue: url, repeat: repeat}, infoTip);
		
		   /*
            DIV({"class": "infoTipImageBox infoTipLoading"},
                IMG({"class": "infoTipImage", src: "$urlValue", repeat: "$repeat",
                    onload: "$onLoadImage", onerror: "$onErrorImage"}),
                IMG({"class": "infoTipBgImage", collapsed: true, src: "blank.gif"}),
                DIV({"class": "infoTipCaption"})
            )*/

        return true;
    }
}