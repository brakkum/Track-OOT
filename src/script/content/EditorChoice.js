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
}]);