
var data;
var savestate = {
    items: {},
    chests: {}
};

var stateChoice = document.getElementById("select-savegame");
var stateSave = document.getElementById("save-savegame");
var stateLoad = document.getElementById("load-savegame");
var stateNew = document.getElementById("new-savegame");
var stateDel = document.getElementById("delete-savegame");

stateChoice.addEventListener("change", function() {
    document.getElementById("save-savegame").disabled = false;
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

function saveState() {
    if (stateChoice.value != "") {
        localStorage.setItem(stateChoice.value, JSON.stringify(savestate));
    }
}

function loadState() {
    if (stateChoice.value != "") {
        var item = localStorage.getItem(stateChoice.value);
        if (item != "" && item != "null") {
            savestate = JSON.parse(item);
        }
        updateItems();
        updateMap();
    }
}

function deleteState() {
    if (stateChoice.value != ""
    && confirm("Do you really want to delete state \""+stateChoice.value+"\"?")) {
        localStorage.removeItem(stateChoice.value);
        prepairSavegameChoice();
    }
}

function newState() {
    var name = prompt("Please enter the name of the safestate!");
    if (name == "") {
        alert("The name can not be empty");
        newState();
    }
    if (!!name) {
        reset();
        localStorage.setItem(name, JSON.stringify(savestate));
        prepairSavegameChoice();
        stateChoice.value = name;
    }
}