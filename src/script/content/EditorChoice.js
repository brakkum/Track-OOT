import "/editors/EditorChoice.js";
import PageSwitcher from "/script/util/PageSwitcher.js";

import createLogicEditor from "./editors/LogicEditor.js";

let editorChoice = document.getElementById("editor-choice");
let nav = document.getElementById("navbar");

const MAIN_NAV = [{
    "content": "EXIT",
    "handler": () => {
        PageSwitcher.switch("main");
    }
},{
    "content": " TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
}];

const DEFAULT_NAV = [{
    "content": "EXIT",
    "handler": () => {
        editorChoice.closeCurrent();
    }
},{
    "content": " TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
}];

PageSwitcher.register("editor_choice", MAIN_NAV);

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

const PANELS = new Map();

editorChoice.addEventListener("choice", function(event) {
    if (event.app == "") {
        nav.loadNavigation(MAIN_NAV);
    } else {
        let data = PANELS.get(event.app);
        if (typeof data.refreshFn == "function") {
            data.refreshFn();
        }
        if (data.navigation != null) {
            nav.loadNavigation(data.navigation.concat({
                "content": " TOGGLE FULLSCREEN",
                "handler": toggleFullscreen
            }));
        } else {
            nav.loadNavigation(DEFAULT_NAV);
        }
    }
});

function registerWindow({name, panel, navigation, refreshFn}) {
    if (PANELS.has(name)) {
        throw Error(`Panel with name "${name}" already registered`);
    }
    PANELS.set(name, {
        navigation: navigation,
        refreshFn: refreshFn
    });
    panel.addEventListener("close", () => editorChoice.closeCurrent());
    editorChoice.register(panel, name);
}

// add editors
!async function() {
    registerWindow(await createLogicEditor(false));
    registerWindow(await createLogicEditor(true));
}();