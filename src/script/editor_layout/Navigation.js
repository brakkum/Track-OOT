import FileSystem from "/emcJS/util/FileSystem.js";
import FileData from "/emcJS/storage/FileData.js";

document.getElementById("layouteditor-menu-file-exit").onclick = exitEditor;

function exitEditor() {
    document.getElementById('view-pager').setAttribute("active", "main");
}

