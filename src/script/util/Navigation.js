import FileData from "/emcJS/storage/FileData.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Toast from "/emcJS/ui/Toast.js";
import StateStorage from "/script/storage/StateStorage.js";
import LoadWindow from "/script/ui/savestate/LoadWindow.js";
import ManageWindow from "/script/ui/savestate/ManageWindow.js";
import SaveWindow from "/script/ui/savestate/SaveWindow.js";

const stateSave = document.getElementById("save-savestate");
const stateSaveAs = document.getElementById("saveas-savestate");
const stateLoad = document.getElementById("load-savestate");
const stateNew = document.getElementById("new-savestate");
const statesManage = document.getElementById("manage-savestates");
const joinDiscord = document.getElementById("join-discord");
const editSettings = document.getElementById("edit-settings");
const editRomSettings = document.getElementById("edit-romsettings");
const editors = document.getElementById("show-editors");

stateSave.addEventListener("click", state_Save);
stateSaveAs.addEventListener("click", state_SaveAs);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
statesManage.addEventListener("click", states_Manage);
joinDiscord.addEventListener("click", openDiscortJoin);
editSettings.addEventListener("click", openSettingsWindow);
editRomSettings.addEventListener("click", openRomSettingsWindow);
editors.addEventListener("click", showEditors);

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

    let options = FileData.get("randomizer_options");
    let def_state = {};
    for (let i in options) {
        for (let j in options[i]) {
            let v = options[i][j].default;
            if (Array.isArray(v)) {
                v = new Set(v);
                options[i][j].values.forEach(el => {
                    def_state[el] = v.has(el);
                });
            } else {
                def_state[j] = v;
            }
        }
    }

    StateStorage.reset(def_state);
}

async function states_Manage() {
    let w = new ManageWindow();
    w.show();
}

function openDiscortJoin() {
    window.open("https://discord.gg/wgFVtuv", "_blank");
}

function openSettingsWindow() {
    if (!!window.TrackerSettingsWindow) {
        window.TrackerSettingsWindow.show();
    }
}

function openRomSettingsWindow() {
    if (!!window.RandomizerOptionsWindow) {
        window.RandomizerOptionsWindow.show();
    }
}

function showEditors() {
    document.getElementById('view-pager').setAttribute("active", "editors");
}




/* TODO
** use this to create unified states
** currently ugly (hence not used) but we keep an eye on async modules for now
*/
function getDefaultState() {
    let DEFAULT_STATE = {
        notes: ""
    };
    let shops = FileData.get("shops");
    for (let i in shops) {
        DEFAULT_STATE[i] = shops[i];
        DEFAULT_STATE[`${i}.names`] = ["", "", "", "", "", "", "", ""];
        DEFAULT_STATE[`${i}.bought`] = [0, 0, 0, 0, 0, 0, 0, 0]
    }
    let songs = FileData.get("songs");
    for (let i in songs) {
        if (songs[i].editable) {
            DEFAULT_STATE[i] = songs[i].notes;
        }
    }
    let items = FileData.get("items");
    for (let i in items) {
        DEFAULT_STATE[i] = 0;
    }
    let locations = FileData.get("world/locations");
    for (let i in locations) {
        DEFAULT_STATE[i] = false;
        if (locations[i].type == "gossipstone") {
            DEFAULT_STATE[`${i}.item`] = "";
            DEFAULT_STATE[`${i}.location`] = "";
        }
    }
    let entrances = FileData.get("world/entrances");
    for (let i in entrances) {
        DEFAULT_STATE[i] = "";
    }
    let dungeonstate = FileData.get("dungeonstate");
    for (let i in dungeonstate) {
        if (dungeonstate[i].hasmq) {
            DEFAULT_STATE[`dungeonTypes.${i}`] = "n";
        }
        if (dungeonstate[i].boss_reward) {
            DEFAULT_STATE[`dungeonRewards.${i}`] = 0;
        }
    }
    let options = FileData.get("randomizer_options");
    for (let i in options) {
        for (let j in options[i]) {
            if (options[i][j].type == "list") {
                let def = new Set(options[i][j].default);
                for (let k of options[i][j].values) {
                    if (def.has(k)) {
                        DEFAULT_STATE[k] = true;
                    } else {
                        DEFAULT_STATE[k] = false;
                    }
                }
            } else {
                DEFAULT_STATE[j] = options[i][j].default;
            }
        }
    }
    return DEFAULT_STATE;
}