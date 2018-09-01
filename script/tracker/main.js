var data;
var activestate = "";

var stateChoice = document.getElementById("select-savegame");
var stateSave = document.getElementById("save-savegame");
var stateLoad = document.getElementById("load-savegame");
var stateNew = document.getElementById("new-savegame");
var stateDel = document.getElementById("delete-savegame");
var stateExport = document.getElementById("export-savegame");
var stateImport = document.getElementById("import-savegame");

stateChoice.addEventListener("change", function() {
    if (activestate == stateChoice.value) {
        stateSave.disabled = false;
    } else {
        stateSave.disabled = true;
    }
    stateLoad.disabled = false;
    stateDel.disabled = false;
    stateExport.disabled = false;
});
stateSave.addEventListener("click", state_Save);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
stateDel.addEventListener("click", state_Delete);
stateExport.addEventListener("click", state_Export);
stateImport.addEventListener("click", state_Import);

document.getElementById("map-scale-slider").addEventListener("input", function(event) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(event.target.value) / 100);
});
document.getElementById("map-option-chest").addEventListener("click", function(event) {
    document.getElementById('map').setAttribute("data-mode", "chests");
    poi_list.mode = "chests";
    if (poi_list.ref != "") {
        clickDungeon(document.getElementById("dungeon_"+poi_list.ref));
    }
    updateMap();
});
document.getElementById("map-option-skulltula").addEventListener("click", function(event) {
    document.getElementById('map').setAttribute("data-mode", "skulltulas");
    poi_list.mode = "skulltulas";
    if (poi_list.ref != "") {
        clickDungeon(document.getElementById("dungeon_"+poi_list.ref));
    }
    updateMap();
});

function changeItemInactiveEffect() {
    var cn = parseInt(document.getElementById("item-container").getAttribute("data-inactive")) || 0;
    if (++cn > 2) cn = 0;
    document.getElementById("item-container").setAttribute("data-inactive", cn);
}

/*************************************************
 *  Main function
 */

async function main() {

    data = await loadAll();

    console.log("loaded database:\r\n%o", data);

    buildSettings();

    prepairSavegameChoice();

    createItemTracker();

    populateMap();
}

main();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function setStatus(name, value) {
    document.getElementById("status-" + name).innerHTML = value;
}

function prepairSavegameChoice() {
    stateChoice.innerHTML = "<option disabled selected hidden value=\"\"> -- select state -- </option>";
    var keys = Storage.names("save");
    for (var i = 0; i < keys.length; ++i) {
        var el = document.createElement("option");
        el.id = keys[i];
        el.innerHTML = el.id;
        stateChoice.appendChild(el);
    }
    stateSave.disabled = true;
    stateLoad.disabled = true;
    stateDel.disabled = true;
    stateExport.disabled = true;
    if (activestate != "") {
        stateChoice.value = activestate;
    }
}

async function state_Save() {
    if (stateChoice.value != "") {
        stateChoice.value = activestate;
        SaveState.save(activestate);
        await Dialogue.alert("Success", "Saved \""+activestate+"\" successfully.");
    }
}

async function state_Load() {
    if (stateChoice.value != "") {
        var confirm = true;
        if (activestate != "") {
            confirm = await Dialogue.confirm("Warning", "Do you really want to load? Unsaved changes will be lost.");
        }
        if (!!confirm) {
            activestate = stateChoice.value;
            SaveState.load(activestate);
            resetSettingsPage("options", document.getElementById("settings-options"));
            resetSettingsPage("skips", document.getElementById("settings-skips"));
            stateSave.disabled = false;
            updateItems();
            updateMap();
        }
    }
}

async function state_Delete() {
    if (stateChoice.value != ""
    && await Dialogue.confirm("Warning", "Do you really want to delete \""+stateChoice.value+"\"?")) {
        Storage.remove("save", stateChoice.value);
        if (stateChoice.value != activestate) {
            stateChoice.value = activestate;
            updateItems();
            updateMap();
        } else {
            activestate == "";
        }
        prepairSavegameChoice();
    }
}

async function state_New() {
    var name = await Dialogue.prompt("New state", "Please enter a new name! (Unsaved changes will be lost.)");
    if (name !== false) {
        if (name == "") {
            await Dialogue.alert("Warning", "The name can not be empty.");
            state_New();
            return;
        }
        if (Storage.has("save", name)) {
            await Dialogue.alert("Warning", "The name already exists.");
            state_New();
            return;
        }
        if (activestate != "" || await Dialogue.confirm("Reset state?", "Do you want to reset the current state?")) {
            SaveState.reset();
        }
        SaveState.save(name);
        resetSettingsPage("options", document.getElementById("settings-options"));
        resetSettingsPage("skips", document.getElementById("settings-skips"));
        prepairSavegameChoice();
        stateChoice.value = name;
        activestate = name;
        stateSave.disabled = false;
        stateLoad.disabled = false;
        stateDel.disabled = false;
        stateExport.disabled = false;
    }
}

async function state_Export() {
    if (stateChoice.value != "") {
        var confirm = true;
        if (activestate != "") {
            confirm = await Dialogue.confirm("Are you shure?", "The last saved state will be exported.");
        }
        if (!!confirm) {
            var item = {
                name: stateChoice.value,
                data: Storage.get("save", stateChoice.value)
            };
            Dialogue.alert("Your export string", btoa(JSON.stringify(item)).replace(/=*$/,""));
        }
    }
}

async function state_Import() {
    var data = await Dialogue.prompt("Import", "Please enter export string!");
    if (data !== false) {
        if (data == "") {
            await Dialogue.alert("Warning", "The import string can not be empty.");
            state_Import();
            return;
        }
        data = JSON.parse(atob(data));
        if (Storage.has("save", data.name) && !(await Dialogue.confirm("Warning", "There is already a savegame with this name. Replace savegame?."))) {
            return;
        }
        Storage.set("save", data.name, data.data);
        prepairSavegameChoice();
        if (!!(await Dialogue.confirm("Imported \""+data.name+"\" successfully.", "Do you want to load the imported state?" + (activestate == "" ? "" : " Unsaved changes will be lost.")))) {
            stateChoice.value = data.name;
            activestate = data.name;
            SaveState.load(activestate);
            stateSave.disabled = false;
            stateLoad.disabled = false;
            stateDel.disabled = false;
            stateExport.disabled = false;
            updateItems();
            updateMap();
        }
    }
}

!function(){
    var k = Object.keys(localStorage);
    k.map(function(v) {
        if (!v.includes("\0")) {
            Storage.set("save", v, JSON.parse(localStorage.getItem(v)));
            localStorage.removeItem(v);
        }
    });
}();