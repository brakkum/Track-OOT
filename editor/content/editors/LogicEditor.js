import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/logic/LogicEditor.js";

import LogicListsCreator from "../logic/LogicListsCreator.js";
import "../logic/LiteralCustom.js";
import "../logic/LiteralLinked.js";
import "../logic/LiteralMixin.js";

export default async function(editorChoice, glitched = false) {
    let postfix = "";
    if (!!glitched) {
        postfix = "_glitched";
    }
    let LogicsStorage = new IDBStorage(`logics${postfix}`);
    let GraphStorage = new IDBStorage(`edges${postfix}`);
    let logicEditor = document.createElement("ted-logiceditor");
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
        let lists = await LogicListsCreator.createLists(glitched);
        logicEditor.loadOperatorList(lists.operators);
        logicEditor.loadLogicList(lists.logics);
        logicEditor.setLogic(FileData.get(`logic${postfix}`, {edges:{},logic:{}}));
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
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE LOGIC",
            "handler": async () => {
                let logic = JSON.parse(JSON.stringify(FileData.get(`logic${postfix}`, {edges:{},logic:{}})));
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
                FileSystem.save(JSON.stringify(logic, " ", 4), `logic${postfix}.json`);
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
                FileSystem.save(JSON.stringify(patch, " ", 4), `logic${postfix}.${(new Date).valueOf()}.json`);
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
                editorChoice.closeCurrent();
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
    }];
    // register
    editorChoice.register(logicEditor, `Logic${!!glitched?" Glitched":""}`, NAV);
};