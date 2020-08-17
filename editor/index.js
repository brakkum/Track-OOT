
import FileData from "/emcJS/storage/FileData.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/NavBar.js";

import "/editors/EditorChoice.js";

import createLogicEditor from "./content/editors/LogicEditor.js";
import createLocationEditor from "./content/editors/LocationEditor.js";

const TITLE_PREFIX = "Tracker-Editor";

const FILES = {
    "world":                {path: "/src/database/world.json",              type: "json"},
    "world_lists":          {path: "/src/database/world_lists.json",        type: "json"},
    "logic":                {path: "/src/database/logic.json",              type: "json"},
    "logic_glitched":       {path: "/src/database/logic_glitched.json",     type: "json"},
    "items":                {path: "/src/database/items.json",              type: "jsonc"},
    "grids":                {path: "/src/database/grids.json",              type: "jsonc"},
    "dungeonstate":         {path: "/src/database/dungeonstate.json",       type: "jsonc"},
    "layouts":              {path: "/src/database/layouts.json",            type: "jsonc"},
    "songs":                {path: "/src/database/songs.json",              type: "jsonc"},
    "hints":                {path: "/src/database/hints.json",              type: "jsonc"},
    "settings":             {path: "/src/database/settings.json",           type: "jsonc"},
    "rulesets":             {path: "/src/database/rulesets.json",           type: "jsonc"},
    "randomizer_options":   {path: "/src/database/randomizer_options.json", type: "jsonc"},
    "filter":               {path: "/src/database/filter.json",             type: "jsonc"},
    "shops":                {path: "/src/database/shops.json",              type: "jsonc"},
    "shop_items":           {path: "/src/database/shop_items.json",         type: "jsonc"}
};

let nav = document.getElementById("navbar");
let editorChoice = document.getElementById("editor-choice");

!async function() {
    
    await FileData.load(FILES);

    // main
    !function() {
        const MAIN_NAV = [{
            "content": "EXIT",
            "handler": () => {
                window.close()
            }
        }];
        editorChoice.addEventListener("choice", function(event) {
            if (event.app == "") {
                document.title = TITLE_PREFIX;
                nav.loadNavigation(MAIN_NAV);
            } else {
                document.title = `${TITLE_PREFIX} - ${event.app}`;
                if (event.nav != null) {
                    nav.loadNavigation(event.nav);
                } else {
                    nav.loadNavigation([]);
                }
            }
        });
        nav.loadNavigation(MAIN_NAV);
    }();

    // add editors
    await createLogicEditor(editorChoice, false);
    await createLogicEditor(editorChoice, true);
    await createLocationEditor(editorChoice);

}();