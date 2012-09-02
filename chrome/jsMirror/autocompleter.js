// ************************************************************************************************

/*****************************************************************
 *  code completion utils
 *****************************************************************/


/**************************************/
Firebug.Ace.startAutocompleter = FBL.bind(function(editor) {
    var type = editor.session.autocompletionType || editor.session.extension;

    if (type == 'console')
       this.autocompleter = this.JSAutocompleter;
    else if (type == 'js')
        this.autocompleter = this.JSAutocompleter;
    else if (type == 'css')
        this.autocompleter = this.CSSAutocompleter;
    else
        return;

    this.autocompleter.start(editor);
}, Firebug.Ace);

Firebug.Ace.BaseAutocompleter = {
    initPanel: function(panelH, panelW) {
        this.panel = $("autocomplatePanel");
        //this.panel.height = panelH;
        //this.panel.width = panelW;
        this.tree = this.panel.querySelector('tree');
        this.number = this.panel.querySelector('label');

        this.bubble = document.getElementById("autocomplate-info-bubble");
        this.bubble.width = 1.7*panelW;
        //set handlers
        this.panel.setAttribute('onpopupshown', 'if(event.target==this)Firebug.Ace.autocompleter.setView(0)');
        this.panel.setAttribute('onpopuphidden', 'if(event.target==this)Firebug.Ace.autocompleter.finish()');
        this.tree.setAttribute('ondblclick', 'Firebug.Ace.autocompleter.insertSuggestedText();Firebug.Ace.autocompleter.finish()');
        this.tree.setAttribute('onclick', 'Firebug.Ace.autocompleter.editor.focus()');
        this.tree.setAttribute('onselect', 'Firebug.Ace.autocompleter.onSelect()');


        //this.panel.getElementsByTagName('toolbarbutton')[0].setAttribute('oncommand', 'Firebug.Ace.autocompleter.compare()');
    },

    showPanel: function() {
        this.hidden = false;
        var panelH = 250, panelW = 200;

        if (!this.panel) //get domNodes
            this.initPanel(panelH, panelW);

        var editor = this.editor;
        var win = editor.container.ownerDocument.defaultView;
        var innerPos = editor.renderer.textToScreenCoordinates(editor.getCursorPosition());
        var posX = innerPos.pageX + win.mozInnerScreenX;
        var posY = innerPos.pageY + win.mozInnerScreenY;
        var maxX = window.screen.width;
        var minX = window.screen.left;
        var maxY = window.screen.height-50;

        if (panelH + posY > maxY)
            posY -= panelH + 5;
        else
            posY += 20;
dump(posX, posY)
        if (this.panel.state === 'open') {
            this.setView(0);
            this.panel.moveTo(posX, posY);
        } else {
            this.panel.showPopup(null, posX, posY, "popup");
        }

        // add editor handlers
        this.editor.setKeyboardHandler(this.editor.autocompletionKeySet);
        if (!this.editor.autocompleteCommandsAdded)
            this.addComandsToEditor();
        if (!this.selectionListener)
            this.selectionListener = FBL.bind(this.$selectionListener, this);

        for each(var i in this.$markers)
            this.editor.session.removeMarker(i)
        this.$markers = [
            editor.session.addMarker(this.$q.filterRange, "ace_bracket k"),
            editor.session.addMarker(this.$q.baseRange, "ace_bracket k")
        ];

        this.editor.selection.on('changeCursor', this.selectionListener);

        var bubbleX = posX - minX > maxX - posX -panelW ? minX + 10 : maxX - panelW * 1.5 - 10;
        this.bubblePos = {
            w: panelW * 2.7,
            h: panelH * 1.5,
            l: bubbleX,
            t: posY
        };
        //this.bubble.height = this.bubblePos.h;
        //this.bubble.width = this.bubblePos.w;
        
        // make global
        autocompleter = this
    },

    $selectionListener: function(e) {
        if (!this.editor){
            dump.trace("asdasdasd")
            this.finish()
        }

        var point = this.editor.selection.getCursor();
        var range = this.$q.filterRange
        if(range.compare(point.row, point.column) < 0 || this.hidden)
            return this.finish();

        range.end = point;
        this.text = this.editor.session.getTextRange(range);

        if (this.invalidCharRe.test(this.text))
            return this.finish();
        if (this.chainRe && this.chainRe.test(this.text))
            return this.chain();

        this.filter(this.unfilteredArray, this.text);
        this.setView(0);
    },

    addComandsToEditor: function() {
        var self = this;
        this.editor.addCommands({
            nextEntry: function() {
                self.moveTreeSelection(1);
            },

            previousEntry: function() {
                self.moveTreeSelection(-1);
            },

            dotComplete: function() {
                var o = self.sortedArray[self.tree.currentIndex];
                if (o && self.chain) {
                    self.insertSuggestedText('.');
                    self.chain(o.object);
                }
            },

            complete: function() {
                self.insertSuggestedText();
                self.finish();
            },

            completeAndReplace: function() {
                self.insertSuggestedText('', true);
                self.finish();
            },

            cancelCompletion: function() {
                self.finish();
            }
        });

        this.editor.autocompleteCommandsAdded = true;
    },

    onSelect: function(immediate) {
        if (!immediate) {
            if (this.onSelectTimeOut)
                clearTimeout(this.onSelectTimeOut);
            var self = this;
            this.onSelectTimeOut = setTimeout(function() {self.onSelect(true);},10);
            return;
        }
        /**     doOnselect  **/
        this.onSelectTimeOut = null;

        try {
            var index = this.tree.currentIndex;

            if(this.sortedArray){
                this.selectedObject = this.sortedArray[index]
                this.number.value = index + ':' +this.sortedArray.length + "/" + this.unfilteredArray.length;
            }else{
                index = -1
                this.selectedObject = {object:this.object}
                this.number.value = ''
            }
            
            var hint = this.getHint(index);
            this.sayInBubble(hint);
            
        } catch(e) {Cu.reportError(e)}

    },

    sayInBubble: function(text) {
        if (!this.bubble)
            this.initPanel()
        /* if (!text) {
            this.bubble.hidePopup();
            return;
        } */
        //if (this.hidden)
        //    return;
        var item = this.bubble//.firstChild;
        item.value = text;
    },

    setView: function(si) {
        if (typeof si !== "number")
            si = this.tree.currentIndex;
        this.tree.view = new treeView(this.sortedArray);
        this.tree.view.selection.select(si);
        this.tree.treeBoxObject.ensureRowIsVisible(si);
        this.number.value = si + ':' + this.sortedArray.length + "/" + this.unfilteredArray.length;
    },

    moveTreeSelectionLong: function(to) {
        var c;
        var tree = this.tree;
        var view = tree.view;

        switch(to) {
            case "end":
                c = view.rowCount - 1;
            break;
            case "top":
                c = 0;
            break;
            case "pup":
                c = view.rowCount - 1;
                break;
            default:
                return;
        }
        view.selection.timedSelect(c, tree._selectDelay);
        tree.treeBoxObject.ensureRowIsVisible(c); //(c>0?c:0)
    },

    moveTreeSelection: function(direction) {
        var tree = this.tree;
        var view = tree.view;
        var c = view.selection.currentIndex;

        c += direction;
        if (c >= view.rowCount)
            c = -1;
        if (c < -1)
            c = view.rowCount - 1;
        view.selection.timedSelect(c, tree._selectDelay);

        if (c >= 0)
            tree.treeBoxObject.ensureRowIsVisible(c);
        else if (direction > 0)
            tree.treeBoxObject.ensureRowIsVisible(0);
        else
            tree.treeBoxObject.ensureRowIsVisible(view.rowCount - 1);
    },

    filter: function(data, text) {
        var table = [];
        if (!text) {
            data.forEach(function(val) {
                table.push(val);
            });
            table.sort();
            this.sortedArray = table;
            return;
        }
        var filterText = text.toLowerCase();
        var filterTextCase = this.text;

        //*******/
        function springyIndex(val) {
            var lowVal = val.comName;
            var priority = 0;
            var lastI = 0;
            var ind1 = 0;
            if (val.name.indexOf(filterTextCase) === 0) {
                val.priority = -2;
                table.push(val);
                return;//exact match
            }
            for(var j = 0, ftLen = filterText.length; j < ftLen; j++) {
                lastI = lowVal.indexOf(filterText[j],ind1);
                if (lastI === -1)
                    break; //doesn't match
                priority += lastI - ind1;
                ind1 = lastI+1;
            }
            if (lastI != -1) {
                val.priority = priority;
                table.push(val);
            }
        }

        var sortVals = ["priority", "depth", "comName"];

        data.forEach(springyIndex);
        table.sort(function (a, b) {
            if (!a.isSpecial && b.isSpecial)
                return 1;
            if (a.isSpecial && !b.isSpecial)
                return -1;
            for each(var i in sortVals) {
              if (a[i] < b[i])
                  return -1;
              if (a[i] > b[i])
                  return 1;
            }
            return 0;
        });
        this.sortedArray = table;
    },

    finish: function(i) {
    dump("--------------------------------------------------")
        if (this.hidden)
            return;
        for each(var i in this.$markers)
            this.editor.session.removeMarker(i)

        this.hidden = true;
        this.editor.selection.removeEventListener('changeCursor', this.selectionListener);
        this.text = this.sortedArray = this.unfilteredArray = this.object = this.text = null;
        this.editor.setKeyboardHandler(this.editor.normalKeySet);
        this.panel.hidePopup();
        //this.bubble.hidePopup();
    },

};

Firebug.Ace.JSAutocompleter = FBL.extend(Firebug.Ace.BaseAutocompleter, {
    invalidCharRe: /[\+\-;:,= \(\)\[\]\{\}\!><]/,
    chainRe: /\.$/,
    chain: function(o) {
        var t = this.text.slice(0, -1)
        var o = o || this.object[t]
        if (!o)
            return this.finish()

        var br = this.$q.baseRange
        var fr = this.$q.filterRange
        br.end.row = fr.end.row
        br.end.column = fr.end.column - 1;

        var cursor = this.editor.selection.getCursor();
        fr.end.column = fr.start.column = cursor.column;
        fr.end.row = fr.start.row = cursor.row;
        
        cursor.column--
        this.$q.dotPosition = cursor
        
        this.text = '';
        this.onEvalSuccess(o);
    },
    
    onEvalSuccess: function(result, context) {
        this.object = result;

        if (this.$q.functionName) {
            this.unfilteredArray = getProps(context.global);
            this.appendSpecialEntries();
            this.object = context.global;
        } else {
            this.unfilteredArray = getProps(result);
        }

        this.filter(this.unfilteredArray, this.text);
        this.showPanel();
        this.bubble.className = ''
    },

    onEvalFail: function(result, context) {
        var error = true
        this.object = result;

        if (this.$q.functionName) {
            this.unfilteredArray = getProps(context.global);
            this.appendSpecialEntries();
            this.object = context.global;
            error = false
        } else {
            this.unfilteredArray = getProps(result);
        }

        this.filter(this.unfilteredArray, this.text);
        this.showPanel();
        this.bubble.className = error?'error':''
    },

    eval: function(string, context) {
        context = context || Firebug.currentContext;
        if (!string)
            this.onEvalSuccess(context.global, context);
        else if(this.$q.functionName)
            Firebug.evaluate(string,
                FBL.bind(this.onEvalSuccess, this),
                FBL.bind(this.onEvalSuccess, this)
            );
        else
            Firebug.evaluate(string,
                FBL.bind(this.onEvalSuccess, this),
                FBL.bind(this.onEvalFail, this)
            );
    },

    start: function(editor) {
        if (!this.editor && !editor)
            return
        this.editor = editor || this.editor;

        var cell = Firebug.Ace.win2.editor.session.getMode().getCurrentCell();
        var parserName = cell.cursor <= cell.headerEnd ? 'cell' : 'js';

        var $q = this.$q = backParse[parserName](editor);
        this.text = $q.nameFragment;

        if ($q.cell) {
            $q.replaceWord = true;
            this.unfilteredArray = [{
                name:'\u2555lang=js',
                comName:'\u2555lang=js',
                isSpecial: true
            },{
                name: '\u2555lang=cf',
                comName: '\u2555lang=cf',
                description: cell.coffeeText,
                isSpecial: true
            },{
                name: '\u2555this=',
                comName: '\u2555this=',
                description: cell.coffeeText,
                isSpecial: true
            }]
            this.filter(this.unfilteredArray, this.text);
            this.showPanel();
        } else if ($q.eqName) { // style.eqName = '
            this.unfilteredArray = Firebug.Ace.CSSAutocompleter.propValue({propName: $q.eqName})
            this.filter(this.unfilteredArray, this.text);
            this.showPanel();
        } else {
            var evalString = $q.evalString;
            if (!$q.ignoreThisValue)
                evalString = Firebug.jsMirror.setThisValue(evalString);

            this.eval(evalString);
        }
    },

    // *****************
    getHint: function(index) {
        var o = this.selectedObject, longDescriptor;
        if (o) {
            if (o.isSpecial) {
                longDescriptor = o.name + '\n' + o.description;
            } else {
                longDescriptor = jn.inspect2(o.object, "long");
                if(index != -1)
                    longDescriptor += '\n' + jn.lookupSetter(this.object, o.name);
            }
        } else
            longDescriptor = jn.inspect2(this.object);

        return longDescriptor;
    },

    insertSuggestedText: function(additionalText, replaceWord) {
        var c = this.tree.view.selection.currentIndex;
        if (c<0)
            return;
        c = this.sortedArray[c];
        var isSpecial = c.isSpecial;
        var text = c.name;

        var $q = this.$q;
        var range = $q.filterRange;
        if (isSpecial) {
            text=text.substr(1);
        } else if ($q.dotPosition){
            if (/^\d*$/.test(text)) {
                text = "[" + text + "]";
                range.start = $q.dotPosition;
            } else if (!/(^[a-z$_][a-z$_0-9]*$)|(^[\[\{\(]?".*"[\]\}\)]?$)|(^[\[\{\(]?'.*'[\]\}\)]?$)/i.test(text)) {
                text = '["' + text + '"]';
                range.start = $q.dotPosition;
            }
        }


        if (additionalText) {
            text = text+additionalText;
            //l -= additionalText.length + 1;
        }

        var curLine = this.editor.session.getLine(range.end.row)
        if (replaceWord || $q.replaceWord){
            var col = range.end.column, rx = /[a-z$_0-9]/i, ch;
            while((ch=curLine[col++]) && rx.test(ch)); //select word forward
            range.end.column = col-1;
        }

        // do not add last )|}|] if it is already there
        var lastChar = text.slice(-1);
        var cursorChar = curLine[range.end.column];
        if (cursorChar == lastChar && /\)|\}|\]|"/.test(lastChar))
            text = text.slice(0, -1);
        // do not add first " if it is already there
        var firstChar = text[0];
        var cursorChar = curLine[range.start.column-1];

        if (firstChar == '"' && (cursorChar == '"' || cursorChar == "'")) {
            range.start.column--
        }

        var end = this.editor.session.replace(range, text);
    },
    // *****************
    appendSpecialEntries: function() {
        var fu = this.$q.functionName;
        var ans = [];
        var pre = '\u2555"', post = '"', descr = '';
        var createItem = function(x) {
            x = pre + x + post;
            ans.push({
                name: x,
                comName: x.toLowerCase(),
                description: descr,
                depth: -1,
                isSpecial: true
            });
        };
        try {
            if ('createInstance,getService,QueryInterface'.indexOf(fu) != -1) {
                descr = "interface"
                pre = '\u2555Ci.'
                post = ')'
                ;(
                fu == "QueryInterface"
                    ? supportedInterfaces(this.object)
                    : supportedInterfaces(getserviceOrCreateInstance(this.object))
                ).forEach(createItem);
            } else if (fu == "getInterface") {
                descr = "interface"
                pre = '\u2555Ci.'
                post = ')'
                supportedgetInterfaces(this.object).forEach(createItem);
            } else if (fu == "getElementById") {
                descr = 'id'
                getIDsInDoc(this.object).forEach(createItem)
            } else if (fu == "getElementsByClassName") {
                descr = 'class'
                getClassesInDoc(this.object).forEach(createItem)
            } else if (fu == "getAttribute" || fu == "setAttribute" || fu == "hasAttribute") {
                var att = this.object.attributes;
                for(var i=0; i < att.length; i++) {
                    var x = att[i];
                    ans.push({name:'\u2555"'+x.nodeName+'")',comName: '"'+x.nodeName.toLowerCase(),description:x.value, depth:-1,isSpecial:true});
                }
            } else if (fu == "addEventListener" || fu == "removeEventListener" || fu =='on') {
                var er
                if (er = this.object._eventRegistry) try{
                    if(er.forEach)
                        er.forEach(createItem)
                    else
                        Object.keys(er).forEach(createItem)
                } catch(e){}
                descr = "browser event name"
                eventNames.forEach(createItem);
            } else if ('createElementNS,createAttributeNS,hasAttributeNS'.indexOf(fu)!=-1) {
                descr = "ns";
                namespaces.forEach(createItem);
            } else if (fu == 'require') {
                descr = "module";
                if(require && require.modules)
                    require.modules.forEach(createItem);
            }
        } catch(e) {
            Cu.reportError(e);
        }
        this.unfilteredArray = ans.concat(this.unfilteredArray);
    },

    compare: function() {
        this.sayInBubble(compareWithPrototype.compare(this.object).join("\n"));
    }
});

Firebug.Ace.CSSAutocompleter =  FBL.extend(Firebug.Ace.BaseAutocompleter, {
    invalidCharRe: /[\+;:,= \(\)\[\]\{\}\><]/,
    start: function(editor) {
        this.editor = editor || this.editor;

        var $q = this.$q = backParse.css(this.editor);
        this.text = $q.nameFragment;


        this.unfilteredArray = this[$q.mode]($q);

        this.filter(this.unfilteredArray, this.text);
        this.showPanel();
    },

    // *****************
    getHint: function(index) {
        var o = this.sortedArray[index], longDescriptor;

        return;
    },

    insertSuggestedText: function(additionalText, replaceWord) {
        var ch;
        var c = this.tree.view.selection.currentIndex;
        if (c < 0)
            return;
        c = this.sortedArray[c];
        var isSpecial = c.special;
        var text = c.name;

        var range = this.$q.filterRange;

        var cursor = range.end;
        var row = cursor.row;
        var col = cursor.column;
        var curLine = this.editor.session.getLine(row);

        var rx = /[\w$\-\[\]\(\)%]/;
        while((ch=curLine[col++]) && rx.test(ch)); //select word forward
        range.end.column = col-1;

        //pseudoclass
        if (text[0]==':') {
            var s = range.start.column;
            while (curLine[s-1]==':')
                s--;
            range.start.column = s;
        }

        this.editor.selection.setSelectionRange(range);
        this.editor.onTextInput(text);
        if (text[text.length-1]==')') {
            range.start.column = s + text.indexOf('(') + 1;
            range.end.column = s + text.length -1;
            this.editor.selection.setSelectionRange(range);
        }
    },
    // *****************
    propName: function(fragment) {
        if (!this.gCSSProperties) {
            var table = [];
            for each(var i in getAllCSSPropertyNames()) {
                table.push({name: i, comName: i.toLowerCase()});
            }
            this.gCSSProperties = table;
        }
        return this.gCSSProperties;
    },
    propValue: function(fragment) {
        var table = [];
        for each(var i in FBL.getCSSKeywordsByProperty('html', fragment.propName)) {
            table.push({name: i, comName: i.toLowerCase()});
        }

        return table;
    },
    selector: function(fragment) {
        var i;
        var table = [];
        if (fragment.termChar[0] == ':') {
            for each(i in mozPseudoClasses) {
                table.push({name: i, comName: i.toLowerCase()});
            }
            for each(i in pseudoClasses) {
                table.push({name: i, comName: i.toLowerCase()});
            }
            for each(i in pseudoElements) {
                table.push({name: i, comName: i.toLowerCase()});
            }
        } else if (fragment.termChar == '.') {
            for each(i in getClassesInDoc(Firebug.currentContext.window.document)) {
                table.push({name: i, comName: i.toLowerCase()});
            }
        } else if (fragment.termChar == '#') {
            for each(i in getIDsInDoc(Firebug.currentContext.window.document)) {
                table.push({name: i, comName: i.toLowerCase()});
            }
        } else {
            for each(i in getNodeNamesInDoc(Firebug.currentContext.window.document)) {
                table.push({name: i, comName: i.toLowerCase()});
            }
        }

        return table;
    },


});

var backParse = (function() {
    var editor;
    var cursor, range, col, row, ch;
    var captureCursor, objCursor, lines, curLine;
    var rx, jsRx = /[a-z$_0-9]/i, cssRx = /[\w$\-\[\]\(\)]/;

    function init($editor) {
        editor = $editor;
        cursor = editor.selection.getCursor();
        range = editor.selection.getRange()
        row = cursor.row;
        col = cursor.column;
        ch = captureCursor = objCursor = null;
        lines = editor.session.doc.$lines;
        curLine = lines[row];
    }
    function next() {
        return ch = curLine[--col] || (
            (curLine = lines[--row] || '', col = curLine.length, row<0?'':'\n'));
    }
    function peek() {
        return curLine[col-1] || (row>0 && '\n');
    }

    function clip(cursor){
        cursor.column<0 && (cursor.column=0)
        cursor.row<0 && (cursor.row=0)
        return cursor
    }
    function getText(cursor) {
        range.start = clip({column:col, row: row})
        range.end = clip(cursor||captureCursor)
        var t = editor.session.getTextRange(range);

        if (ch == '\n') {
            range.start.column = 0
            range.start.row++
            t = t.substr(1)
        } else if(ch) {
            range.start.column++
            t = t.substr(1)
        }
        return t//.trim();
    }
    function capture() {
        return captureCursor = {row:row,column:col+(ch?1:0)}
    }
    function getToken(tocFun){
        capture()
        tocFun()
        return getText(null)
    }

    function eatString(comma) {
        while(next() && (ch!= comma || peek()=='\\') &&
                (ch!= '\n' || peek()=='\\'));
    };
    function eatWord() {
        while(next() && rx.test(ch));
        return ch
    }
    function eatSpace() {
        while(next() == ' ');
        return ch
    }
    function eatWhile(rx) {
        while(next() && rx.test(ch));
        return ch
    }
    function eatBrackets() {
        var stack = [];
        while(ch) {
            switch(ch) {
                case "'": case '"':
                    eatString(ch);
                break;
                case '}':
                    stack.push("{");
                break;
                case ']':
                    stack.push("[");
                break;
                case ')':
                    stack.push("(");
                break;
                case '{': case '[': case '(':
                    if (stack.pop() !== ch)
                        return;
                break;
            }
            next()
            if (stack.length === 0)
                return;
        }
    }

    return {
        js: function(editor){
            init(editor);
            rx = jsRx;
            var ans = {evalString:'', nameFragment:'', functionName:'', eqName:''};
            ans.nameFragment = getToken(eatWord)
            ans.filterRange = range.clone();

            if(ch=="'"||ch=='"'){
                eatSpace()
                if (ch=='('){
                    eatSpace()
                    ans.functionName = getToken(eatWord)
                }else if(ch=='['){
                    eatSpace()
                    objCursor=capture()
                }else if(ch=='='){
                    eatSpace()
                    ans.eqName = getToken(eatWord)
                }
            }
            ch==' '&&eatSpace()
            if (ch=='('){
                eatSpace()
                ans.functionName = getToken(eatWord)
            }
            if (ch=='.'){
                eatWhile(/\s/)
                objCursor=capture()
            }
            if (objCursor) {
                ans.dotPosition = objCursor
                var state='.'
                outer: while (ch) {
                    switch (ch) {
                        case "'": case '"':
                            eatString(ch);
                            next()
                        break outer;
                        case '.':
                            eatWhile(/\s/)
                            state='.'
                        break;
                        case " ":
                        case "\t":
                        case "\n":
                            capture()
                            var capCh = ch
                            eatWhile(/\s/);
                            if(ch != '.' && state != '.'){
                                col = captureCursor.column - 1
                                row = captureCursor.row
                                ch = capCh
                                break outer;
                            }
                        break;
                        case ']':case ')':
                            if(state=='.')
                                eatBrackets()
                            else
                                break outer;
                        break;
                        default:
                            state=''
                            if (rx.test(ch))
                                eatWord();
                            else
                                break outer;
                        break;
                    }
                }

                ans.evalString=getText(objCursor).trim()
                ans.baseRange = range.clone();
            } else {
                range.end.row = range.start.row;
                range.end.column = range.start.column;
                ans.baseRange = range.clone();
            }

            return ans
        },
        css: function(editor){
            init(editor);
            rx = cssRx;
            var ans = {nameFragment:'', mode: 'selector'};
            ans.nameFragment = getToken(eatWord)
            ans.filterRange = range.clone();

            range.end.row = range.start.row;
            range.end.column = range.start.column;
            ans.baseRange = range.clone();
            ans.termChar = ch;

            var colonCursor
            if (!ch) //start of file
                return ans

            if (ch == ':' && peek() == ':') {
                ans.termChar = '::';
                return ans
            }
            if (ch==' ') {
                eatWhile(/\s/)
                if (ch && !rx.test(ch))
                    ans.termChar = ch;
            }
            if (ch == ':'){
                eatWhile(/\s/)
                colonCursor = capture();
                ans.propName = getToken(eatWord)
                ans.baseRange = range.clone();
            }

            do {
                if (ch == '}') {
                    ans.mode = 'selector';
                    return ans;
                } else if (ch == ':') {
                    eatWhile(/\s/)
                    colonCursor = capture();
                    ans.propName = getToken(eatWord)
                    ans.baseRange = range.clone();
                } else if (ch == ';' || ch == '{') {
                    if (colonCursor) {
                        ans.mode = 'propValue';
                    } else {
                        ans.mode = 'propName';
                    }
                    return ans;
                }
            } while(next());

            return  ans;
        },
        cell: function(editor){
            init(editor);
            rx = jsRx;

            var ans = {evalString:'', nameFragment:'', functionName:'', eqName:''};
            ans.nameFragment = getToken(eatWord)
            ans.filterRange = range.clone();
            ans.baseRange = range.clone();
            ans.cell = true

            col = curLine.lastIndexOf('=', col)-1;
            ch = '='
            if (col > 0){
                var tok = getToken(eatWord);
                if (tok == "this" || tok =="scope")
                    ans = this.js(editor)
                    ans.ignoreThisValue = true
            }

            return ans
        }
    }
})()

//css completion helpers
var getAllCSSPropertyNames=function() {
    var style = document.createElement('c').style;
    // not needed in ff4, since there cssText isn't enumerated
    style.__defineGetter__('cssText', function() {
        return 1;
    });
    style.__defineGetter__('cssFloat', function() {
        return 1;
    });
    var ans = ['float'];

    for(var i in style) {
        if (typeof style[i] !== 'string')
            continue;
        ans.push(i.replace(/[A-Z]/g, function(x) {
            return '-' + x.toLowerCase();
        }));
    }
    return ans
};
var gCSSProperties;

var pseudoElements = [
    '::after'
    ,'::before'
    ,'::first-letter'
    ,'::first-line'
    ,'::-moz-selection'
    ];
var pseudoClasses = [
    ':link'
    ,':visited'
    ,':active'
    ,':hover'
    ,':focus'
    ,':not()'

    ,':lang'
    //Page pseudo-classes

    ,':first'
    ,':left'
    ,':right'

    //Structural pseudo-classes
    ,':root'
    ,':nth-child'
    ,':nth-last-child'
    ,':nth-of-type'
    ,':nth-last-of-type'
    ,':first-child'
    ,':last-child'
    ,':first-of-type'
    ,':last-of-type'
    ,':only-of-type'
    ,':empty'
    ,':target'
    //UI States pseudo-classes

    ,':checked'
    ,':enabled'
    ,':default' //Requires Gecko 1.9
    ,':disabled'
    ,':indeterminate'// Requires Gecko 1.9.2
    ,':invalid'// Requires Gecko 2.0
    ,':optional'// Requires Gecko 2.0
    ,':required'// Requires Gecko 2.0
    ,':valid'// Requires Gecko 2.0
];

var mozPseudoClasses = [
   '::-moz-anonymous-block'
   ,'::-moz-anonymous-positioned-block'
   ,':-moz-any()'// Requires Gecko 2
   ,':-moz-any-link'// (matches :link and :visited)
   ,':-moz-bound-element'
   ,':-moz-broken'// Requires Gecko 1.9
   ,'::-moz-canvas'
   ,'::-moz-cell-content'
   ,':-moz-drag-over'
   ,':-moz-first-node'
   ,'::-moz-focus-inner'
   ,'::-moz-focus-outer'
   ,':-moz-focusring'// Requires Gecko 2.0
   ,':-moz-handler-blocked'// Requires Gecko 1.9.1
   ,':-moz-handler-crashed'// Requires Gecko 2.0
   ,':-moz-handler-disabled'// Requires Gecko 1.9.1
   ,'::-moz-inline-table'
   ,':-moz-last-node'
   ,':-moz-list-bullet'
   ,':-moz-list-number'
   ,':-moz-loading'// Requires Gecko 1.9
   ,':-moz-locale-dir(ltr)'// Requires Gecko 1.9.2
   ,':-moz-locale-dir(rtl)'// Requires Gecko 1.9.2
   ,':-moz-lwtheme'// Requires Gecko 1.9.2
   ,':-moz-lwtheme-brighttext'// Requires Gecko 1.9.2
   ,':-moz-lwtheme-darktext'// Requires Gecko 1.9.2
   ,':-moz-math-stretchy'//
   ,':-moz-math-anonymous'//
   ,':-moz-only-whitespace'//
   ,'::-moz-page'//
   ,'::-moz-page-sequence'//
   ,'::-moz-pagebreak'//
   ,'::-moz-pagecontent'//
   ,':-moz-placeholder'// Requires Gecko 1.9
   ,'::-moz-selection'//
   ,'::-moz-scrolled-canvas'//
   ,'::-moz-scrolled-content'//
   ,'::-moz-scrolled-page-sequence'//
   ,':-moz-suppressed'// Requires Gecko 1.9
   ,':-moz-submit-invalid'// Requires Gecko 2.0
   ,'::-moz-svg-foreign-content'
   ,':-moz-system-metric(images-in-menus)'// Requires Gecko 1.9
   ,':-moz-system-metric(mac-graphite-theme)'// Requires Gecko 1.9.1
   ,':-moz-system-metric(scrollbar-end-backward)'// Requires Gecko 1.9
   ,':-moz-system-metric(scrollbar-end-forward)'// Requires Gecko 1.9
   ,':-moz-system-metric(scrollbar-start-backward)'// Requires Gecko 1.9
   ,':-moz-system-metric(scrollbar-start-forward)'// New in Firefox 3
   ,':-moz-system-metric(scrollbar-thumb-proportional)'// Requires Gecko 1.9
   ,':-moz-system-metric(touch-enabled)'// Requires Gecko 1.9.2
   ,':-moz-system-metric(windows-default-theme)'// New in Firefox 3
   ,'::-moz-table'
   ,'::-moz-table-cell'
   ,'::-moz-table-column'
   ,'::-moz-table-column-group'
   ,'::-moz-table-outer'
   ,'::-moz-table-row'
   ,'::-moz-table-row-group'
   ,':-moz-tree-checkbox'
   ,':-moz-tree-cell'
   ,':-moz-tree-cell-text'
   ,':-moz-tree-cell-text(hover)'// Requires Gecko 1.9
   ,':-moz-tree-column'
   ,':-moz-tree-drop-feedback'
   ,':-moz-tree-image'
   ,':-moz-tree-indentation'
   ,':-moz-tree-line'
   ,':-moz-tree-progressmeter'
   ,':-moz-tree-row'
   ,':-moz-tree-row(hover)'// Requires Gecko 1.9
   ,':-moz-tree-separator'
   ,':-moz-tree-twisty'
   ,':-moz-ui-invalid'// Requires Gecko 2.0
   ,':-moz-ui-valid'// Requires Gecko 2.0
   ,':-moz-user-disabled'// Requires Gecko 1.9
   ,'::-moz-viewport'
   ,'::-moz-viewport-scroll'
   ,':-moz-window-inactive'// Requires Gecko 2.0
   ,'::-moz-xul-anonymous-block'
];

//js completion helpers
var getIDsInDoc = function(doc) {
    var xpe = new XPathEvaluator();
    var nsResolver = xpe.createNSResolver(doc.documentElement);
    var result = xpe.evaluate('//*[@id]', doc.documentElement, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var ans=[];

    for(let i = 0, snapLen = result.snapshotLength; i < snapLen; i++)
        ans[i] = result.snapshotItem(i).id;

    return ans;
};

var getClassesInDoc = function(doc) {
    var xpe = new XPathEvaluator();
    var nsResolver = xpe.createNSResolver(doc.documentElement);
    var result = xpe.evaluate('//*[@class]', doc.documentElement, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var ans = [];

    for(let i = 0, snapLen = result.snapshotLength; i < snapLen; i++) {
        let x = result.snapshotItem(i).className;
        if (ans.indexOf(x) === -1)
            ans.push(x);
    }

    return ans;
};

var getNodeNamesInDoc = function(doc) {
    var xpe = new XPathEvaluator();
    var nsResolver = xpe.createNSResolver(doc.documentElement);
    var frequent='td,div,tr,span,a,box,hbox,vbox'.split(',');
    var result = xpe.evaluate('//*'+'[not(name()='+frequent.join(')][not(name()=')+')]'
            , doc.documentElement, nsResolver,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    var ans = [];
    for(var i = 0; i < result.snapshotLength; i++) {
        var x = result.snapshotItem(i).tagName.toLowerCase();
        if (ans.indexOf(x) === -1)
            ans.push(x);
    }

    return ans.concat(frequent)
};

var modernFox = !!Object.getOwnPropertyNames;
/**============-=========-================**/
var getProps = function(targetObj) {
    if (!targetObj)
        return [];

    var d, o, x = targetObj
    var data = [], protoList = [], depth = 0, allProps = [];

    if (typeof x !== "object" && typeof x !== "function")
        x = x.constructor.prototype;

    if (typeof x === "xml")
        return [{name: toXMLString, comName: 'toxmlString', description: d, depth:depth, object: o}];

    if (typeof targetObj === "object") {
        x = XPCNativeWrapper.unwrap(targetObj)

        if (targetObj != x) {
            data.push({name:'wrappedJSObject', comName: 'wrappedjsobject',description:'', depth:-1})
            targetObj = x
        }
    }

    var maxProtoDepth = 20
    while(x) {
        var props = Object.getOwnPropertyNames(x);
        innerloop: for each(var i in props) {
            if (allProps.indexOf(i) > -1)
                continue innerloop;

            try {
                o = targetObj[i];
                d = '---slacking---'//jn.inspect(o);
            } catch(e) {
                o = "error";
                d = e.message;
            }
            data.push({name: i, comName: i.toLowerCase(), description: d, depth:depth, object: o});
        }
        protoList.push(x);
        // some objects (XML, Proxy) may have infinite list of __proto__
        if(!maxProtoDepth--)
            break;
        x = Object.getPrototypeOf(x);
        depth++;
        allProps = allProps.concat(props);
    }

    return data;
};


var namespaces = [
    "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
    "http://www.w3.org/1999/xhtml",
    "http://www.w3.org/2000/svg",
    "http://www.w3.org/1999/xlink",
    "http://www.w3.org/1998/Math/MathML"
];

var eventNames = [
    //xul?
    // "broadcast", "command", "commandupdate",  "popuphidden", "popuphiding", "popupshowing", "popupshown", "syncfrompreference", "synctopreference",  "activate", "deactivate",
    //
    "MozAfterPaint", "MozMousePixelScroll", "DOMWindowClose", "DOMFrameContentLoaded", "DOMLinkAdded", "DOMLinkRemoved", "DOMWillOpenModalDialog",
    "DOMModalDialogClosed", "fullscreen", "PopupWindow", "DOMTitleChanged", "PluginNotFound", "ValueChange", "DOMMenuItemActive",
    "DOMMenuItemInactive", "windowZLevel", "readystatechange", "DOMContentLoaded", "pageshow",
    //User interface event types
    "DOMActivate", "DOMFocusIn", "DOMFocusOut", "blur", "focus", "overflow", "underflow",
    //Text event types
    "textInput", "change", "input",
    //Mouse event types
    "click", "mousedown", "mousemove", "mouseover", "mouseout", "mouseup", "DOMMouseScroll", "dblclick", "contextmenu",
    "drag", "dragdrop", "dragend", "dragenter", "dragexit", "draggesture", "dragover",
    //Keyboard event types
    "keydown", "keyup", "keypress",
    //Mutation and mutation name event types
    "DOMSubtreeModified", "DOMNodeInserted", "DOMNodeRemoved", "DOMNodeRemovedFromDocument", "DOMNodeInsertedIntoDocument",
    "DOMAttrModified", "DOMCharacterDataModified", "DOMElementNameChanged", "DOMAttributeNameChanged",
    //Basic event types
    "abort", "beforeunload", "change", "error", "load", "reset", "resize", "scroll", "select", "submit", "unload", "close"
];


/**======================-==-======================*/
var jn = jn || {};

jn.inspect2 = function(x, isLong) {
    if (x == null)
        return String(x);

    var c, i, l;
    var nameList = [];
    var t = typeof x;
    var Class = Object.prototype.toString.call(x);
    var string = x.toString?x.toString():'';
    if (Class == string)
        string = ""; //most objects have same class and toString

    Class = Class.slice(8,-1);

    if (Class === "Function") {
        var isNative = /\[native code\]\s*}$/.test(string); //is native function
        if (!isLong) {
            i = string.indexOf("{");
            if (isNative)
                t = 'function[n]';
            else
                t = 'function';

            return t + string.substring(string.indexOf(" "), i - 1) + "~" + x.length;
        }
        if (isNative) {
            // fixme: reference stuff must be handled elswhwere
            var funcName = string.match(/ ([^\(]*)/)[1];

            return string.replace("()", "(~" + x.length + ")")+ '\n' +getMDCInfoFor(funcName);
        }
        return string;
    }
    if (Class === "XML")
        return Class + "`\n" + x.toXMLString();
    if (t !== "object")
        return Class + "`\n" + string;

    if (Class === "Array") {
        l = x.length;
        nameList.push("`" + Class + "` ~" + l);
        l = Math.min(isLong?100:10, l);
        for(i = 0; i < l; i++) {
            nameList.push(x[i]);
        }
        return nameList.join(',\n   ');
    }

    nameList.push("`", Class, "`\n", string);
    //special cases
    var h = InspectHandlers[Class];
    if (h)
        return nameList.join("") + h(x);

    try{
        l = x.length;
    } catch(e) {}
    //if (typeof l==='number' && l>0)


    //d.constructor

    //\u25b7'\u25ba'
    if (Class === "Object") {
        c = x.constructor;
        if (c && (c = c.name) && c !== "Object")
            nameList.push(":", c, ":");
    }
    try {
        //for files
        if (c = x.spec || x.path)
            nameList.push(" ", c);
        //for dom nodes
        if ((c = x.nodeName || x.name) && (c != string))
            nameList.push(c);

        if (c = x.id)
            nameList.push("#", c);

        if (c = x.className)
            if (typeof c === "string")
                nameList.push(".", c.replace(" ", ".", "g"));

        if ((c = x.value || x.nodeValue) && typeof c === "string") {
            if (c.length > 50)
                c = c.substring(0, 50) + '...';
            nameList.push(" =", c.toSource().slice(12,-2));
        }
        if (typeof l === "number")
            nameList.push(' ~', l);
    } catch(e) {}

    if (isLong) {
        var propList = [];
        propList.push("{\n    ");
        for(i in x) {
            if (propList.length > 10) {
                propList.push('..more..');
                break;
            }
            propList.push(i, ',\n    ');
        }
        propList.push("\n}\n");
        nameList.push(propList.join(''));
    } else if (nameList.length < 6) {
        nameList.push("{");
        for(i in x) {
            if (nameList.length > 12)
                break;
            nameList.push(i, ",");
        }
        nameList.push("}");
    }

    return nameList.join("");
};


jn.getClass = function(x) {
    return Object.prototype.toString.call(x).slice(8,-1);
};

jn.lookupSetter = function (object,prop) {
    object = FBL.unwrapObject(object);
    var s;
    var ans = [];
    try {
        s = Object.__lookupSetter__.call(object, prop);
        if (s)
            ans.push(jn.inspect(s, "long").replace(/^.*\)/,"set " + prop + "()"));
        s = Object.__lookupGetter__.call(object, prop);
        if (s)
            ans.push(jn.inspect(s, "long").replace(/^.*\)/,"get " + prop + "()"));
    } catch(e) {
        Components.utils.reportError(e);
    }
    return ans.join("\n");
};

jn.compare = function(a, b) {
    var ans = [], ai, bi;

    for(let i in a) {
        try{
            try{
                ai = a[i];
            } catch(e) {
                ai = null;
            }
            try{
                bi = b[i];
            } catch(e) {
                bi = null;
            }

            if (ai != bi) {
                if (typeof(ai) === "function" && ai.toString() === bi.toString())
                    continue;
                ans.push([i, a[i], b[i]]);
            }
        } catch(e) {
            ans.push([i, ai, bi]);
        }
    }

    return ans;
};

var compareWithPrototype = {
    getProto: function(object) {
        var className = jn.getClass(object);
        if (className !== "Object" && className in window) {
            try {
                var proto = window[className].prototype;
            } catch(e) {}
        }

        return proto;
    },

    compare: function(object) {
        return jn.compare(object, Object.getPrototypeOf(object));
    }
};



// ************************************************************************************************
function makeReq(href) {
    var req = new XMLHttpRequest;
    req.overrideMimeType("text/plain");
    req.open("GET", href, false);
    try {
        req.send(null);
    } catch (e) {
    }
    return req.responseText;
}
var refDoc;
var getMDCInfoFor = function(funcname) {
    if (!refDoc) {
        refDoc = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
        refDoc.documentElement.innerHTML = makeReq('chrome://acebug/content/reference.xml');
    }
    var a = refDoc.querySelectorAll('[name="' + funcname + '"]');
    var ans = '';
    for(var i = a.length; i--;)
        ans += a[i].textContent;
    return ans;
};
/*

for(var i=l.length;i--;) {
l[i].firstChild.replaceWholeText(l[i].firstChild.wholeText.trim())
}

s=new XMLSerializer()

s.serializeToString(doc)


doc.querySelector('[name="scrollMaxX"]')
*/



if(!modernFox){
    var s = document.querySelector('#autocomplatePanel stack')
    s.removeChild(s.lastChild)
    s.removeChild(s.lastChild)
}
