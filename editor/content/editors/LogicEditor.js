import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/modules/logic/Editor.js";

import LogicViewer from "../logic/LogicViewer.js";
import LogicListsCreator from "../logic/LogicListsCreator.js";
import "../logic/LiteralCustom.js";
import "../logic/LiteralMixin.js";
import "../logic/LiteralFunction.js";

export default async function(glitched = false) {
    let postfix = "";
    if (!!glitched) {
        postfix = "_glitched";
    }
    let LogicsStorage = new IDBStorage(`logics${postfix}`);
    let logicEditor = document.createElement("jse-logic-editor");
    // refresh
    async function refreshLogicEditor() {
        LogicViewer.glitched = glitched;
        let lists = await LogicListsCreator.createLists(glitched);
        logicEditor.loadOperators(lists.operators);
        logicEditor.loadList(lists.logics);
        let logic = FileData.get(`logic${postfix}`, {edges:{},logic:{}});
        let intLogic = {};
        for (let i in logic.edges) {
            for (let j in logic.edges[i]) {
                intLogic[`${i} -> ${j}`] = logic.edges[i][j];
            }
        }
        for (let i in logic.logic) {
            intLogic[i] = logic.logic[i];
        }
        logicEditor.setLogic(intLogic);
        let patch = await LogicsStorage.getAll();
        logicEditor.setPatch(patch);
    }
    await refreshLogicEditor();
    // register
    logicEditor.addEventListener("save", async event => {
        await LogicsStorage.set(event.key, event.logic);
    });
    logicEditor.addEventListener("clear", async event => {
        await LogicsStorage.delete(event.key);
    });
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE LOGIC",
            "handler": async () => {
                let logic = JSON.parse(JSON.stringify(FileData.get(`logic${postfix}`, {edges:{},logic:{}})));
                let patch = await LogicsStorage.getAll();
                for (let i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        let [key, target] = i.split(" -> ");
                        if (logic.edges[key] == null) {
                            logic.edges[key] = {};
                        }
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
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
                    let intLogic = {};
                    for (let i in logic.edges) {
                        for (let j in logic.edges[i]) {
                            intLogic[`${i} -> ${j}`] = logic.edges[i][j];
                        }
                    }
                    for (let i in logic.logic) {
                        intLogic[i] = logic.logic[i];
                    }
                    // load logic
                    await LogicsStorage.setAll(intLogic);
                    // refresh
                    await refreshLogicEditor();
                    //logicEditor.resetWorkingarea();
                }
            }
        },{
            "content": "SAVE PATCH",
            "handler": async () => {
                let logic = {edges:{},logic:{}};
                let patch = await LogicsStorage.getAll();
                for (let i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        let [key, target] = i.split(" -> ");
                        if (logic.edges[key] == null) {
                            logic.edges[key] = {};
                        }
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
                    }
                }
                FileSystem.save(JSON.stringify(logic, " ", 4), `logic${postfix}.${(new Date).valueOf()}.json`);
            }
        },{
            "content": "REMOVE PATCH",
            "handler": async () => {
                await LogicsStorage.clear();
                await refreshLogicEditor();
                //logicEditor.resetWorkingarea();
            }
        },{
            "content": "EXIT EDITOR",
            "handler": () => {
                logicEditor.resetWorkingarea();
                let event = new Event('close');
                logicEditor.dispatchEvent(event);
            }
        }]
    },{
        "content": "CREATE MIXIN",
        "handler": async () => {
            let name = await Dialog.prompt("Create Mixin", "please enter a name");
            if (typeof name == "string") {
                let el = {
                    "ref": `mixin.${name}`,
                    "category": "mixin",
                    "content": `mixin.${name}`
                };
                for (let i of lists.logics) {
                    if (i.type == "group" && i.caption == "mixin") {
                        i.children.push(el);
                        break;
                    }
                }
                logicEditor.loadList(lists.logics);
            }
        }
    }];

    return {
        name: `Logic${!!glitched?" Glitched":""}`,
        panel: logicEditor,
        navigation: NAV,
        refreshFn: refreshLogicEditor
    }
};