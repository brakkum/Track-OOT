import GlobalData from "/deepJS/storage/GlobalData.mjs";
import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import DeepSessionStorage from "/deepJS/storage/SessionStorage.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import {showToast} from "/deepJS/ui/Toast.mjs";
import TrackerLocalState from "./LocalState.mjs";

let activestate = DeepSessionStorage.get('meta', 'active_state', "");

const stateChoice = document.getElementById("select-savegame");
const stateSave = document.getElementById("save-savegame");
const stateLoad = document.getElementById("load-savegame");
const stateNew = document.getElementById("new-savegame");
const stateDel = document.getElementById("delete-savegame");
const stateRename = document.getElementById("rename-savegame");
const stateExport = document.getElementById("export-savegame");
const stateImport = document.getElementById("import-savegame");

stateSave.addEventListener("click", state_Save);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
stateDel.addEventListener("click", state_Delete);
stateRename.addEventListener("click", state_Rename);
stateExport.addEventListener("click", state_Export);
stateImport.addEventListener("click", state_Import);
stateChoice.addEventListener("change", toggleStateButtons);

const notePad = document.getElementById("tracker-notes");
notePad.value = TrackerLocalState.read("extras", "notes", "");
!function() {
    let notePadTimer = null;
    notePad.oninput = function() {
        if (!!notePadTimer) {
            clearTimeout(notePadTimer);
        }
        notePadTimer = setTimeout(writeNotePadValue, 1000);
    }
    function writeNotePadValue() {
        TrackerLocalState.write("extras", "notes", notePad.value);
    };
}();

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

function throwEvents() {
    EventBus.fire("force-item-update");
    EventBus.fire("force-logic-update");
    EventBus.fire("force-location-update");
    EventBus.fire("force-shop-update");
    EventBus.fire("force-song-update");
    EventBus.fire("force-dungeonstate-update");
    EventBus.fire("state-changed");
}

function prepairSavegameChoice() {
    stateChoice.innerHTML = "<option disabled selected hidden value=\"\"> -- select state -- </option>";
    let keys = DeepLocalStorage.names("save");
    for (let i = 0; i < keys.length; ++i) {
        stateChoice.appendChild(createOption(keys[i]));
    }
    stateChoice.value = activestate;
}

function createOption(value) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = value;
    return opt;
}

async function state_Save() {
    if (stateChoice.value != "") {
        stateChoice.value = activestate;
        TrackerLocalState.save(activestate);
        showToast(`Saved "${activestate}" successfully.`);
    }
}

async function state_Load() {
    if (stateChoice.value != "") {
        let confirm = true;
        if (activestate != "") {
            confirm = await Dialog.confirm("Warning", "Do you really want to load? Unsaved changes will be lost.");
        }
        if (!!confirm) {
            activestate = stateChoice.value;
            TrackerLocalState.load(activestate);
            DeepSessionStorage.set('meta', 'active_state', activestate);
            notePad.value = TrackerLocalState.read("extras", "notes", "");
            throwEvents();
            toggleStateButtons();
            showToast(`State "${activestate}" loaded.`);
        }
    }
}

async function state_Delete() {
    if (stateChoice.value != ""
    && await Dialog.confirm("Warning", `Do you really want to delete "${stateChoice.value}"?`)) {
        let del = stateChoice.value;
        DeepLocalStorage.remove("save", del);
        if (del == activestate) {
            activestate = "";
            TrackerLocalState.reset();
            DeepSessionStorage.set('meta', 'active_state', activestate);
            throwEvents();
        }
        stateChoice.value = activestate;
        prepairSavegameChoice();
        toggleStateButtons();
        showToast(`State "${del}" removed.`);
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
        if (DeepLocalStorage.has("save", name)) {
            await Dialog.alert("Warning", "The name already exists.");
            state_New();
            return;
        }
        DeepLocalStorage.set("save", name, {});
        prepairSavegameChoice();
        stateChoice.value = name;
        if (activestate == "") {
            if (await Dialog.confirm("Success", `State "${name}" created.<br>Do you want to reset the current state?`)) {
                TrackerLocalState.reset();
                notePad.value = "";
            }
        } else {
            showToast(`State "${name}" created.`);
            TrackerLocalState.reset();
            notePad.value = "";
        }
        TrackerLocalState.save(name);
        activestate = name;
        DeepSessionStorage.set('meta', 'active_state', activestate);
        throwEvents();
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
            if (DeepLocalStorage.has("save", name)) {
                await Dialog.alert("Warning", "The name already exists.");
                state_New();
                return;
            }
            let save = DeepLocalStorage.get("save", stateChoice.value);
            DeepLocalStorage.remove("save", stateChoice.value);
            DeepLocalStorage.set("save", name, save);
            prepairSavegameChoice();
            if (activestate != "" && activestate == stateChoice.value) {
                activestate = name;
                DeepSessionStorage.set('meta', 'active_state', activestate);
            }
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
                data: DeepLocalStorage.get("save", stateChoice.value)
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
        if (DeepLocalStorage.has("save", data.name) && !(await Dialog.confirm("Warning", "There is already a savegame with this name. Replace savegame?."))) {
            return;
        }
        DeepLocalStorage.set("save", data.name, data.data);
        prepairSavegameChoice();
        if (!!(await Dialog.confirm(`Imported "${data.name}" successfully.`, `Do you want to load the imported state?${activestate !== "" ? "(Unsaved changes will be lost.)" : ""}`))) {
            stateChoice.value = data.name;
            activestate = data.name;
            TrackerLocalState.load(activestate);
            DeepSessionStorage.set('meta', 'active_state', activestate);
            throwEvents();
            toggleStateButtons();
        }
    }
}

prepairSavegameChoice();
toggleStateButtons();