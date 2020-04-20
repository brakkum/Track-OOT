
import FileData from "/emcjs/storage/FileData.js";
import IDBStorage from "/emcjs/storage/IDBStorage.js";
import "/emcjs/ui/Paging.js";
import "/emcjs/ui/NavBar.js";
import FileSystem from "/emcjs/util/FileSystem.js";

import "/editors/EditorChoice.js";
import "/editors/logic/LogicEditor.js";

import LogicListsCreator from "/utils/logic/LogicListsCreator.js";
import "/utils/logic/LiteralCustom.js";
import "/utils/logic/LiteralLinked.js";

const FILES = {
    "items": "/src/database/items.json",
    "grids": "/src/database/grids.json",
    "dungeonstate": "/src/database/dungeonstate.json",
    "world": "/src/database/world.json",
    "world_lists": "/src/database/world_lists.json",
    "layouts": "/src/database/layouts.json",
    "songs": "/src/database/songs.json",
    "hints": "/src/database/hints.json",
    "logic": "/src/database/logic.json",
    "settings": "/src/database/settings.json",
    "randomizer_options": "/src/database/randomizer_options.json",
    "filter": "/src/database/filter.json",
    "shops": "/src/database/shops.json",
    "shop_items": "/src/database/shop_items.json"
};

const NAVIGATION = new Map();

let nav = document.getElementById("navbar");
let pager = document.getElementById("pager");
let editorChoice = document.getElementById("editor-choice");

!async function() {
    
    await FileData.load(FILES);

    // main
    !function() {
        editorChoice.addEventListener("choice", function(event) {
            pager.active = event.app;
            if (NAVIGATION.has(event.app)) {
                nav.loadNavigation(NAVIGATION.get(event.app));
            } else {
                nav.loadNavigation([]);
            }
        });
        NAVIGATION.set("main", [{
            "content": "EXIT",
            "handler": () => {
                window.close()
            }
        }]);
        nav.loadNavigation(NAVIGATION.get("main"));
    }();

    // logic editor
    !async function() {
        let LogicsStorage = new IDBStorage("logics");
        let logicEditor = document.getElementById("logic-editor");
        logicEditor.addEventListener("save", async event => {
            await LogicsStorage.set(event.key, event.logic);
        });
        logicEditor.addEventListener("clear", async event => {
            await LogicsStorage.delete(event.key);
        });
        NAVIGATION.set("logic-editor", [{
            "content": "FILE",
            "submenu": [{
                "content": "SAVE LOGIC",
                "handler": async () => {
                    let logic = JSON.parse(JSON.stringify(FileData.get("logic")));
                    let logic_patched = await LogicsStorage.getAll();
                    for (let i in logic_patched) {
                        if (!logic[i]) {
                            logic[i] = logic_patched[i];
                        } else {
                            for (let j in logic_patched[i]) {
                                logic[i][j] = logic_patched[i][j];
                            }
                        }
                    }
                    FileSystem.save(JSON.stringify(logic, " ", 4), "logic.json");
                }
            },{
                "content": "LOAD PATCH",
                "handler": async () => {
                    let res = await FileSystem.load(".json");
                    if (!!res && !!res.data) {
                        let logic = res.data;
                        await LogicsStorage.setAll(logic);
                        await logicEditor.refreshWorkingarea();
                    }
                }
            },{
                "content": "SAVE PATCH",
                "handler": async () => {
                    let logic = await LogicsStorage.getAll();
                    FileSystem.save(JSON.stringify(logic, " ", 4), `logic.${(new Date).valueOf()}.json`);
                }
            },{
                "content": "REMOVE PATCH",
                "handler": async () => {
                    await LogicsStorage.clear();
                    await logicEditor.refreshWorkingarea();
                }
            },{
                "content": "EXIT EDITOR",
                "handler": () => {
                    logicEditor.resetWorkingarea();
                    pager.active = "main";
                    nav.loadNavigation(NAVIGATION.get("main"));
                }
            }]
        }]);
        let lists = await LogicListsCreator.createLists();
        logicEditor.loadOperatorList(lists.operators);
        logicEditor.loadLogicList(lists.logics);
        logicEditor.setLogic(FileData.get("logic", {}));
        logicEditor.setPatch(await LogicsStorage.getAll());
        // register
        editorChoice.register("logic-editor", "LOGIC");
    }();

}();