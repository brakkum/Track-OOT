
var data;
var savestate = {
    items: {},
    chests: {}
};
var activestate = "";

var stateChoice = document.getElementById("select-savegame");
var stateSave = document.getElementById("save-savegame");
var stateLoad = document.getElementById("load-savegame");
var stateNew = document.getElementById("new-savegame");
var stateDel = document.getElementById("delete-savegame");

stateChoice.addEventListener("change", function() {
    if (activestate == stateChoice.value) {
        document.getElementById("save-savegame").disabled = false;
    } else {
        document.getElementById("save-savegame").disabled = true;
    }
    document.getElementById("load-savegame").disabled = false;
    document.getElementById("delete-savegame").disabled = false;
});
stateSave.addEventListener("click", saveState);
stateLoad.addEventListener("click", loadState);
stateNew.addEventListener("click", newState);
stateDel.addEventListener("click", deleteState);

async function main() {

    data = await loadAll();

    console.log("loaded database:\r\n%o", data);

    prepairSavegameChoice();

    createItemTracker();

    populateMap();

    reset();
}

main();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function prepairSavegameChoice() {
    stateChoice.innerHTML = "<option disabled selected hidden value> -- select state -- </option>";
    for (var i = 0; i < localStorage.length; ++i) {
        var el = document.createElement("option");
        el.id = localStorage.key(i);
        el.innerHTML = el.id;
        stateChoice.appendChild(el);
    }
    document.getElementById("save-savegame").disabled = true;
    document.getElementById("load-savegame").disabled = true;
    document.getElementById("delete-savegame").disabled = true;
}

function reset() {
    for (var name in data.items) {
        savestate.items[name] = 0;
    }
    for (var name in data.chest_logic) {
        savestate.chests[name] = false;
    }
    updateItems();
    updateMap();
}

// TODO: implement saving
// TODO: implement loading saves
// TODO: implement creating saves
// TODO: implement deleting saves
// remind: after creating or deleting saves do prepairSavegameChoice()

async function saveState() {
    if (stateChoice.value != "") {
        localStorage.setItem(stateChoice.value, JSON.stringify(savestate));
        await dialogue_alert("Saved successfully.");
    }
}

async function loadState() {
    if (stateChoice.value != "") {
        var confirm = true;
        if (activestate != "") {
            confirm = await dialogue_confirm("Do you really want to load? Unsaved changes will be lost.");
        }
        if (!!confirm) {
            var item = localStorage.getItem(stateChoice.value);
            if (item != "" && item != "null") {
                savestate = JSON.parse(item);
            }
            document.getElementById("save-savegame").disabled = false;
            activestate = stateChoice.value;
            updateItems();
            updateMap();
        }
    }
}

async function deleteState() {
    if (stateChoice.value != ""
    && await dialogue_confirm("Do you really want to delete \""+stateChoice.value+"\"?")) {
        localStorage.removeItem(stateChoice.value);
        prepairSavegameChoice();
        if (stateChoice.value != activestate) {
            stateChoice.value = activestate;
            updateItems();
            updateMap();
        } else {
            activestate == "";
        }
    }
}

async function newState() {
    var name = await dialogue_prompt("Please enter a new name! (Unsafed changes will be lost.)");
    if (name == "") {
        alert("The name can not be empty.");
        newState();
    }
    if (localStorage.hasOwnProperty(name)) {
        alert("The name already exists.");
        newState();
    }
    if (!!name) {
        reset();
        localStorage.setItem(name, JSON.stringify(savestate));
        prepairSavegameChoice();
        stateChoice.value = name;
        document.getElementById("save-savegame").disabled = false;
        document.getElementById("load-savegame").disabled = false;
        document.getElementById("delete-savegame").disabled = false;
    }
}

var dlg         = document.getElementById("dialogue");
var dlg_txt     = document.getElementById("dialogue_text");
var dlg_ok      = document.getElementById("dialogue_submit");
var dlg_abort   = document.getElementById("dialogue_abort");
var dlg_input   = document.getElementById("dialogue_input");
function dialogue_alert(msg) {
    return new Promise(function(resolve) {
        dlg.className = "alert";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(true);
            dlg.className = "";
        };
    });
}
function dialogue_confirm(msg) {
    return new Promise(function(resolve) {
        dlg.className = "confirm";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(true);
            dlg.className = "";
        };
        dlg_abort.onclick = function() {
            resolve(false);
            dlg.className = "";
        };
    });
}
function dialogue_prompt(msg) {
    return new Promise(function(resolve, reject) {
        dlg.className = "prompt";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(dlg_input.value);
            dlg.className = "";
            dlg_input.value = "";
        };
        dlg_abort.onclick = function() {
            resolve(null);
            dlg.className = "";
            dlg_input.value = "";
        };
    });
}