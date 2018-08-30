
const CHILD_ITEM_QUERY = ".panel-body > " + [
    ".logic-operator",
    ".logic-element"
].join(", .panel-body > ");
const CHILD_ITEM_QUERY_SCOPE = ":scope > " + [
    ".logic-operator",
    ".logic-element"
].join(", :scope > ");

function debug() {
    document.getElementById("editor-frame").classList.toggle("debug-mode")
}

/* PANEL */
var chest_panel = document.getElementById("chest-panel").querySelector('.panel-body');
var skulltula_panel = document.getElementById("skulltula-panel").querySelector('.panel-body');
var dungeon_panel = document.getElementById("dungeon-panel").querySelector('.panel-body');
var mixins_panel = document.getElementById("mixins-panel").querySelector('.panel-body');
var mixin_panel = document.getElementById("mixin-panel").querySelector('.panel-body');
var item_panel = document.getElementById("item-panel").querySelector('.panel-body');
var settings_panel = document.getElementById("settings-panel").querySelector('.panel-body');
var skips_panel = document.getElementById("skips-panel").querySelector('.panel-body');
/* BUTTONS */
var create_mixin_button = document.getElementById('create-mixin');

async function run() {
    window.data = await loadAll();
    fillEditor();
    document.getElementById('control-save-local').onclick = saveLocalLogic;
    document.getElementById('control-load-local').onclick = loadLocalLogic;
    document.getElementById('control-remove-local').onclick = removeLocalLogic;
    document.getElementById('control-clear-local').onclick = clearLocalLogic;
    document.getElementById('control-download-patch').onclick = downloadLogicPatch;
    document.getElementById('control-upload-patch').onclick = uploadLogicPatch;
    document.getElementById('control-download-patched').onclick = downloadPatchedLogic;
    document.getElementById('control-load-remote').onclick = loadRemoteLogic;
    create_mixin_button.onclick = createMixin;
}
run();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

async function createMixin(e) {
    var name = await Dialogue.prompt("New mixin", "Please enter a new name!");
    if (name !== false) {
        if (name == "") {
            await Dialogue.alert("Warning", "The name can not be empty.");
            state_New();
            return;
        }
        name = name.toLowerCase().replace(/ /g, "_");
        if (data.logic.mixins.hasOwnProperty(name)) {
            await Dialogue.alert("Warning", "The name already exists.");
            state_New();
            return;
        }
        data.logic.mixins[name] = null;

        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(name);
        el.id = "mixins_"+name;
        el.setAttribute("title", name);
        el.onclick = new Function("loadLogic('mixins', '"+name+"')");
        el.classList.add('has-new-logic');
        mixins_panel.insertBefore(el, create_mixin_button);

        mixin_panel.appendChild(createElement("mixin", name));
    }
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