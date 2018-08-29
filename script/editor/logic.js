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
                    type: "value",
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
    if (logic == null) return null;
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
        case "value":
            var a = addLogicEl(document.getElementById('logic-value'), root);
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
        case "setting":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("setting_"+logic.el), root);
            }
            break;
        case "item":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("item_"+logic.el), root);
            }
            break;
    }
    return null;
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
        case "logic-value":
            var el = root.querySelector(CHILD_ITEM_QUERY_SCOPE);
            return {type:"value",el:recursiveGetLogic(el),value:parseInt(root.querySelector("input").value)};
        default:
            if (root.classList.contains("logic-mixin")) {
                return {type:"mixin",el:root.getAttribute("data-id").slice(6)};
            }
            if (root.classList.contains("logic-setting")) {
                return {type:"setting",el:root.getAttribute("data-id").slice(5)};
            }
            if (root.classList.contains("logic-item")) {
                return {type:"item",el:root.getAttribute("data-id").slice(5)};
            }
            return null;
    }
}