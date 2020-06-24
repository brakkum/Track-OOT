import "/editors/EditorChoice.js";
import PageSwitcher from "/script/util/PageSwitcher.js";

let editorChoice = document.getElementById("editor-choice");

editorChoice.addEventListener("choice", function(event) {
    PageSwitcher.switch(event.app);
});
PageSwitcher.register("editor_choice", [{
    "content": "EXIT",
    "handler": () => {
        PageSwitcher.switch("main");
    }
},{
    "content": " TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
}]);

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