import FileSystem from "/deepJS/util/FileSystem.js";
import GlobalData from "/script/storage/GlobalData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import EditorLogic from "./Logic.js";

const LogicStorage = new TrackerStorage('logic');

// TODO patching logic

document.getElementById('editor-menu-file-savelogic').onclick = downloadPatchedLogic;
document.getElementById('editor-menu-file-savepatch').onclick = downloadPatch;
document.getElementById('editor-menu-file-loadpatch').onclick = uploadPatch;
document.getElementById('editor-menu-file-removepatch').onclick = removePatch;
document.getElementById("editor-menu-file-exit").onclick = exitEditor;

let logicContainer = document.getElementById("logics");
let workingarea = document.getElementById('workingarea');

async function patchLogic(logic) {
    for (let i in logic) {
        if (logic[i] != null) {
            await LogicStorage.set(i, logic[i]);
        } else {
            await LogicStorage.delete(i);
        }
    }
}

async function downloadPatchedLogic() {
    let logic = JSON.parse(JSON.stringify(GlobalData.get("logic")));
    let logic_patched = await LogicStorage.getAll();
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

async function downloadPatch() {
    let logic = await LogicStorage.getAll();
    FileSystem.save(JSON.stringify(logic, " ", 4), `logic.${(new Date).valueOf()}.json`);
}

async function uploadPatch() {
    let res = await FileSystem.load(".json");
    if (!!res && !!res.data) {
        EditorLogic.patch(res.data);
        let type = workingarea.dataset.logicType;
        let key = workingarea.dataset.logicKey;
        workingarea.loadLogic(EditorLogic.get(type, key));
    }
}

async function removePatch() {
    EditorLogic.clear();
    let type = workingarea.dataset.logicType;
    let key = workingarea.dataset.logicKey;
    workingarea.loadLogic(EditorLogic.get(type, key));
}

function exitEditor() {
    logicContainer.querySelector('.logic-location').click();
    document.getElementById('view-pager').setAttribute("active", "editors");
}
