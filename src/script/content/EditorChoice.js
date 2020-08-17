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

editorChoice.addEventListener("choice", function(event) {
    if (event.app == "") {
        nav.loadNavigation(MAIN_NAV);
    } else {
        if (event.nav != null) {
            nav.loadNavigation(event.nav.concat({
                "content": " TOGGLE FULLSCREEN",
                "handler": toggleFullscreen
            }));
        } else {
            nav.loadNavigation([{
                "content": " TOGGLE FULLSCREEN",
                "handler": toggleFullscreen
            }]);
        }
    }
});

// add editors
!async function() {
    await createLogicEditor(editorChoice, false);
    await createLogicEditor(editorChoice, true);
}();