// convert old logic
function convertOldLogic(logic) {
    var res = {
        type:"or",
        el: []
    }
    for (let i = 0; i < logic.length; ++i) {
        var sub = {
            type: "and",
            el: []
        }
        for (let j = 0; j < logic[i].length; ++j) {
            var el = {el:null};
            var act = el;
            var item = logic[i][j];
            if (item.startsWith("!")) {
                item = item.slice(1);
                act.el = {
                    type: "not",
                    el: null
                };
                act = act.el;
            }
            var [itm, cnt] = item.split(":");
            if (!!cnt) {
                act.el = {
                    type: "min",
                    value: cnt,
                    el: null
                };
                act = act.el;
            }
            itm = itm.split(".");
            act.el = {
                type: itm[0].slice(0,-1),
                el: itm[1]
            };
            sub.el.push(el.el);
        }
        res.el.push(sub);
    }
    return res;
}

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
        case "setting":
            if (!!logic.el && logic.el != null) {
                var a = addLogicEl(document.getElementById("setting_"+logic.el), root);
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
            if (root.classList.contains("logic-setting")) {
                if (root.classList.contains("logic-choice")) {
                    return {type:"setting",el:root.getAttribute("data-id").slice(8),value:root.querySelector("select").value};
                }
                return {type:"setting",el:root.getAttribute("data-id").slice(8)};
            }
            if (root.classList.contains("logic-skip")) {
                if (root.classList.contains("logic-choice")) {
                    return {type:"skip",el:root.getAttribute("data-id").slice(5),value:root.querySelector("select").value};
                }
                return {type:"skip",el:root.getAttribute("data-id").slice(5)};
            }
            if (root.classList.contains("logic-item")) {
                return {type:"item",el:root.getAttribute("data-id").slice(5)};
            }
            return null;
    }
}

var ID_CNT = 0;

function isMultiOperator(p) {
    return p.classList.contains('logic-and') || p.classList.contains('logic-or');
}

function moveLogicEl(el, target) {
    var old_parent = el.parentElement;
    var new_parent = target.parentElement;
    new_parent.insertBefore(el, target);
    if (!isMultiOperator(old_parent)) {
        old_parent.querySelector(".placeholder").style.display = "";
    }
    if (!isMultiOperator(new_parent)) {
        target.style.display = "none";
    }
    return el;
}

function addLogicEl(el, target) {
    el = el.cloneNode(true);
    el.setAttribute("data-id", el.id);
    el.id = "logic_onboard_"+(ID_CNT++);
    el.ondragstart = dragNewElement;
    var ph = el.querySelector(".placeholder");
    if (!!ph) {
        ph.ondrop = dropOnPlaceholder;
        ph.ondragover = allowDrop;
    }
    var parent = target.parentElement;
    parent.insertBefore(el, target);
    if (!isMultiOperator(parent)) {
        target.style.display = "none";
    }
    var input = el.querySelector('input, select');
    if (!!input) {
        input.onchange = exportLogic;
        input.removeAttribute("disabled");
    }
    return el;
}

function removeLogicEl(el) {
    if (!el || el == null) return;
    if (el.id.startsWith("logic_onboard_")) {
        var parent = el.parentElement;
        parent.removeChild(el);
        if (!isMultiOperator(parent)) {
            parent.querySelector(".placeholder").style.display = "";
        }
    }
    return el;
}