import LocalStorage from "/deepJS/storage/LocalStorage.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import Toast from "/deepJS/ui/Toast.js";
import TrackerStorage from "/script/util/TrackerStorage.js";
import LocalState from "/script/util/LocalState.js";
import StatesWindow from "/script/ui/StatesWindow.js";

let activestate = "";

const stateChoice = document.getElementById("select-savegame");
const stateSave = document.getElementById("save-savegame");
const stateLoad = document.getElementById("load-savegame");
const stateNew = document.getElementById("new-savegame");
const stateDel = document.getElementById("delete-savegame");
const stateRename = document.getElementById("rename-savegame");
const stateExport = document.getElementById("export-savegame");
const stateImport = document.getElementById("import-savegame");
const notePad = document.getElementById("tracker-notes");

stateSave.addEventListener("click", state_Save);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
stateDel.addEventListener("click", state_Delete);
stateRename.addEventListener("click", state_Rename);
stateExport.addEventListener("click", state_Export);
stateImport.addEventListener("click", state_Import);
stateChoice.addEventListener("change", toggleStateButtons);

function toggleStateButtons() {
    if (stateChoice.value == "") {
        stateSave.disabled = true;
        stateLoad.disabled = true;
        stateDel.disabled = true;
        stateExport.disabled = true;
        stateRename.disabled = true;
    } else {
        if (stateChoice.value == activestate) {
            stateSave.disabled = false;
        } else {
            stateSave.disabled = true;
        }
        stateLoad.disabled = false;
        stateDel.disabled = false;
        stateExport.disabled = false;
        stateRename.disabled = false;
    }
}

async function prepairSavegameChoice() {
    stateChoice.innerHTML = "<option disabled selected hidden value=\"\"> -- select state -- </option>";
    let keys = await TrackerStorage.StatesStorage.keys();
    for (let i = 0; i < keys.length; ++i) {
        stateChoice.append(createOption(keys[i]));
    }
    activestate = LocalStorage.get('name', "");
    stateChoice.value = activestate;
}

function createOption(value) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = value;
    return opt;
}

function showStateWindow() {
    return new Promise(function(resolve) {
        let w = new StatesWindow();
        w.onsubmit = function(event) {
            resolve(event.value);
        }
        w.oncancel = function() {
            resolve(false);
        }
        w.onclose = function() {
            resolve();
        }
        w.show();
    });
}

async function state_Save() {
    if (stateChoice.value != "") {
        stateChoice.value = activestate;
        await LocalState.save(activestate);
        Toast.show(`Saved "${activestate}" successfully.`);
    }
}

async function state_Load() {
    let confirm = true;
    if (!!activestate) {
        confirm = await Dialog.confirm("Warning", "Do you really want to load? Unsaved changes will be lost.");
    }
    if (!!confirm) {
        let state = await showStateWindow();
        if (!!state) {
            activestate = state;
            await LocalState.load(activestate);
            notePad.value = LocalState.read("notes", "");
            EventBus.trigger("state", LocalState.getState());
            toggleStateButtons();
            Toast.show(`State "${activestate}" loaded.`);
        }
    }
}

async function state_Delete() {
    if (stateChoice.value != ""
    && await Dialog.confirm("Warning", `Do you really want to delete "${stateChoice.value}"?`)) {
        let del = stateChoice.value;
        TrackerStorage.StatesStorage.remove(del);
        if (del == activestate) {
            activestate = "";
            LocalState.reset();
            EventBus.trigger("state", LocalState.getState());
        }
        stateChoice.value = activestate;
        await prepairSavegameChoice();
        toggleStateButtons();
        Toast.show(`State "${del}" removed.`);
    }
}

async function state_New() {
    let name = await Dialog.prompt("New state", `Please enter a new name!${activestate !== "" ? "(Unsaved changes will be lost.)" : ""}`);
    if (name !== false && typeof name != "undefined") {
        if (name == "") {
            await Dialog.alert("Warning", "The name can not be empty.");
            state_New();
            return;
        }
        if (await TrackerStorage.StatesStorage.has(name)) {
            await Dialog.alert("Warning", "The name already exists.");
            state_New();
            return;
        }
        await TrackerStorage.StatesStorage.set(name, {});
        await prepairSavegameChoice();
        stateChoice.value = name;
        if (activestate == "") {
            if (await Dialog.confirm("Success", `State "${name}" created.<br>Do you want to reset the current state?`)) {
                LocalState.reset();
                notePad.value = "";
            }
        } else {
            Toast.show(`State "${name}" created.`);
            LocalState.reset();
            notePad.value = "";
        }
        await LocalState.save(name);
        activestate = name;
        EventBus.trigger("state", LocalState.getState());
        toggleStateButtons();
    }
}

async function state_Rename() {
    if (stateChoice.value == "") return;
    if (await Dialog.confirm("Warning", `Do you really want to rename "${stateChoice.value}"?`)) {
        let name = await Dialog.prompt("New state", "Please enter a new name!");
        if (name !== false) {
            if (name == "") {
                await Dialog.alert("Warning", "The name can not be empty.");
                state_New();
                return;
            }
            if (await TrackerStorage.StatesStorage.has(name)) {
                await Dialog.alert("Warning", "The name already exists.");
                state_New();
                return;
            }
            await LocalState.rename(stateChoice.value, name);
            if (activestate != "" && activestate == stateChoice.value) {
                activestate = name;
            }
            await prepairSavegameChoice();
            stateChoice.value = name;
            toggleStateButtons();
        }
    }
}

async function state_Export() {
    if (stateChoice.value != "") {
        let confirm = true;
        if (activestate != "") {
            confirm = await Dialog.confirm("Are you shure?", "The last saved state will be exported.");
        }
        if (!!confirm) {
            let item = {
                name: stateChoice.value,
                data: await TrackerStorage.StatesStorage.get(stateChoice.value)
            };
            await Dialog.alert("Your export string", btoa(JSON.stringify(item)).replace(/=*$/,""));
        }
    }
}

async function state_Import() {
    let data = await Dialog.prompt("Import", "Please enter export string!");
    if (data !== false) {
        if (data == "") {
            await Dialog.alert("Warning", "The import string can not be empty.");
            state_Import();
            return;
        }
        data = JSON.parse(atob(data));
        if (await TrackerStorage.StatesStorage.has(data.name) && !(await Dialog.confirm("Warning", "There is already a savegame with this name. Replace savegame?."))) {
            return;
        }
        await TrackerStorage.StatesStorage.set(data.name, data.data);
        await prepairSavegameChoice();
        if (!!(await Dialog.confirm(`Imported "${data.name}" successfully.`, `Do you want to load the imported state?${activestate !== "" ? "(Unsaved changes will be lost.)" : ""}`))) {
            stateChoice.value = data.name;
            activestate = data.name;
            await LocalState.load(activestate);
            EventBus.trigger("state", LocalState.getState());
            toggleStateButtons();
        }
    }
}

class SaveHandler {

    async init() {
        notePad.value = LocalState.read("notes", "");
        let notePadTimer = null;
        notePad.oninput = function() {
            if (!!notePadTimer) {
                clearTimeout(notePadTimer);
            }
            notePadTimer = setTimeout(writeNotePadValue, 1000);
        }
        notePad.oncontextmenu = function(event) {
            event.stopPropagation();
        }
        async function writeNotePadValue() {
            LocalState.write("notes", notePad.value);
        };
        await prepairSavegameChoice();
        toggleStateButtons();
    }

}

export default new SaveHandler;