import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import FileSystem from "/emcJS/util/FileSystem.js";

import "/editors/EditorChoice.js";
import "/editors/logic/LogicEditor.js";

import LogicListsCreator from "/script/content/logic/LogicListsCreator.js";
import "/script/content/logic/LiteralCustom.js";
import "/script/content/logic/LiteralLinked.js";

import PageSwitcher from "/script/util/PageSwitcher.js";

let LogicsStorage = new IDBStorage("logics");
let editorChoice = document.getElementById("editor-choice");
let logicEditor = document.getElementById("editor-logic");

!async function() {
    let lists = await LogicListsCreator.createLists();
    logicEditor.loadOperatorList(lists.operators);
    logicEditor.loadLogicList(lists.logics);
    logicEditor.setLogic(FileData.get("logic", {}));
    logicEditor.setPatch(await LogicsStorage.getAll());
    // register
    logicEditor.addEventListener("save", async event => {
        await LogicsStorage.set(event.key, event.logic);
    });
    logicEditor.addEventListener("clear", async event => {
        await LogicsStorage.delete(event.key);
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
                PageSwitcher.switch("editor_choice");
            }
        }]
    }]);
}();