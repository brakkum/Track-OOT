import FileSystem from "/deepJS/util/FileSystem.mjs";

document.getElementById('editor-menu-file-savelogic').onclick = downloadPatchedLogic;
document.getElementById('editor-menu-file-savepatch').onclick = downloadPatch;
document.getElementById('editor-menu-file-loadpatch').onclick = uploadPatch;
document.getElementById('editor-menu-file-removepatch').onclick = removePatch;
document.getElementById("editor-menu-file-exit").onclick = exitEditor;

async function downloadPatchedLogic() {
    let logic = JSON.parse(JSON.stringify(GlobalData.get("logic")));
    let logic_patched = GlobalData.get("logic_patched");
    for (let i in logic_patched) {
        logic[i] = logic[i] || {};
        for (let j in logic_patched[i]) {
            logic[i][j] = logic_patched[i][j];
        }
    }
    FileSystem.save(JSON.stringify(logic, " ", 4), "logic.json");
}

async function downloadPatch() {
    let logic = GlobalData.get("logic_patched");
    FileSystem.save(JSON.stringify(logic, " ", 4), `logic.${(new Date).valueOf()}.json`);
}

async function uploadPatch() {
    let data = await FileSystem.load();
    if (!!data) {
        GlobalData.set("logic_patched", JSON.parse(data));
    }
}

async function removePatch() {
    // TODO
}

function exitEditor() {
    document.getElementById('view-pager').active = "main";
}