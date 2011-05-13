/* See license.txt for terms of usage */

// ************************************************************************************************
// Constants

// ************************************************************************************************
// Globals

var item;
var FBL;
var internalFilefieldTextbox;
var browseButton;

function getItemFromPref(){
	var a=getPref('extensions.shadia.editor')
	if(!a)
		item={}
	else{
		a=a.split(',')
		item={label:a[0], executable: a[1], cmdline: a[2]}
	}
	return item
}
function setItemToPref(){
	if(!item.executable)
		clearPref(prefName)
	else
		savePref('extensions.shadia.editor',[item.label,item.executable,item.cmdline].join())
}

function onLoad()
{
	getItemFromPref()
    browseButton = document.getElementById("browse-button");

	 if (item.label)
		document.getElementById("name").value = item.label;
    if (item.executable)
    {
        try
        {
            var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
            file.initWithPath(item.executable);
            document.getElementById("executable").file = file;
        }
        catch(exc) {}
    }

    if (item.cmdline)
        document.getElementById("cmdline").value = item.cmdline;

    onChange();

    if (document.getAnonymousElementByAttribute && !document.getElementById("executable").file)
    {
        setTimeout(function()
        {
            internalFilefieldTextbox = document.getAnonymousElementByAttribute(
                document.getElementById("executable"), "class", "fileFieldLabel");

            if (internalFilefieldTextbox)
            {
                internalFilefieldTextbox.readOnly = false;
                internalFilefieldTextbox.addEventListener("input", function(e) {
                    browseButton.disabled = (this.value != "");
                    onChange();
                }, false);
            }
        }, 100);
    }
	window.sizeToContent()
}

function onAccept()
{
    item.label = document.getElementById("name").value;
    if (!browseButton.disabled)
    {
        var file = document.getElementById("executable").file;
        item.executable = "";
        if (file)
            item.executable = file.path;
    }
    else
    {
        item.executable = internalFilefieldTextbox.value.replace(/^\s+|\s+$/g, '');
    }

    item.cmdline = document.getElementById("cmdline").value;
	
	setItemToPref()
 
}

function onChange()
{
    document.documentElement.getButton("accept").disabled = !(
        document.getElementById("name").value && (
            (browseButton.disabled && internalFilefieldTextbox &&
                internalFilefieldTextbox.value &&
                internalFilefieldTextbox.value.replace(/^\s+|\s+$/g, '')) ||
            (!browseButton.disabled && document.getElementById("executable").file)
        )
    );
}

function onBrowse()
{
    const Ci = Components.interfaces;
    const nsIFilePicker = Ci.nsIFilePicker;
    var picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    picker.init(window, "", nsIFilePicker.modeOpen);
    picker.appendFilters(nsIFilePicker.filterApps);

    if (picker.show() == nsIFilePicker.returnOK && picker.file)
    {
        var nameField = document.getElementById("name");
        var execField = document.getElementById("executable");
        execField.file = picker.file;

        if (internalFilefieldTextbox)
            internalFilefieldTextbox.readOnly = true;

        if (nameField.value == "")
            nameField.value = execField.file.leafName.replace(".exe","");

        onChange();
        return true;
    }

    return false;
}

function insertText(text, whole)
{
    var textbox = document.getElementById("cmdline")
    if(whole)
        textbox.select();

    textbox.editor.QueryInterface(Components.interfaces.nsIPlaintextEditor).insertText(text);
    textbox.focus()
}
// ************************************************************************************************

// would be good to have autosuggest for popular editors
var defaultCommandLines={
    "sublimetext": "%file:%line",
    "notepad++":   "-n%line %file",
    "emeditor":    "/l %line %file"
}

function suggestionPopupShowing(popup){
    while(popup.firstChild)
		popup.removeChild(popup.firstChild)

    for (var i in defaultCommandLines)
    {
        var box = document.createElement('hbox');
        var label = document.createElement('label');
        label.setAttribute('value', i + ': ');
        box.appendChild(label);

        label = document.createElement('label');
        label.setAttribute('value', defaultCommandLines[i]);
        label.className = 'text-link'
        box.appendChild(label);

        popup.appendChild(box)
    }

}