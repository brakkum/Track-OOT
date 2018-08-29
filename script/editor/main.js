
const CHILD_ITEM_QUERY = ".panel-body > " + [
    ".logic-operator",
    ".logic-item",
    ".logic-mixin",
    ".logic-setting"
].join(", .panel-body > ");
const CHILD_ITEM_QUERY_SCOPE = ":scope > " + [
    ".logic-operator",
    ".logic-item",
    ".logic-mixin",
    ".logic-setting"
].join(", :scope > ");

async function run() {
    window.data = await loadAll();
    fillLogics();
    fillItems();
    fillMixins();
    fillSettings();
    document.getElementById('control-save-local').onclick = saveLocalLogic;
    document.getElementById('control-load-local').onclick = loadLocalLogic;
    document.getElementById('control-remove-local').onclick = removeLocalLogic;
    document.getElementById('control-clear-local').onclick = clearLocalLogic;
    document.getElementById('control-download-patch').onclick = downloadLogicPatch;
    document.getElementById('control-upload-patch').onclick = uploadLogicPatch;
    document.getElementById('control-download-patched').onclick = downloadPatchedLogic;
    document.getElementById('control-load-remote').onclick = loadRemoteLogic;
}
run();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
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
    var input = el.querySelector('input');
    if (!!input) {
        input.onchange = exportLogic;
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