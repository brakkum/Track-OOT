import FileData from "/emcJS/storage/FileData.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Toast from "/emcJS/ui/Toast.js";
import "/emcJS/ui/NavBar.js";
import StateStorage from "/script/storage/StateStorage.js";
import LoadWindow from "/script/ui/savestate/LoadWindow.js";
import ManageWindow from "/script/ui/savestate/ManageWindow.js";
import SaveWindow from "/script/ui/savestate/SaveWindow.js";
import PageSwitcher from "/script/util/PageSwitcher.js";

PageSwitcher.register("main", [{
    "content": "FILE",
    "submenu": [{
        "content": "NEW",
        "handler": state_New
    },{
        "content": "LOAD",
        "handler": state_Load
    },{
        "content": "SAVE",
        "handler": state_Save
    },{
        "content": "SAVE AS",
        "handler": state_SaveAs
    },{
        "content": "MANAGE",
        "handler": states_Manage
    }]
},{
    "content": "DISCORD",
    "handler": openDiscortJoin
},{
    "content": "PATREON",
    "handler": openPatreon
},{
    "content": "EDITORS",
    "handler": showEditors
}, {
    "content": "TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
},{
    "content": "UPLOAD SPOILER",
    "handler": openSpoilerSettingsWindow
},{
    "content": "RANDOMIZER OPTIONS",
    "handler": openRomSettingsWindow
},{
    "content": "TRACKER SETTINGS",
    "handler": openSettingsWindow
}]);
PageSwitcher.switch("main");

async function state_Save() {
    let activestate = await StateStorage.getName();
    if (!!activestate) {
        await StateStorage.save();
        Toast.show(`Saved "${activestate}" successfully.`);
    } else {
        state_SaveAs();
    }
}

async function state_SaveAs() {
    let activestate = await StateStorage.getName();
    let w = new SaveWindow();
    if (!!activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
}

async function state_Load() {
    let activestate = await StateStorage.getName()
    let w = new LoadWindow();
    if (!!activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
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
    let activestate = await StateStorage.getName()
    let w = new ManageWindow();
    if (!!activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
}

function openDiscortJoin() {
    window.open("https://discord.gg/wgFVtuv", "_blank");
}

function openPatreon() {
    window.open("https://www.patreon.com/zidargs", "_blank");
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

function openSpoilerSettingsWindow() {
    if(!!window.SpoilerLogWindow) {
        window.SpoilerLogWindow.show();
    }
}
function showEditors() {
    PageSwitcher.switch("editor_choice");
}

function toggleFullscreen() {
    if (document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen(); 
            }
        }
    }
}