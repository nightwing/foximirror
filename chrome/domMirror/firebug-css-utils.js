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

Dom.getNextByClass = function(root, state){
    function iter(node) { return node.nodeType == 1 && Css.hasClass(node, state); }
    return Dom.findNext(root, iter);
};

Dom.getPreviousByClass = function(root, state){
    function iter(node) { return node.nodeType == 1 && Css.hasClass(node, state); }
    return Dom.findPrevious(root, iter);
};

Dom.findNextDown = function(node, criteria){
    if (!node)
        return null;

    for (var child = node.firstChild; child; child = child.nextSibling)    {
        if (criteria(child))
            return child;

        var next = Dom.findNextDown(child, criteria);
        if (next)
            return next;
    }
};

Dom.findPreviousUp = function(node, criteria){
    if (!node)
        return null;

    for (var child = node.lastChild; child; child = child.previousSibling){
        var next = Dom.findPreviousUp(child, criteria);
        if (next)
            return next;

        if (criteria(child))
            return child;
    }
};

Dom.findNext = function(node, criteria, upOnly, maxRoot){
    if (!node)
        return null;

    if (!upOnly)
    {
        var next = Dom.findNextDown(node, criteria);
        if (next)
            return next;
    }

    for (var sib = node.nextSibling; sib; sib = sib.nextSibling) {
        if (criteria(sib))
            return sib;

        var next = Dom.findNextDown(sib, criteria);
        if (next)
            return next;
    }

    if (node.parentNode && node.parentNode != maxRoot)
        return Dom.findNext(node.parentNode, criteria, true, maxRoot);
};

Dom.findPrevious = function(node, criteria, downOnly, maxRoot){
    if (!node)
        return null;

    for (var sib = node.previousSibling; sib; sib = sib.previousSibling) {
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
//****************************************************************************************
var Css = {};
var cssKeywordMap = {};
var cssPropNames = {};
var cssColorNames = null;
var imageRules = null;

Css.hasClass = function(node, cl){
	return node.classList.contains(cl)
}
Css.isColorKeyword = function(keyword){
    if (keyword == "transparent")
        return false;

    if (!cssColorNames)
    {
        cssColorNames = [];

        var colors = Css.cssKeywords["color"];
        for (var i = 0; i < colors.length; ++i)
            cssColorNames.push(colors[i].toLowerCase());

        var systemColors = Css.cssKeywords["systemColor"];
        for (var i = 0; i < systemColors.length; ++i)
            cssColorNames.push(systemColors[i].toLowerCase());
    }

    return cssColorNames.indexOf(keyword.toLowerCase()) != -1;
};

Css.isImageRule = function(nodeType,rule){
    if (!imageRules)
    {
        imageRules = [];

        for (var i in Css.cssInfo[nodeType])
        {
            var r = i.toLowerCase();
            var suffix = "image";
            if (r.match(suffix + "$") == suffix || r == "background")
                imageRules.push(r);
        }
    }

    return imageRules.indexOf(rule.toLowerCase()) != -1;
};


// ********************************************************************************************* //
// CSS Info

Css.cssInfo = {};
Css.cssInfo.html =
{
    "background": ["bgRepeat", "bgAttachment", "bgPosition", "color", "systemColor",
        "mozBackgroundImage", "none"],
    "background-attachment": ["bgAttachment"],
    "background-color": ["color", "systemColor"],
    "background-image": ["none", "mozBackgroundImage"],
    "background-position": ["bgPosition"],
    "background-repeat": ["bgRepeat"],
    "background-size": ["bgSize"],
    "background-clip": ["boxModels"], //FF4.0
    "background-origin": ["boxModels"], //FF4.0

    "border": ["borderStyle", "thickness", "color", "systemColor", "none"],
    "border-top": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "border-right": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "border-bottom": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "border-left": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "border-collapse": ["borderCollapse"],
    "border-color": ["color", "systemColor"],
    "border-top-color": ["color", "systemColor"],
    "border-right-color": ["color", "systemColor"],
    "border-bottom-color": ["color", "systemColor"],
    "border-left-color": ["color", "systemColor"],
    "border-spacing": [],
    "border-style": ["borderStyle"],
    "border-top-style": ["borderStyle"],
    "border-right-style": ["borderStyle"],
    "border-bottom-style": ["borderStyle"],
    "border-left-style": ["borderStyle"],
    "border-width": ["thickness"],
    "border-top-width": ["thickness"],
    "border-right-width": ["thickness"],
    "border-bottom-width": ["thickness"],
    "border-left-width": ["thickness"],
    "border-radius": [], //FF4.0
    "border-top-left-radius": [], //FF4.0
    "border-top-right-radius": [], //FF4.0
    "border-bottom-right-radius": [], //FF4.0
    "border-bottom-left-radius": [], //FF4.0

    "box-shadow": [], //FF4.0

    "bottom": ["auto"],
    "caption-side": ["captionSide"],
    "clear": ["clear", "none"],
    "clip": ["auto"],
    "color": ["color", "systemColor"],
    "content": ["content", "none"],
    "counter-increment": ["none"],
    "counter-reset": ["none"],
    "cursor": ["cursor", "none"],
    "direction": ["direction"],
    "display": ["display", "none"],
    "empty-cells": [],
    "float": ["float", "none"],
    "font": ["fontStyle", "fontVariant", "fontWeight", "fontFamily"],

    "font-family": ["fontFamily"],
    "font-size": ["fontSize"],
    "font-size-adjust": [],
    "font-stretch": [],
    "font-style": ["fontStyle"],
    "font-variant": ["fontVariant"],
    "font-weight": ["fontWeight"],

    "height": ["auto"],
    "ime-mode": ["imeMode", "auto"],
    "left": ["auto"],
    "letter-spacing": [],
    "line-height": [],

    "list-style": ["listStyleType", "listStylePosition", "none"],
    "list-style-image": ["none"],
    "list-style-position": ["listStylePosition"],
    "list-style-type": ["listStyleType", "none"],

    "margin": [],
    "margin-top": [],
    "margin-right": [],
    "margin-bottom": [],
    "margin-left": [],

    "marker-offset": ["auto"],
    "min-height": ["none"],
    "max-height": ["none"],
    "min-width": ["width", "none"],
    "max-width": ["width", "none"],

    "opacity": [],

    "outline": ["borderStyle", "color", "systemColor", "none"],
    "outline-color": ["color", "systemColor"],
    "outline-style": ["borderStyle"],
    "outline-width": [],

    "overflow": ["overflow", "auto"],
    "overflow-x": ["overflow", "auto"],
    "overflow-y": ["overflow", "auto"],

    "padding": [],
    "padding-top": [],
    "padding-right": [],
    "padding-bottom": [],
    "padding-left": [],

	"pointer-events": ["auto", "none"],
    "position": ["position"],
    "quotes": ["none"],
    "resize": ["resize"],//FF4.0
    "right": ["auto"],
    "table-layout": ["tableLayout", "auto"],
    "text-align": ["textAlign"],
    "text-decoration": ["textDecoration", "none"],
    "text-indent": [],
    "text-rendering": ["textRendering", "auto"],
    "text-shadow": [],
    "text-transform": ["textTransform", "none"],
    "top": ["auto"],
    "unicode-bidi": [],
    "vertical-align": ["verticalAlign"],
    "visibility": ["visibility"],
    "white-space": ["whiteSpace"],
    "width": ["width", "auto"],
    "word-spacing": [],
    "word-wrap": ["wordWrap"],
    "z-index": [],

    "-moz-appearance": ["mozAppearance"],
    "-moz-border-image": ["mozBorderImage", "thickness", "none"],
    "-moz-border-radius": [],
    "-moz-border-radius-bottomleft": [],
    "-moz-border-radius-bottomright": [],
    "-moz-border-radius-topleft": [],
    "-moz-border-radius-topright": [],
    "-moz-border-top-colors": ["color", "systemColor"],
    "-moz-border-right-colors": ["color", "systemColor"],
    "-moz-border-bottom-colors": ["color", "systemColor"],
    "-moz-border-left-colors": ["color", "systemColor"],
    "-moz-border-start": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "-moz-border-end": ["borderStyle", "borderCollapse", "color", "systemColor", "none"],
    "-moz-border-start-color": ["color", "systemColor"],
    "-moz-border-end-color": ["color", "systemColor"],
    "-moz-border-start-style": ["borderStyle"],
    "-moz-border-end-style": ["borderStyle"],
    "-moz-border-start-width": ["thickness"],
    "-moz-border-end-width": ["thickness"],
    "-moz-box-align": ["mozBoxAlign"],
    "-moz-box-direction": ["mozBoxDirection"],
    "-moz-box-flex": [],
    "-moz-box-ordinal-group": [],
    "-moz-box-orient": ["mozBoxOrient"],
    "-moz-box-pack": ["mozBoxPack"],
    "-moz-box-shadow": ["mozBoxShadow", "none"],
    "-moz-box-sizing": ["mozBoxSizing"],
    "-moz-user-focus": ["userFocus", "none"],
    "-moz-user-input": ["userInput"],
    "-moz-user-modify": [],
    "-moz-user-select": ["userSelect", "none"],
    //"-moz-background-clip": [], //Removed/renamed in FF4.0
    "-moz-background-inline-policy": [],
    //"-moz-background-origin": [], //Removed/renamed in FF4.0
    "-moz-binding": [],
    "-moz-column-count": [],
    "-moz-column-gap": [],
    "-moz-column-rule": ["thickness", "borderStyle", "color", "systemColor"],
    "-moz-column-rule-width": ["thickness"],
    "-moz-column-rule-style": ["borderStyle"],
    "-moz-column-rule-color": ["color",  "systemColor"],
    "-moz-column-width": [],
    "-moz-image-region": [],
    "-moz-transform": ["mozTransformFunction", "none"],
    "-moz-transform-origin": ["bgPosition"],
    "-moz-font-feature-settings": ["normal"], //FF4.0
    "-moz-tab-size": [], //FF4.0,
    "-moz-transition": [], //FF4.0 TODO
    "-moz-transition-property": ["mozTransitionProperty"], //FF4.0 TODO
    "-moz-transition-duration": [], //FF4.0 TODO
    "-moz-transition-timing-function": ["mozTransitionTimingFunction"], //FF4.0 TODO
    "-moz-transition-delay": [], //FF4.0 TODO
    "-moz-animation":[], // FF5.0
    "-moz-animation-delay": [], // FF5.0
    "-moz-animation-direction": [], // FF5.0
    "-moz-animation-duration": [], // FF5.0
    "-moz-animation-iteration-count": [], // FF5.0
    "-moz-animation-name" : [], // FF5.0
    "-moz-animation-play-state": [], // FF5.0
    "-moz-animation-timing-function": [], // FF5.0
    "-moz-animation-fill-mode": [], // FF5.0
    "-moz-orient": [], //FF6.0 TODO
    "-moz-text-decoration-color": ["color"], //FF6.0 TODO
    "-moz-text-decoration-line": [], //FF6.0 TODO
    "-moz-text-decoration-style": [], //FF6.0 TODO
    "-moz-hyphens": [], //FF6.0 TODO
    "text-overflow": ["ellipsis","clip"] //FF7.0

};

// ::-moz-progress-bar  // FF6 TODO

Css.inheritedStyleNames =
{
    "border-collapse": 1,
    "border-spacing": 1,
    "border-style": 1,
    "caption-side": 1,
    "color": 1,
    "cursor": 1,
    "direction": 1,
    "empty-cells": 1,
    "font": 1,
    "font-family": 1,
    "font-size-adjust": 1,
    "font-size": 1,
    "font-style": 1,
    "font-variant": 1,
    "font-weight": 1,
    "letter-spacing": 1,
    "line-height": 1,
    "list-style": 1,
    "list-style-image": 1,
    "list-style-position": 1,
    "list-style-type": 1,
    "opacity": 1,
    "quotes": 1,
    "text-align": 1,
    "text-decoration": 1,
    "text-indent": 1,
    "text-shadow": 1,
    "text-transform": 1,
    "white-space": 1,
    "word-spacing": 1,
    "word-wrap": 1
};

Css.cssKeywords =
{
    "mozAppearance":
    [
        "button",
        "button-small",
        "checkbox",
        "checkbox-container",
        "checkbox-small",
        "dialog",
        "listbox",
        "menuitem",
        "menulist",
        "menulist-button",
        "menulist-textfield",
        "menupopup",
        "progressbar",
        "radio",
        "radio-container",
        "radio-small",
        "resizer",
        "scrollbar",
        "scrollbarbutton-down",
        "scrollbarbutton-left",
        "scrollbarbutton-right",
        "scrollbarbutton-up",
        "scrollbartrack-horizontal",
        "scrollbartrack-vertical",
        "separator",
        "statusbar",
        "tab",
        "tab-left-edge",
        "tabpanels",
        "textfield",
        "toolbar",
        "toolbarbutton",
        "toolbox",
        "tooltip",
        "treeheadercell",
        "treeheadersortarrow",
        "treeitem",
        "treetwisty",
        "treetwistyopen",
        "treeview",
        "window",
        "-moz-mac-unified-toolbar", //FF3.5
        "-moz-win-borderless-glass", //FF4.0
        "-moz-win-browsertabbar-toolbox", //FF3.0
        "-moz-win-communications-toolbox", //FF3.0
        "-moz-win-glass", //FF3.5
        "-moz-win-media-toolbox" //FF
    ],

    "systemColor":
    [
        "ActiveBorder",
        "ActiveCaption",
        "AppWorkspace",
        "Background",
        "ButtonFace",
        "ButtonHighlight",
        "ButtonShadow",
        "ButtonText",
        "CaptionText",
        "GrayText",
        "Highlight",
        "HighlightText",
        "InactiveBorder",
        "InactiveCaption",
        "InactiveCaptionText",
        "InfoBackground",
        "InfoText",
        "Menu",
        "MenuText",
        "Scrollbar",
        "ThreeDDarkShadow",
        "ThreeDFace",
        "ThreeDHighlight",
        "ThreeDLightShadow",
        "ThreeDShadow",
        "Window",
        "WindowFrame",
        "WindowText",
        "-moz-field",
        "-moz-fieldtext",
        "-moz-workspace",
        "-moz-visitedhyperlinktext",
        "-moz-nativehyperlinktext",
        "-moz-use-text-color"
    ],

    "color":
    [
        "AliceBlue",
        "AntiqueWhite",
        "Aqua",
        "Aquamarine",
        "Azure",
        "Beige",
        "Bisque",
        "Black",
        "BlanchedAlmond",
        "Blue",
        "BlueViolet",
        "Brown",
        "BurlyWood",
        "CadetBlue",
        "Chartreuse",
        "Chocolate",
        "Coral",
        "CornflowerBlue",
        "Cornsilk",
        "Crimson",
        "Cyan",
        "DarkBlue",
        "DarkCyan",
        "DarkGoldenRod",
        "DarkGray",
        "DarkGreen",
        "DarkGrey",
        "DarkKhaki",
        "DarkMagenta",
        "DarkOliveGreen",
        "DarkOrange",
        "DarkOrchid",
        "DarkRed",
        "DarkSalmon",
        "DarkSeaGreen",
        "DarkSlateBlue",
        "DarkSlateGray",
        "DarkSlateGrey",
        "DarkTurquoise",
        "DarkViolet",
        "DeepPink",
        "DeepSkyBlue",
        "DimGray",
        "DimGrey",
        "DodgerBlue",
        "FireBrick",
        "FloralWhite",
        "ForestGreen",
        "Fuchsia",
        "Gainsboro",
        "GhostWhite",
        "Gold",
        "GoldenRod",
        "Gray",
        "Green",
        "GreenYellow",
        "Grey",
        "HoneyDew",
        "HotPink",
        "IndianRed",
        "Indigo",
        "Ivory",
        "Khaki",
        "Lavender",
        "LavenderBlush",
        "LawnGreen",
        "LemonChiffon",
        "LightBlue",
        "LightCoral",
        "LightCyan",
        "LightGoldenRodYellow",
        "LightGray",
        "LightGreen",
        "LightGrey",
        "LightPink",
        "LightSalmon",
        "LightSeaGreen",
        "LightSkyBlue",
        "LightSlateGray",
        "LightSlateGrey",
        "LightSteelBlue",
        "LightYellow",
        "Lime",
        "LimeGreen",
        "Linen",
        "Magenta",
        "Maroon",
        "MediumAquaMarine",
        "MediumBlue",
        "MediumOrchid",
        "MediumPurple",
        "MediumSeaGreen",
        "MediumSlateBlue",
        "MediumSpringGreen",
        "MediumTurquoise",
        "MediumVioletRed",
        "MidnightBlue",
        "MintCream",
        "MistyRose",
        "Moccasin",
        "NavajoWhite",
        "Navy",
        "OldLace",
        "Olive",
        "OliveDrab",
        "Orange",
        "OrangeRed",
        "Orchid",
        "PaleGoldenRod",
        "PaleGreen",
        "PaleTurquoise",
        "PaleVioletRed",
        "PapayaWhip",
        "PeachPuff",
        "Peru",
        "Pink",
        "Plum",
        "PowderBlue",
        "Purple",
        "Red",
        "RosyBrown",
        "RoyalBlue",
        "SaddleBrown",
        "Salmon",
        "SandyBrown",
        "SeaGreen",
        "SeaShell",
        "Sienna",
        "Silver",
        "SkyBlue",
        "SlateBlue",
        "SlateGray",
        "SlateGrey",
        "Snow",
        "SpringGreen",
        "SteelBlue",
        "Tan",
        "Teal",
        "Thistle",
        "Tomato",
        "Turquoise",
        "Violet",
        "Wheat",
        "White",
        "WhiteSmoke",
        "Yellow",
        "YellowGreen",
        "transparent",
        "invert"
    ],

    "auto":
    [
        "auto"
    ],

    "none":
    [
        "none"
    ],

    "normal":
    [
        "normal"
    ],

    "captionSide":
    [
        "top",
        "bottom",
        "left",
        "right"
    ],

    "clear":
    [
        "left",
        "right",
        "both"
    ],

    "cursor":
    [
        "auto",
        "cell",
        "context-menu",
        "crosshair",
        "default",
        "help",
        "pointer",
        "progress",
        "move",
        "e-resize",
        "all-scroll",
        "ne-resize",
        "nw-resize",
        "n-resize",
        "se-resize",
        "sw-resize",
        "s-resize",
        "w-resize",
        "ew-resize",
        "ns-resize",
        "nesw-resize",
        "nwse-resize",
        "col-resize",
        "row-resize",
        "text",
        "vertical-text",
        "wait",
        "alias",
        "copy",
        "move",
        "no-drop",
        "not-allowed",
        "-moz-alias",
        "-moz-cell",
        "-moz-copy",
        "-moz-grab",
        "-moz-grabbing",
        "-moz-contextmenu",
        "-moz-zoom-in",
        "-moz-zoom-out",
        "-moz-spinning"
    ],

    "boxModels": //FF4.0
    [
        "padding-box",
        "border-box",
        "content-box"
    ],

    "direction":
    [
        "ltr",
        "rtl"
    ],

    "bgAttachment":
    [
        "scroll",
        "fixed"
    ],

    "bgPosition":
    [
        "top",
        "center",
        "bottom",
        "left",
        "right"
    ],

    "bgRepeat":
    [
        "repeat",
        "repeat-x",
        "repeat-y",
        "no-repeat"
    ],

    "bgSize": // FF4.0
    [
        "auto",
        "cover",
        "contain"
    ],

    "borderStyle":
    [
        "hidden",
        "dotted",
        "dashed",
        "solid",
        "double",
        "groove",
        "ridge",
        "inset",
        "outset",
        "-moz-bg-inset",
        "-moz-bg-outset",
        "-moz-bg-solid"
    ],

    "borderCollapse":
    [
        "collapse",
        "separate"
    ],

    "overflow":
    [
        "visible",
        "hidden",
        "scroll",
        "-moz-scrollbars-horizontal",
        "-moz-scrollbars-none",
        "-moz-scrollbars-vertical"
    ],

    "listStyleType":
    [
        "disc",
        "circle",
        "square",
        "decimal",
        "decimal-leading-zero",
        "lower-roman",
        "upper-roman",
        "lower-greek",
        "lower-alpha",
        "lower-latin",
        "upper-alpha",
        "upper-latin",
        "hebrew",
        "armenian",
        "georgian",
        "cjk-ideographic",
        "hiragana",
        "katakana",
        "hiragana-iroha",
        "katakana-iroha",
        "inherit"
    ],

    "listStylePosition":
    [
        "inside",
        "outside"
    ],

    "content":
    [
        "open-quote",
        "close-quote",
        "no-open-quote",
        "no-close-quote",
        "inherit"
    ],

    "fontStyle":
    [
        "normal",
        "italic",
        "oblique",
        "inherit"
    ],

    "fontVariant":
    [
        "normal",
        "small-caps",
        "inherit"
    ],

    "fontWeight":
    [
        "normal",
        "bold",
        "bolder",
        "lighter",
        "inherit"
    ],

    "fontSize":
    [
        "xx-small",
        "x-small",
        "small",
        "medium",
        "large",
        "x-large",
        "xx-large",
        "smaller",
        "larger"
    ],

    "fontFamily":
    [
        "Arial",
        "Comic Sans MS",
        "Georgia",
        "Tahoma",
        "Verdana",
        "Times New Roman",
        "Trebuchet MS",
        "Lucida Grande",
        "Helvetica",
        "serif",
        "sans-serif",
        "cursive",
        "fantasy",
        "monospace",
        "caption",
        "icon",
        "menu",
        "message-box",
        "small-caption",
        "status-bar",
        "inherit"
    ],

    "display":
    [
        "block",
        "inline",
        "inline-block",
        "list-item",
        "marker",
        "run-in",
        "compact",
        "table",
        "inline-table",
        "table-row-group",
        "table-column",
        "table-column-group",
        "table-header-group",
        "table-footer-group",
        "table-row",
        "table-cell",
        "table-caption",
        "-moz-box",
        "-moz-compact",
        "-moz-deck",
        "-moz-grid",
        "-moz-grid-group",
        "-moz-grid-line",
        "-moz-groupbox",
        "-moz-inline-block",
        "-moz-inline-box",
        "-moz-inline-grid",
        "-moz-inline-stack",
        "-moz-inline-table",
        "-moz-marker",
        "-moz-popup",
        "-moz-runin",
        "-moz-stack"
    ],

    "position":
    [
        "static",
        "relative",
        "absolute",
        "fixed",
        "inherit"
    ],

    "float":
    [
        "left",
        "right"
    ],

    "textAlign":
    [
        "left",
        "right",
        "center",
        "justify"
    ],

    "tableLayout":
    [
        "fixed"
    ],

    "textDecoration":
    [
        "underline",
        "overline",
        "line-through",
        "blink"
    ],

    "textTransform":
    [
        "capitalize",
        "lowercase",
        "uppercase",
        "inherit"
    ],

    "unicodeBidi":
    [
        "normal",
        "embed",
        "bidi-override"
    ],

    "visibility":
    [
        "visible",
        "hidden",
        "collapse",
        "inherit"
    ],

    "whiteSpace":
    [
        "normal",
        "pre",
        "nowrap",
        "pre-wrap",
        "pre-line",
        "inherit"
    ],

    "verticalAlign":
    [
        "baseline",
        "sub",
        "super",
        "top",
        "text-top",
        "middle",
        "bottom",
        "text-bottom",
        "inherit"
    ],

    "thickness":
    [
        "thin",
        "medium",
        "thick"
    ],

    "userFocus":
    [
        "ignore",
        "normal"
    ],

    "userInput":
    [
        "disabled",
        "enabled"
    ],

    "userSelect":
    [
        "normal"
    ],

    "mozBoxSizing":
    [
        "content-box",
        "padding-box",
        "border-box"
    ],

    "mozBoxAlign":
    [
        "start",
        "center",
        "end",
        "baseline",
        "stretch"
    ],

    "mozBoxDirection":
    [
        "normal",
        "reverse"
    ],

    "mozBoxOrient":
    [
        "horizontal",
        "vertical"
    ],

    "mozBoxPack":
    [
        "start",
        "center",
        "end"
    ],

    "mozBoxShadow":
    [
        "inset"
    ],

    "mozBorderImage":
    [
        "stretch",
        "round",
        "repeat"
    ],

    "mozBackgroundImage":
    [
        "-moz-linear-gradient", // FF4.0
        "-moz-radial-gradient", // FF4.0
        "-moz-element", // FF4.0
        "-moz-image-rect" // FF4.0
    ],

    "mozTransformFunction":
    [
        "matrix",
        "rotate",
        "scale",
        "scaleX",
        "scaleY",
        "skew",
        "skewX",
        "skewY",
        "translate",
        "translateX",
        "translateY"
    ],

    "mozTransitionProperty":
    [
        "background-color",
        "background-image",
        "background-position",
        "background-size",
        "border-color",
        "border-radius",
        "border-width",
        "border-spacing",
        "bottom",
        "box-shadow",
        "color",
        "clip",
        "fill",
        "fill-opacity",
        "flood-color",
        "font-size",
        "font-size-adjust",
        "font-stretch",
        "font-weight",
        "height",
        "left",
        "letter-spacing",
        "lighting-color",
        "line-height",
        "margin ",
        "marker-offset",
        "max-height",
        "max-width",
        "min-height",
        "min-width",
        "opacity",
        "outline-color",
        "outline-offset",
        "outline-width",
        "padding",
        "right",
        "stop-color",
        "stop-opacity",
        "stroke",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-miterlimit",
        "stroke-opacity",
        "stroke-width",
        "text-indent",
        "text-shadow",
        "top",
        "vertical-align",
        "visibility",
        "width",
        "word-spacing",
        "z-index",
        "-moz-box-flex",
        "-moz-column-count",
        "-moz-column-gap",
        "-moz-column-rule-color",
        "-moz-column-rule-width",
        "-moz-column-width",
        "-moz-image-region",
        "-moz-outline-radius",
        "-moz-transform-origin",
        "-moz-transform"
    ],

    "mozTransitionTimingFunction":
    [
       "cubic-bezier",
       "ease",
       "ease-in",
       "ease-in-out",
       "ease-out",
       "linear"
    ],

    "width":
    [
        "-moz-max-content",
        "-moz-min-content",
        "-moz-fit-content",
        "-moz-available"
    ],

    "imeMode":
    [
        "normal",
        "active",
        "inactive",
        "disabled"
    ],

    "textRendering":
    [
        "optimizeSpeed",
        "optimizeLegibility",
        "geometricPrecision"
    ],

    "wordWrap":
    [
        "normal",
        "break-word",
        "inherit"
    ],

    // start SVG specific

    "alignmentBaseline":
    [
        "auto",
        "baseline",
        "before-edge",
        "text-before-edge",
        "middle",
        "central",
        "after-edge",
        "text-after-edge",
        "ideographic",
        "alphabetic",
        "hanging",
        "mathematical"
    ],

    "baselineShift":
    [
        "baseline",
        "sub",
        "super"
    ],

    "colorInterpolation":
    [
        "auto",
        "sRGB",
        "linearRGB"
    ],

    "clipRule":
    [
        "nonzero",
        "evenodd"
    ],

    "colorProfile":
    [
        "auto",
        "sRGB"
    ],

    "colorRendering":
    [
        "auto",
        "optimizeSpeed",
        "optimizeQuality"
    ],

    "dominantBaseline":
    [
        "auto",
        "use-script",
        "no-change",
        "reset-size",
        "ideographic",
        "alphabetic",
        "hanging",
        "mathematical",
        "central",
        "middle",
        "text-after-edge",
        "text-before-edge"
    ],

    "accumulate":
    [
        "accumulate"
    ],

    "fontStretch":
    [
        "normal",
        "wider",
        "narrower",
        "ultra-condensed",
        "extra-condensed",
        "condensed",
        "semi-condensed",
        "semi-expanded",
        "expanded",
        "extra-expanded",
        "ultra-expanded"
    ],

    "imageRendering":
    [
        "auto",
        "optimizeSpeed",
        "optimizeQuality"
    ],

    "svgOverflow":
    [
        "visible",
        "hidden",
        "scroll"
    ],

    "pointerEvents":
    [
        "visiblePainted",
        "visibleFill",
        "visibleStroke",
        "visible",
        "painted",
        "fill",
        "stroke",
        "all"
    ],

    "shapeRendering":
    [
        "optimizeSpeed",
        "crispEdges",
        "geometricPrecision"
    ],

    "strokeLinecap":
    [
        "butt",
        "round",
        "square"
    ],

    "strokeLinejoin":
    [
        "miter",
        "round",
        "bevel"
    ],

    "writingMode":
    [
        "lr-tb",
        "rl-tb",
        "tb-rl",
        "lr",
        "rl",
        "tb"
    ],

    "resize":
    [
        "none",
        "both",
        "horizontal",
        "vertical",
        "inherit"
    ]
};



//************************************************************************************************

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
function parseURLValue(value){
    var m = reURL.exec(value);
    return m ? m[1] : "";
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


    initialize: function(browser) {
		if(this.node)
			return this.node
       // browser.onInfoTipMouseOut = Obj.bind(this.onMouseOut, this, browser);
        //browser.onInfoTipMouseMove = Obj.bind(this.onMouseMove, this, browser);

       var doc = document;
       // if (!doc)
        //    return;

       // doc.addEventListener("mouseover", browser.onInfoTipMouseMove, true);
       // doc.addEventListener("mouseout", browser.onInfoTipMouseOut, true);
       window.addEventListener("mousemove", this, true);

		var div = doc.createElement('div')
		div.className = 'infoTip'		
        return this.node = Dom.getBody(doc).appendChild(div)
		
		this.hidden = true
    },
	handleEvent: function(e){
		this.move(e.clientX, e.clientY)
	},

    uninitialize: function(browser) {
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
	show: function(){
		this.hidden = false
		this.node.setAttribute("active", "true");
	},
    move: function(x, y){
		if(this.hidden)
			return
		var infoTip = this.node

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

		
    },

    hide: function(){
		this.hidden = true
        this.node.removeAttribute("active");
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

	mouseover:function(e){
		clearTimeout(this.mouseoverTimeout)
		this.mouseoverTimeout=setTimeout(slateViewer.overNode,100, e.target, e.rangeParent, e.rangeParent)
	},
	overNode:function(target, rangeOffset, rangeParent){
		var node=target
		if(node.nodeName){
			var i=getSlatePosition(node)
			
			if(i){
				//dump('infotip', i.id, i.slateId, currentRules[i.slateId]&&currentRules[i.slateId].parentStyleSheet.href)
				

				//content.InfoTip.populateImageInfoTip("https://ftp.mozilla.org/favicon.ico")

				var InfoTip = content.InfoTip
				//var propValue = content.Dom.getAncestorByClass(target, "val");
				//dump(propValue)
				//if (!propValue) 
				//	return 
				var text = node.textContent;
				var cssValue = content.parseCSSValue(text, rangeOffset);
				if (!cssValue || cssValue.value == this.infoTipValue)
					return true;

				this.infoTipValue = cssValue.value;

				if (cssValue.type == "rgb" || cssValue.type == "hsl" || cssValue.type == "gradient" ||
					(!cssValue.type && content.Css.isColorKeyword(cssValue.value)))
				{
					this.infoTipType = "color";
					this.infoTipObject = cssValue.value;

					InfoTip.populateColorInfoTip(cssValue.value);
					InfoTip.show()
				} else if (cssValue.type == "url") {
					var propNameNode = target.parentNode.getElementsByClassName("name").item(0);
					if (propNameNode && propNameNode.textContent) {
						/*var rule = currentRules[i.slateId]
						var baseURL = this.getStylesheetURL(rule, true);*/
						var relURL = content.parseURLValue(cssValue.value);
						/*var absURL = Url.isDataURL(relURL) ? relURL : Url.absoluteURL(relURL, baseURL);
						var repeat = parseRepeatValue(text);

						this.infoTipType = "image";
						this.infoTipObject = absURL;*/
dump(cssValue.value)
						InfoTip.populateImageInfoTip(relURL, true);
					}
				}
				InfoTip.show()
				return 
			}
			content.InfoTip.hide()
		}
	},
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

    populateColorInfoTip: function(color){
        this.node.innerHTML = '<div class="infoTipColorBox" style="background:'+ color +';width: 100px; height: 40px;"><div>'
        return true;
    },
    populateImageInfoTip: function(url, repeat){
        if (!repeat)
            repeat = "no-repeat";

		this.node.innerHTML = '<div class="infoTipImageBox infoTipLoading">'+
			'<img class="infoTipImage" repeat="'+repeat+'" src="'+url+'"'+ 
			'onload="InfoTip.onLoadImage(event)" onerror="InfoTip.onErrorImage(event)"></img>'+
			'<img class="infoTipBgImage" collapsed="true" src="blank.gif"></img>'+		
			'<div class="infoTipCaption"/>'+
		'</div>'
        return true;
    }
}


showCSSInfotip = function(target, rangeOffset){
	var propValue = Dom.getAncestorByClass(target, "val");
	if (propValue) {
		var text = propValue.textContent;
		var cssValue = parseCSSValue(text, rangeOffset);
		if (cssValue) {
			if (cssValue.value == this.infoTipValue)
				return true;

			this.infoTipValue = cssValue.value;

			if (cssValue.type == "rgb" || cssValue.type == "hsl" || cssValue.type == "gradient" ||
				(!cssValue.type && Css.isColorKeyword(cssValue.value)))
			{
				this.infoTipType = "color";
				this.infoTipObject = cssValue.value;

				return InfoTip.populateColorInfoTip(cssValue.value);
			}
			else if (cssValue.type == "url") {
				var propNameNode = target.parentNode.getElementsByClassName("name").item(0);
				if (propNameNode && propNameNode.textContent) {
					var baseURL = this.getStylesheetURL(rule, true);
					var relURL = parseURLValue(cssValue.value);
					var absURL = Url.isDataURL(relURL) ? relURL : Url.absoluteURL(relURL, baseURL);
					var repeat = parseRepeatValue(text);

					this.infoTipType = "image";
					this.infoTipObject = absURL;

					return Firebug.InfoTip.populateImageInfoTip(absURL, repeat);
				}
			}
		}
	}
}