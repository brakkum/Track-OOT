
import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/NavBar.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/EditorChoice.js";
import "/editors/logic/LogicEditor.js";

import LogicListsCreator from "/utils/logic/LogicListsCreator.js";
import "/utils/logic/LiteralCustom.js";
import "/utils/logic/LiteralLinked.js";

const FILES = {
    "world":                {path: "/src/database/world.json",              type: "json"},
    "world_lists":          {path: "/src/database/world_lists.json",        type: "json"},
    "logic":                {path: "/src/database/logic.json",              type: "json"},
    "items":                {path: "/src/database/items.json",              type: "jsonc"},
    "grids":                {path: "/src/database/grids.json",              type: "jsonc"},
    "dungeonstate":         {path: "/src/database/dungeonstate.json",       type: "jsonc"},
    "layouts":              {path: "/src/database/layouts.json",            type: "jsonc"},
    "songs":                {path: "/src/database/songs.json",              type: "jsonc"},
    "hints":                {path: "/src/database/hints.json",              type: "jsonc"},
    "settings":             {path: "/src/database/settings.json",           type: "jsonc"},
    "randomizer_options":   {path: "/src/database/randomizer_options.json", type: "jsonc"},
    "filter":               {path: "/src/database/filter.json",             type: "jsonc"},
    "shops":                {path: "/src/database/shops.json",              type: "jsonc"},
    "shop_items":           {path: "/src/database/shop_items.json",         type: "jsonc"}
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
        let GraphStorage = new IDBStorage("edges");
        let logicEditor = document.getElementById("logic-editor");
        function resolveGraphs2Logic(input) {
            let res = {};
            for (let i in input) {
                let value = input[i];
                let [key, target] = i.split(" -> ");
                res[key] = res[key] || {};
                res[key][target] = value;
            }
            return res;
        }
        // refresh
        async function refreshLogicEditor() {
            let lists = await LogicListsCreator.createLists();
            logicEditor.loadOperatorList(lists.operators);
            logicEditor.loadLogicList(lists.logics);
            logicEditor.setLogic(FileData.get("logic", {}));
            // TODO resolve graph to logic edges format
            let patch = {
                edges: resolveGraphs2Logic(await GraphStorage.getAll()),
                logic: await LogicsStorage.getAll()
            };
            logicEditor.setPatch(patch);
        }
        await refreshLogicEditor();
        // register
        logicEditor.addEventListener("save", async event => {
            if (event.target != null) {
                await GraphStorage.set(`${event.key} -> ${event.target}`, event.logic);
            } else {
                await LogicsStorage.set(event.key, event.logic);
            }
        });
        logicEditor.addEventListener("clear", async event => {
            if (event.target != null) {
                await GraphStorage.delete(`${event.key} -> ${event.target}`);
            } else {
                await LogicsStorage.delete(event.key);
            }
        });
        NAVIGATION.set("logic-editor", [{
            "content": "FILE",
            "submenu": [{
                "content": "SAVE LOGIC",
                "handler": async () => {
                    let logic = JSON.parse(JSON.stringify(FileData.get("logic")));
                    let patch = {
                        edges: resolveGraphs2Logic(await GraphStorage.getAll()),
                        logic: await LogicsStorage.getAll()
                    };
                    for (let i in patch.logic) {
                        if (!logic.logic[i]) {
                            logic.logic[i] = patch.logic[i];
                        } else {
                            for (let j in patch.logic[i]) {
                                logic.logic[i][j] = patch.logic[i][j];
                            }
                        }
                    }
                    for (let i in patch.edges) {
                        if (!logic.edges[i]) {
                            logic.edges[i] = patch.edges[i];
                        } else {
                            for (let j in patch.edges[i]) {
                                edges[`${i} -> ${j}`] = patch.edges[i][j];
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
                        // load logic
                        await LogicsStorage.setAll(logic.logic || {});
                        // load edges
                        let edges = {};
                        for (let i in logic.edges) {
                            if (!!logic.edges[i]) {
                                for (let j in logic.edges[i]) {
                                    logic.edges[i][j] = logic.edges[i][j];
                                }
                            }
                        }
                        await GraphStorage.setAll(edges);
                        // refresh
                        await refreshLogicEditor();
                        logicEditor.resetWorkingarea();
                    }
                }
            },{
                "content": "SAVE PATCH",
                "handler": async () => {
                    let patch = {
                        edges: resolveGraphs2Logic(await GraphStorage.getAll()),
                        logic: await LogicsStorage.getAll()
                    };
                    FileSystem.save(JSON.stringify(patch, " ", 4), `logic.${(new Date).valueOf()}.json`);
                }
            },{
                "content": "REMOVE PATCH",
                "handler": async () => {
                    await LogicsStorage.clear();
                    await GraphStorage.clear();
                    await refreshLogicEditor();
                    logicEditor.resetWorkingarea();
                }
            },{
                "content": "EXIT EDITOR",
                "handler": () => {
                    logicEditor.resetWorkingarea();
                    pager.active = "main";
                    nav.loadNavigation(NAVIGATION.get("main"));
                }
            }]
        },{
            "content": "CREATE MIXIN",
            "handler": async () => {
                let name = await Dialog.prompt("Create Mixin", "please enter a name");
                if (typeof name == "string") {
                    let el = {
                        "access": `mixin.${name}`,
                        "category": "mixin",
                        "content": `mixin.${name}`
                    };
                    for (let i of lists.logics) {
                        if (i.type == "group" && i.caption == "mixin") {
                            i.children.push(el);
                            break;
                        }
                    }
                    logicEditor.loadLogicList(lists.logics);
                }
            }
        }]);
        // register
        editorChoice.register("logic-editor", "LOGIC");
    }();

}();