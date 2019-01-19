const CHILD_ITEM_QUERY = ".panel-body > " + [
    ".logic-operator",
    ".logic-element"
].join(", .panel-body > ");
const CHILD_ITEM_QUERY_SCOPE = ":scope > " + [
    ".logic-operator",
    ".logic-element"
].join(", :scope > ");

function debug() {
    document.getElementById("editor-frame").classList.toggle("debug-mode");
}

/* PANEL */
var logics_panel = document.getElementById("logics-panel").querySelector('.panel-body');
var elements_panel = document.getElementById("elements-panel").querySelector('.panel-body');

async function run() {
    window.data = await loadAll();
    window.oncontextmenu = function(ev) {
        ev.preventDefault();
        return false;
    }
    fillEditor();
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
    if (typeof index != "string") {
        return index;
    }
    return index.replace(/\_/g, " ");
}

// drag and drop
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
    if (!!ev.dataTransfer) {
        var id = ev.dataTransfer.getData("text");
        var el = document.getElementById(id);
        if (!!el) {
            if (id.startsWith("logic_onboard_")) {
                moveLogicEl(el, ev.target, ev.ctrlKey);
            } else {
                addLogicEl(el, ev.target);
            }
            exportLogic();
        }
    }
}

function deleteElement(ev) {
    var el = document.getElementById(ev.dataTransfer.getData("text"));
    removeLogicEl(el);
    exportLogic();
    ev.preventDefault();
    ev.stopPropagation();
}

Array.from(document.getElementsByClassName('logic-operator')).forEach(element => {
    element.ondragstart = dragNewElement;
});

/* hover and blur */
function elementMouseOver(ev) {
    var o = document.querySelector(".logic-operator.hover");
    if (!!o) {
        o.classList.remove("hover");
    }
    ev.currentTarget.classList.add("hover");
    ev.stopPropagation();
}

function elementMouseOut(ev) {
    if (ev.currentTarget.classList.contains("hover")) {
        ev.currentTarget.classList.remove("hover");
        ev.stopPropagation();
    }
}