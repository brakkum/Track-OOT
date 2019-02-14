function exportLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var cont = document.getElementById('output-panel').querySelector('.panel-body');
    var res = {};
    res[el.getAttribute("data-cat")] = {};
    res[el.getAttribute("data-cat")][el.getAttribute("data-id")] = getLogic();
    cont.innerHTML = JSON.stringify(res, " ", 4);
}

function setLogic(logic) {
    removeLogicEl(document.getElementById("editor-panel").querySelector(CHILD_ITEM_QUERY));
    return recursiveSetLogic(logic, document.getElementById("editor-panel").querySelector('.panel-body > .placeholder'));
}

function recursiveSetLogic(logic, root) {
    if (logic == null) return;
    switch(logic.type) {
        case "false":
            addLogicEl(document.getElementById('logic-false'), root);
            break;
        case "true":
            addLogicEl(document.getElementById('logic-true'), root);
            break;
        case "and":
            var a = addLogicEl(document.getElementById('logic-and'), root).querySelector('.placeholder');
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    recursiveSetLogic(el, a);
                }   
            }
            break;
        case "or":
            var a = addLogicEl(document.getElementById('logic-or'), root).querySelector('.placeholder');
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    recursiveSetLogic(el, a);
                }   
            }
            break;
        case "not":
            var a = addLogicEl(document.getElementById('logic-not'), root).querySelector('.placeholder');
            if (!!logic.el && logic.el != null) {
                recursiveSetLogic(logic.el, a);
            }
            break;
        case "equal":
            var a = addLogicEl(document.getElementById('logic-equal'), root);
            a.querySelector("input").value = logic.value;
            a = a.querySelector('.placeholder');
            if (!!logic.el && logic.el != null) {
                recursiveSetLogic(logic.el, a);
            }
            break;
        case "value":
        case "min":
            var a = addLogicEl(document.getElementById('logic-min'), root);
            a.querySelector("input").value = logic.value;
            a = a.querySelector('.placeholder');
            if (!!logic.el && logic.el != null) {
                recursiveSetLogic(logic.el, a);
            }
            break;
        case "mixin":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("mixin_"+logic.el), root);
            }
            break;
        case "skip":
            if (!!logic.el && logic.el != null) {
                var a = addLogicEl(document.getElementById("skip_"+logic.el), root);
                if (logic.hasOwnProperty("value")) {
                    a.querySelector("select").value = logic.value;
                }
            }
            break;
        case "option":
            if (!!logic.el && logic.el != null) {
                var a = addLogicEl(document.getElementById("option_"+logic.el), root);
                if (logic.hasOwnProperty("value")) {
                    a.querySelector("select").value = logic.value;
                }
            }
            break;
        case "filter":
            if (!!logic.el && logic.el != null) {
                var a = addLogicEl(document.getElementById("filter_"+logic.el), root);
                if (logic.hasOwnProperty("value")) {
                    a.querySelector("select").value = logic.value;
                }
            }
            break;
        case "item":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("item_"+logic.el), root);
            }
            break;
    }
}

function getLogic() {
    return recursiveGetLogic(document.getElementById("editor-panel").querySelector(CHILD_ITEM_QUERY));
}

function recursiveGetLogic(root) {
    if (!root || root == null) return null;
    switch (root.getAttribute("data-id")) {
        case null:
        case "":
            return null;
        case "logic-false":
            return {type:"false"};
        case "logic-true":
            return {type:"true"};
        case "logic-and":
            var res = {type:"and",el:[]};
            var ch = Array.from(root.querySelectorAll(CHILD_ITEM_QUERY_SCOPE));
            ch.forEach(el=>{
                res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-or":
            var res = {type:"or",el:[]};
            var ch = Array.from(root.querySelectorAll(CHILD_ITEM_QUERY_SCOPE));
            ch.forEach(el=>{
                res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-not":
            var el = root.querySelector(CHILD_ITEM_QUERY_SCOPE);
            return {type:"not",el:recursiveGetLogic(el)};
        case "logic-equal":
            var el = root.querySelector(CHILD_ITEM_QUERY_SCOPE);
            return {type:"equal",el:recursiveGetLogic(el),value:parseInt(root.querySelector("input").value)};
        case "logic-min":
            var el = root.querySelector(CHILD_ITEM_QUERY_SCOPE);
            return {type:"min",el:recursiveGetLogic(el),value:parseInt(root.querySelector("input").value)};
        default:
            if (root.classList.contains("logic-mixin")) {
                return {type:"mixin",el:root.getAttribute("data-id").slice(6)};
            }
            if (root.classList.contains("logic-option")) {
                if (root.classList.contains("logic-choice")) {
                    return {type:"option",el:root.getAttribute("data-id").slice(7),value:root.querySelector("select").value};
                }
                return {type:"option",el:root.getAttribute("data-id").slice(7)};
            }
            if (root.classList.contains("logic-skip")) {
                if (root.classList.contains("logic-choice")) {
                    return {type:"skip",el:root.getAttribute("data-id").slice(5),value:root.querySelector("select").value};
                }
                return {type:"skip",el:root.getAttribute("data-id").slice(5)};
            }
            if (root.classList.contains("logic-filter")) {
                if (root.classList.contains("logic-choice")) {
                    return {type:"filter",el:root.getAttribute("data-id").slice(7),value:root.querySelector("select").value};
                }
                return {type:"filter",el:root.getAttribute("data-id").slice(7)};
            }
            if (root.classList.contains("logic-item")) {
                return {type:"item",el:root.getAttribute("data-id").slice(5)};
            }
            return null;
    }
}

var ID_CNT = 0;

function moveLogicEl(el, target, clone) {
    var new_parent = target.parentElement;
    if (!!clone) {
        el = cloneLogicEl(el);
    } else {
        var old_parent = el.parentElement;
        if (!old_parent.classList.contains('multiple-children')) {
            old_parent.querySelector(":scope > .placeholder").style.display = "";
        }
    }
    new_parent.insertBefore(el, target);
    if (!new_parent.classList.contains('multiple-children')) {
        target.style.display = "none";
    }
    return el;
}

function cloneLogicEl(el) {
    var buf = el.cloneNode();

    if (!buf.nodeName.startsWith("#")) {
        if (buf.classList.contains("logic-operator")) {
            buf.id = "logic_onboard_"+(ID_CNT++);
            buf.ondragstart = dragNewElement;
            buf.onmouseover = elementMouseOver;
            buf.onmouseout = elementMouseOut;
            buf.ondragover = elementMouseOver;
        } else if (buf.classList.contains("logic-element")) {
            buf.id = "logic_onboard_"+(ID_CNT++);
            buf.ondragstart = dragNewElement;
        } else if (buf.classList.contains("placeholder")) {
            buf.ondrop = dropOnPlaceholder;
            buf.ondragover = allowDrop;
        } else if (buf.tagName == "INPUT" || buf.tagName == "SELECT") {
            buf.onchange = exportLogic;
        }

        var ch = Array.from(el.childNodes);
        if (!!ch) {
            for (let i in ch) {
                buf.appendChild(cloneLogicEl(ch[i]));
            }
        }

        if (buf.tagName == "SELECT") {
            buf.value = el.value;
        }
    }
    return buf;
}

function addLogicEl(el, target) {
    el = el.cloneNode(true);
    el.setAttribute("data-id", el.id);
    el.id = "logic_onboard_"+(ID_CNT++);
    el.ondragstart = dragNewElement;

    var parent = target.parentElement;
    var ph = el.querySelector(".placeholder");
    if (!!ph) {
        ph.ondrop = dropOnPlaceholder;
        ph.ondragover = allowDrop;
    }
    if (!parent.classList.contains('multiple-children')) {
        target.style.display = "none";
    }
    if (el.classList.contains("logic-operator")) {
        el.onmouseover = elementMouseOver;
        el.onmouseout = elementMouseOut;
        el.ondragover = elementMouseOver;
    }
    var input = el.querySelector('input, select');
    if (!!input) {
        input.onchange = exportLogic;
        input.removeAttribute("disabled");
    }

    parent.insertBefore(el, target);
    return el;
}

function removeLogicEl(el) {
    if (!el || el == null) return;
    if (el.id.startsWith("logic_onboard_")) {
        var parent = el.parentElement;
        parent.removeChild(el);
        if (!parent.classList.contains('multiple-children')) {
            parent.querySelector(".placeholder").style.display = "";
        }
    }
    return el;
}