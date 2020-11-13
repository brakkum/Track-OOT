
import FileData from "/emcJS/storage/FileData.js";

import "/editors/EditorWindow.js";

import createLogicEditor from "./content/editors/LogicEditor.js";
import createLocationEditor from "./content/editors/LocationEditor.js";

const FILES = {
    "world":                {path: "/src/database/world.json",              type: "json"},
    "world_lists":          {path: "/src/database/world_lists.json",        type: "json"},
    "logic":                {path: "/src/database/logic.json",              type: "json"},
    "logic_glitched":       {path: "/src/database/logic_glitched.json",     type: "json"},
    "exits":                {path: "/src/database/exits.json",              type: "jsonc"},
    "entrances":            {path: "/src/database/entrances.json",          type: "jsonc"},
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

let windowElement = document.getElementById("window");

function registerWindow({name, panel, navigation, refreshFn}) {
    windowElement.register(name, panel, navigation, refreshFn);
}

!async function() {
    
    await FileData.load(FILES);

    // add editors
    registerWindow(await createLogicEditor(false));
    registerWindow(await createLogicEditor(true));
    registerWindow(await createLocationEditor());

}();