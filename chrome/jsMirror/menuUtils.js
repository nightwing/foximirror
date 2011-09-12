var MenuUtils = {}
MenuUtils.createMenu = function(popup, label){
    var menu = popup.ownerDocument.createElement("menu");
    menu.setAttribute("label", label);

    var menuPopup = popup.ownerDocument.createElement("menupopup");

    popup.appendChild(menu);
    menu.appendChild(menuPopup);

    return menuPopup;
};

MenuUtils.createMenuItem = function(popup, item, before){
    if (typeof(item) == "string" && item.indexOf("-") == 0)
        return this.createMenuSeparator(popup, before);

    var menuitem = popup.ownerDocument.createElement("menuitem");

    this.setItemIntoElement(menuitem, item);

    if (before)
        popup.insertBefore(menuitem, before);
    else
        popup.appendChild(menuitem);

    return menuitem;
};

MenuUtils.setItemIntoElement = function(element, item){
    var label = item.label;

    element.setAttribute("label", label);

    if (item.id)
        element.setAttribute("id", item.id);

    if (item.type)
        element.setAttribute("type", item.type);

    // Avoid closing the popup menu if a preference has been changed.
    // This allows to quickly change more options.
    if (item.type == "checkbox")
        element.setAttribute("closemenu", "none");

    if (item.checked)
        element.setAttribute("checked", "true");

    if (item.disabled)
        element.setAttribute("disabled", "true");

    if (item.image){
        element.setAttribute("class", "menuitem-iconic");
        element.setAttribute("image", item.image);
    }

    if (item.command)
        element.addEventListener("command", item.command, false);
	else if (item.onclick)
        element.addEventListener("click", item.onclick, false);
	else if (item.commandID)
        element.setAttribute("command", item.commandID);

    if (item.option)
        element.setAttribute("option", item.option);

    if (item.tooltiptext) 
        element.setAttribute("tooltiptext", item.tooltiptext);

    if (item.className)
        element.className = item.className;

    if (item.acceltext)
        element.setAttribute("acceltext", item.acceltext);

    return element;
}

MenuUtils.createMenuHeader = function(popup, item){
    var header = popup.ownerDocument.createElement("label");
    header.setAttribute("class", "menuHeader");

    var label = item.label;

    header.setAttribute("value", label);

    popup.appendChild(header);
    return header;
};

MenuUtils.createMenuSeparator = function(popup, before){
    if (!popup.firstChild)
        return;

    var menuitem = popup.ownerDocument.createElement("menuseparator");
    if (before)
        popup.insertBefore(menuitem, before);
    else
        popup.appendChild(menuitem);
    return menuitem;
};

removeAllChildren = function(node){
    while (node.lastChild)
        node.removeChild(node.lastChild);
};

MenuUtils.onContextShowing = function(event){
	// xxxHonza: This context-menu support can be used even in separate window, which
	// doesn't contain the FBUI (panels).
	//if (!panelBar1.selectedPanel)
	//    return false;

	var popup = event.target;
	if (popup.id !="main-context")
		return;

	var target = document.popupNode;
	var p = target
	while(p && !p.ownerPanel)
		p = p.parentNode

	removeAllChildren(popup);
	
	p = (p && p.ownerPanel)||this
	if (p){
		var items = p.getContextMenuItems(null, target);
		if (items) {
			for (var i = 0; i < items.length; ++i)
				MenuUtils.createMenuItem(popup, items[i]);
		}
	}

	if (!popup.hasChildNodes())
		return false;
}

MenuUtils.getContextMenuItems = function(_, target) {
	var env = target.ownerDocument.defaultView.wrappedJSObject;
dump(target)
	var items = [],
		editor = env.editor,
		clipBoardText = gClipboardHelper.getData(),
		editorText = editor.getCopyText(),
		self = this;

	items.push(
		
		"-",
		{
			label: "copy",
			command: function() {
				gClipboardHelper.copyString(editorText);
			},
			disabled: !editorText
		},
		{
			label: "cut",
			command: function() {
				gClipboardHelper.copyString(editorText);
				editor.onCut();
			},
			disabled: !editorText
		},
		{
			label: "paste",
			command: function() {
				editor.onTextInput(clipBoardText);
			},
			disabled: !clipBoardText
		},
		"-"		
	);

	var sessionOwner;
	switch(editor.session.owner) {
		case 'console': sessionOwner = null; break;
	}
	sessionOwner && sessionOwner.addContextMenuItems(items, editor, editorText);

	return items;
}






/***********************************************************/
var gClipboardHelper = $shadia.clipboardHelper
/***********************************************************/