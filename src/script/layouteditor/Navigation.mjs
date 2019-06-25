import FileSystem from "/deepJS/util/FileSystem.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";

document.getElementById("layouteditor-menu-file-exit").onclick = exitEditor;

function exitEditor() {
    document.getElementById('view-pager').setAttribute("active", "main");
}

