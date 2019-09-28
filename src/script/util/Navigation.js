import Dialog from "/deepJS/ui/Dialog.js";
import Toast from "/deepJS/ui/Toast.js";
import StateStorage from "/script/storage/StateStorage.js";
import LoadWindow from "/script/ui/savestate/LoadWindow.js";
import ManageWindow from "/script/ui/savestate/ManageWindow.js";
import SaveWindow from "/script/ui/savestate/SaveWindow.js";
import Settings from "/script/util/Settings.js";

const stateSave = document.getElementById("save-savestate");
const stateSaveAs = document.getElementById("saveas-savestate");
const stateLoad = document.getElementById("load-savestate");
const stateNew = document.getElementById("new-savestate");
const statesManage = document.getElementById("manage-savestates");
const joinDiscord = document.getElementById("join-discord");
const editSettings = document.getElementById("edit-settings");

stateSave.addEventListener("click", state_Save);
stateSaveAs.addEventListener("click", state_SaveAs);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
statesManage.addEventListener("click", states_Manage);
joinDiscord.addEventListener("click", openDiscortJoin);
editSettings.addEventListener("click", openSettingsWindow);

async function state_Save() {
    let activestate = await StateStorage.getName()
    if (!!activestate) {
        await StateStorage.save();
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
    w.show();
}

async function state_New() {
    if (!!await StateStorage.isDirty()) {
        if (!await Dialog.confirm("Warning, you have unsaved changes.", "Do you want to discard your changes and create a new state?")) {
            return;
        }
    }
    StateStorage.reset();
}

async function states_Manage() {
    let w = new ManageWindow();
    w.show();
}

function openDiscortJoin() {
    window.open("https://discord.gg/wgFVtuv", "_blank");
}

function openSettingsWindow() {
    Settings.show();
}