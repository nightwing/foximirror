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

function(Obj, Firebug, Domplate, Locale, Events, Css, Dom) {

// ************************************************************************************************
// Constants

const maxWidth = 100, maxHeight = 80;
const infoTipMargin = 10;
const infoTipWindowPadding = 25;

// ************************************************************************************************

InfoTip = {
    tags: {
        infoTipTag: '<div class="infoTip">',

        imgTag:
            DIV({"class": "infoTipImageBox infoTipLoading"},
                IMG({"class": "infoTipImage", src: "$urlValue", repeat: "$repeat",
                    onload: "$onLoadImage", onerror: "$onErrorImage"}),
                IMG({"class": "infoTipBgImage", collapsed: true, src: "blank.gif"}),
                DIV({"class": "infoTipCaption"})
            ),

        onLoadImage: function(event)
        {
            var img = event.currentTarget;
            var bgImg = img.nextSibling;
            if (!bgImg)
                return; // Sometimes gets called after element is dead

            var caption = bgImg.nextSibling;
            var innerBox = img.parentNode;

            var w = img.naturalWidth, h = img.naturalHeight;
            var repeat = img.getAttribute("repeat");

            if (repeat == "repeat-x" || (w == 1 && h > 1))
            {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat-x";
                bgImg.style.width = maxWidth + "px";
                if (h > maxHeight)
                    bgImg.style.height = maxHeight + "px";
                else
                    bgImg.style.height = h + "px";
            }
            else if (repeat == "repeat-y" || (h == 1 && w > 1))
            {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat-y";
                bgImg.style.height = maxHeight + "px";
                if (w > maxWidth)
                    bgImg.style.width = maxWidth + "px";
                else
                    bgImg.style.width = w + "px";
            }
            else if (repeat == "repeat" || (w == 1 && h == 1))
            {
                Dom.collapse(img, true);
                Dom.collapse(bgImg, false);
                bgImg.style.background = "url(" + img.src + ") repeat";
                bgImg.style.width = maxWidth + "px";
                bgImg.style.height = maxHeight + "px";
            }
            else
            {
                if (w > maxWidth || h > maxHeight)
                {
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

            caption.innerHTML = Locale.$STRF("Dimensions", [w, h]);

            Css.removeClass(innerBox, "infoTipLoading");
        },

        onErrorImage: function(event)
        {
            var img = event.currentTarget;
            var bgImg = img.nextSibling;
            if (!bgImg)
                return;

            var caption = bgImg.nextSibling;

            // Display an error in the caption (instead of dimensions).
            if (img.src.indexOf("moz-filedata") == 0)
                caption.innerHTML = Locale.$STR("firebug.failedToPreviewObjectURL");
            else
                caption.innerHTML = Locale.$STR("firebug.failedToPreviewImageURL");

            var innerBox = img.parentNode;
            Css.removeClass(innerBox, "infoTipLoading");
        }
    }),

    initializeBrowser: function(browser)
    {
        browser.onInfoTipMouseOut = Obj.bind(this.onMouseOut, this, browser);
        browser.onInfoTipMouseMove = Obj.bind(this.onMouseMove, this, browser);

        var doc = browser.contentDocument;
        if (!doc)
            return;

        doc.addEventListener("mouseover", browser.onInfoTipMouseMove, true);
        doc.addEventListener("mouseout", browser.onInfoTipMouseOut, true);
        doc.addEventListener("mousemove", browser.onInfoTipMouseMove, true);

        return browser.infoTip = this.tags.infoTipTag.append({}, Dom.getBody(doc));
    },

    uninitializeBrowser: function(browser)
    {
        if (browser.infoTip)
        {
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
        }
        else
        {
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
        }
        else
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

        return true;
    }
})};