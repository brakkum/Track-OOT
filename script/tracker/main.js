// @koala-prepend "../utils/Dialog.js"
// @koala-prepend "../utils/SaveState.js"
// @koala-prepend "../utils/Storage.js"
// @koala-prepend "../utils/FileLoader.js"
// @koala-prepend "loader.js"
// @koala-prepend "logic.js"
// @koala-prepend "items.js"
// @koala-prepend "map.js"
// @koala-prepend "save.js"
// @koala-prepend "settings.js"

var data = {};

var map_scale_slider = document.getElementById("map-scale-slider");

map_scale_slider.addEventListener("input", function(ev) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);
});
map_scale_slider.addEventListener("change", function(ev) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);
    Storage.set("settings", "map_zoom", parseInt(map_scale_slider.value));
});
// shops
document.getElementById("map-option-shops").addEventListener("click", function(ev) {
    document.getElementById('shop-view').classList.add("active");
});
document.getElementById("shop-view-close-button").addEventListener("click", function(ev) {
    document.getElementById('shop-view').classList.remove("active");
});
// songs
document.getElementById("map-option-songs").addEventListener("click", function(ev) {
    document.getElementById('song-view').classList.add("active");
});
document.getElementById("song-view-close-button").addEventListener("click", function(ev) {
    document.getElementById('song-view').classList.remove("active");
});
// hints
document.getElementById("map-option-hints").addEventListener("click", function(ev) {
    document.getElementById('hint-view').classList.add("active");
});
document.getElementById("hint-view-close-button").addEventListener("click", function(ev) {
    document.getElementById('hint-view').classList.remove("active");
});
// notes
document.getElementById("map-option-notes").addEventListener("click", function(ev) {
    document.getElementById('notes-view').classList.add("active");
});
document.getElementById("notes-view-close-button").addEventListener("click", function(ev) {
    document.getElementById('notes-view').classList.remove("active");
});
function saveNotes() {
    SaveState.write("extra", "notes", document.getElementById("tracker-notes").value);
}
function loadNotes() {
    document.getElementById("tracker-notes").value = SaveState.read("extra", "notes", "");
}

window.onfocus = function(ev) {
    data.logic_patched = Storage.get("settings", "logic", {});
    updateMap();
}

window.oncontextmenu = function(ev) {
    ev.preventDefault();
    return false;
}

function changeItemInactiveEffect() {
    var cn = parseInt(document.getElementById("item-container").getAttribute("data-inactive")) || 0;
    if (++cn > 2) cn = 0;
    document.getElementById("item-container").setAttribute("data-inactive", cn);
}

/*************************************************
 *  Main function
 */

async function main() {

    document.getElementById('status-version').innerHTML = await fetch("version").then(r => !!r.ok ? r.text() : "dev");

    data = await loadAll();

    map_scale_slider.value = Storage.get("settings", "map_zoom", 90);
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);

    buildSettings();

    prepairSavegameChoice();

    createItemTracker();

    populateMap();

    Splash.hide();
}

main();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function compareByTranslation(a, b) {
    let _a = translate(a);
    let _b = translate(b);
    if (translate(_a) < translate(_b)) {
        return -1;
    }
    if (translate(_a) > translate(_b)) {
        return 1;
    }
    return 0;
}

function setStatus(name, value) {
    document.getElementById("status-" + name).innerHTML = value;
}

document.getElementById("erase_all_data").onclick = function() {
    Dialog.prompt("Erase all data?", "You are about to erase all data.<br>Please enter \"ERAZE\" to continue.<br><br>Warning: This cant be undone!").then(function(res) {
        if (res === "ERAZE") {
            window.location = "uninstall.html";
        }
    });
}

function copyVersionString() {
    var el = document.getElementById("version-string");
    window.prompt("Version", el.innerText);   
}