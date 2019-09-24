import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import Toast from "/deepJS/ui/Toast.js";
import SaveState from "/script/storage/SaveState.js";
import LoadWindow from "/script/ui/savestate/LoadWindow.js";
import ManageWindow from "/script/ui/savestate/ManageWindow.js";
import SaveWindow from "/script/ui/savestate/SaveWindow.js";

let activestate = "";

const stateSave = document.getElementById("save-savestate");
const stateSaveAs = document.getElementById("saveas-savestate");
const stateLoad = document.getElementById("load-savestate");
const stateNew = document.getElementById("new-savestate");
const statesManage = document.getElementById("manage-savestates");
const notePad = document.getElementById("tracker-notes");

stateSave.addEventListener("click", state_Save);
stateSaveAs.addEventListener("click", state_SaveAs);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
statesManage.addEventListener("click", states_Manage);

async function state_Save() {
    let activestate = await SaveState.getName()
    if (!!activestate) {
        await SaveState.save();
        Toast.show(`Saved "${activestate}" successfully.`);
    } else {
        state_SaveAs();
    }
}

async function state_SaveAs() {
    let w = new SaveWindow();
    w.show();
}

async function state_Load() {
    let w = new LoadWindow();
    w.onsubmit = function(event) {
        notePad.value = SaveState.read("notes", "");
        EventBus.trigger("state", SaveState.getState());
    }
    w.show();
}

async function state_New() {
    if (!!await SaveState.getName()) {
        if (!await Dialog.confirm("Warning", "Do you really want to create a new savestate? Unsaved changes will be lost.")) {
            return;
        }
    }
    SaveState.reset();
    notePad.value = "";
    EventBus.trigger("state", SaveState.getState());
}

async function states_Manage() {
    let w = new ManageWindow();
    w.show();
}

async function state_Import() { // TODO redo this for new state
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
        // await prepairSavegameChoice();
        if (!!(await Dialog.confirm(`Imported "${data.name}" successfully.`, `Do you want to load the imported state?${activestate !== "" ? "(Unsaved changes will be lost.)" : ""}`))) {
            stateChoice.value = data.name;
            activestate = data.name;
            await SaveState.load(activestate);
            EventBus.trigger("state", SaveState.getState());
            // toggleStateButtons();
        }
    }
}

class SaveHandler {

    async init() {
        notePad.value = SaveState.read("notes", "");
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
            SaveState.write("notes", notePad.value);
        };
    }

}

export default new SaveHandler;