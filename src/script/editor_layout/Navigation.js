import FileSystem from "/emcJS/util/FileSystem.js";
import GlobalData from "/emcJS/storage/GlobalData.js";

document.getElementById("layouteditor-menu-file-exit").onclick = exitEditor;

function exitEditor() {
    document.getElementById('view-pager').setAttribute("active", "main");
}

