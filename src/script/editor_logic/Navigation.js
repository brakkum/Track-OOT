import FileSystem from "/emcJS/util/FileSystem.js";
import GlobalData from "/emcJS/storage/GlobalData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";

const LogicsStorage = new TrackerStorage('logics');

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
            await LogicsStorage.set(i, logic[i]);
        } else {
            await LogicsStorage.delete(i);
        }
    }
}

async function getLogic(ref) {
    let logic = (await LogicsStorage.get(ref, null));
    if (!!logic) {
        return logic;
    }
    return GlobalData.get(`logic/${ref}`);
}

async function downloadPatchedLogic() {
    let logic = JSON.parse(JSON.stringify(GlobalData.get("logic")));
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

async function downloadPatch() {
    let logic = await LogicsStorage.getAll();
    FileSystem.save(JSON.stringify(logic, " ", 4), `logic.${(new Date).valueOf()}.json`);
}

async function uploadPatch() {
    let res = await FileSystem.load(".json");
    if (!!res && !!res.data) {
        patchLogic(res.data);
        let key = workingarea.dataset.logicKey;
        workingarea.loadLogic(await getLogic(key));
    }
}

async function removePatch() {
    await LogicsStorage.clear();
    let key = workingarea.dataset.logicKey;
    workingarea.loadLogic(await getLogic(key));
}

function exitEditor() {
    logicContainer.querySelector('.logic-location').click();
    document.getElementById('view-pager').setAttribute("active", "editors");
}

