import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/EditorChoice.js";
import "/editors/logic/LogicEditor.js";

import LogicListsCreator from "/script/content/logic/LogicListsCreator.js";
import "/script/content/logic/LiteralCustom.js";
import "/script/content/logic/LiteralLinked.js";
import "/script/content/logic/LiteralMixin.js";

import PageSwitcher from "/script/util/PageSwitcher.js";

let LogicsStorage = new IDBStorage("logics");
let GraphStorage = new IDBStorage("edges");
let editorChoice = document.getElementById("editor-choice");
let logicEditor = document.getElementById("editor-logic");

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

!async function() {
    async function refreshLogicEditor() {
        let lists = await LogicListsCreator.createLists();
        logicEditor.loadOperatorList(lists.operators);
        logicEditor.loadLogicList(lists.logics);
        logicEditor.setLogic(FileData.get("logic", {edges:{},logic:{}}));
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
        if (event.targetKey != null) {
            await GraphStorage.set(`${event.key} -> ${event.targetKey}`, event.logic);
        } else {
            await LogicsStorage.set(event.key, event.logic);
        }
    });
    logicEditor.addEventListener("clear", async event => {
        if (event.targetKey != null) {
            await GraphStorage.delete(`${event.key} -> ${event.targetKey}`);
        } else {
            await LogicsStorage.delete(event.key);
        }
    });
    editorChoice.register("editor_logic", "LOGIC");
    PageSwitcher.register("editor_logic", [{
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
                PageSwitcher.switch("editor_choice");
            }
        }]
    },{
        "content": " TOGGLE FULLSCREEN",
        "handler": toggleFullscreen
    }]);
}();

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