
function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function fillLogics() {
    var cont;
    cont = document.getElementById("category_chest");
    for (let i in data.chests) {
        var el = document.createElement("button");
        el.className = "btn btn-secondary btn-lg btn-block";
        el.innerHTML = translate(i);
        el.id = "chest_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic("+el.id+", data.logic.chests['"+i+"'])");
        cont.appendChild(el);
    }
    for (let i in data.dungeons) {
        var chests = data.dungeons[i].chests;
        for (let j = 0; j < chests.length; ++j) {
            var el = document.createElement("button");
            el.className = "btn btn-secondary btn-lg btn-block";
            el.innerHTML = translate(i) + ": " + translate(chests[j]);
            el.id = "chest_"+i+"_"+chests[j];
            el.setAttribute("title", chests[j]);
            el.onclick = new Function("loadLogic("+el.id+", data.logic.chests['"+chests[j]+"'])");
            cont.appendChild(el);
        }
    }
    cont = document.getElementById("category_skulltula");
    for (let i in data.logic.skulltulas) {
        var el = document.createElement("button");
        el.className = "btn btn-secondary btn-lg btn-block";
        el.innerHTML = translate(i);
        el.id = "skulltula_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic("+el.id+", data.logic.skulltulas['"+i+"'])");
        cont.appendChild(el);
    }
    cont = document.getElementById("category_dungeon");
    for (let i in data.logic.dungeons) {
        var el = document.createElement("button");
        el.className = "btn btn-secondary btn-lg btn-block";
        el.innerHTML = translate(i);
        el.id = "dungeon_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic("+el.id+", data.logic.dungeons['"+i+"'])");
        cont.appendChild(el);
    }
}

function fillItems() {
    var cont = document.getElementById("logic_items");
    for (let i in data.items) {
        var el = document.createElement("div");
        el.className = "logic-item";
        el.id = "item_" + i;
        el.innerHTML = translate(i);
        el.setAttribute("title", i);
        el.setAttribute("draggable", true);
        el.ondragstart = dragNewElement;
        cont.appendChild(el);
    }
}

async function run() {
    window.data = await loadAll();
    fillLogics();
    fillItems();
}
run();

// load/export logic
function loadLogic(ref, logic) {
    var el = document.getElementById('logic_choice_name');
    el.innerHTML = ref.innerHTML;
    el.setAttribute("data-id", ref.getAttribute("title"));
    if (Array.isArray(logic)) {
        logic = convertOldLogic(logic);
    }
    setLogic(logic);
    exportLogic();
}

function exportLogic() {
    var el = document.getElementById('logic_choice_name');
    var cont = document.getElementById("logic_output");
    cont.value = '"' + el.getAttribute("data-id") + '": ' + JSON.stringify(getLogic(), " ", 4);
}

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

// test logic
function testLogic(data, logic) {
    if (!data) data = {items:{}};
    if (!logic) logic = getLogic();
    switch(logic.type) {
        case "and":
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (!testLogic(data, el)) return false;
                }
            }
            return true;
        case "or":
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (testLogic(data, el)) return true;
                }
            }
            return false;
        case "not":
            return !testLogic(data, logic.el);
        case "value":
            return testLogic(data, logic.el) >= logic.value;
        case "item":
            if (!data.items.hasOwnProperty(logic.el)) return 0;
            return data.items[logic.el];
    }
    return true;
}

// set/get logic
function setLogic(logic) {
    removeLogicEl(document.getElementById("logic_choice_board").children[0]);
    return recursiveSetLogic(logic, document.getElementById("logic_choice_board").querySelector('.placeholder'));
}

function recursiveSetLogic(logic, root) {
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
        case "item":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("item_"+logic.el), root);
            }
            break;
    }
}

function getLogic() {
    return recursiveGetLogic(document.getElementById("logic_choice_board").children[0]);
}

function recursiveGetLogic(root) {
    switch (root.getAttribute("data-id")) {
        case "":
            return null;
        case "logic-and":
            var res = {type:"and",el:[]};
            var ch = Array.from(root.children);
            ch.shift();
            ch.forEach(el=>{
                if (!el.classList.contains("placeholder"))
                    res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-or":
            var res = {type:"or",el:[]};
            var ch = Array.from(root.children);
            ch.shift();
            ch.forEach(el=>{
                if (!el.classList.contains("placeholder"))
                    res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-not":
            var el = root.children[1];
            if (!el.classList.contains("placeholder"))
                return {type:"not",el:recursiveGetLogic(el)};
            else
                return {type:"not",el:null};
        case "logic-value":
            var el = root.children[0];
            if (!el.classList.contains("placeholder"))
                return {type:"value",el:recursiveGetLogic(el),value:root.querySelector("input").value};
            else
                return {type:"value",el:null,value:0};
        default:
            return {type:"item",el:root.getAttribute("data-id").slice(5)};

    }
}

// operate logic elements
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
    return el;
}

function removeLogicEl(el) {
    if (el.id.startsWith("logic_onboard_")) {
        var parent = el.parentElement;
        parent.removeChild(el);
        if (!isMultiOperator(parent)) {
            parent.querySelector(".placeholder").style.display = "";
        }
    }
    return el;
}

// drag and drop
var ID_CNT = 0;

function isMultiOperator(p) {
    return p.classList.contains('logic-and') || p.classList.contains('logic-or');
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

function dragNewElement(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropOnPlaceholder(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var id = ev.dataTransfer.getData("text");
    var el = document.getElementById(id);
    if (id.startsWith("logic_onboard_")) {
        moveLogicEl(el, ev.target);
    } else {
        addLogicEl(el, ev.target);
    }
    exportLogic();
}

function deleteElement(ev) {
    var el = document.getElementById(ev.dataTransfer.getData("text"));
    removeLogicEl(el);
    exportLogic();
}

Array.from(document.getElementsByClassName('logic-operator')).forEach(element => {
    element.ondragstart = dragNewElement;
});