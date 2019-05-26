import GlobalData from "/deepJS/storage/GlobalData.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";

import TrackerLocalState from "/script/util/LocalState.mjs";
import Logic from "/script/util/Logic.mjs";
import "/script/util/SaveHandler.mjs";

import "/script/ui/items/ItemGrid.mjs";
import "/script/ui/dungeonstate/DungeonState.mjs";
import "/script/ui/locations/LocationList.mjs";
import "/script/ui/map/Map.mjs";

import "/deepJS/ui/Dialog.mjs";
import "/deepJS/ui/Icon.mjs";
import "/deepJS/ui/selection/ChoiceSelect.mjs";

(async function main() {

    updateLoadingMessage("apply logger...");
    if (!!GlobalData.get("version").dev) {
        Logger.addOutput(document.getElementById("tracker-log"));
        Logger.addOutput(console);
        EventBus.on(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        document.getElementById("tab_log_top").style.display = "none";
        document.getElementById("tab_log_bottom").style.display = "none";
    }

    updateLoadingMessage("add modules...");
    addHTMLModule('ootrt-itemgrid', "item-grid");
    addHTMLModule('ootrt-dungeonstate', "dungeon-status").setAttribute("active", "key bosskey map compass type reward");
    addHTMLModule('ootrt-locationlist', "location-list").setAttribute("mode", "chests");
    addHTMLModule('ootrt-map', "location-map").setAttribute("mode", "chests");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({oldValue:"",newValue:document.getElementById("view-choice-bottom").value});

    await Promise.all([
        $import.importModule("/script/ui/shops/ShopList.mjs"),
        $import.importModule("/script/ui/songs/SongList.mjs"),
        $import.importModule("/script/ui/multiplayer/Multiplayer.mjs"),
        $import.importModule("/script/ui/LayoutContainer.mjs"),
        $import.importModule("/script/util/Settings.mjs")
    ]);

    updateChestStates();
    updateSkulltulasStates();

    updateLoadingMessage("wake up...");
    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

}());

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

document.getElementById("hamburger-button").onclick = function(event) {
    document.getElementById("menu").classList.toggle("open");
}

function addHTMLModule(name, target) {
    let el = document.createElement(name);
    document.getElementById(target).append(el);
    return el;
}

function changeView(event) {
    let o = document.querySelector(`#main-content #view-${event.oldValue}`);
    if (!!o) {
        o.classList.remove('active');
    }
    let n = document.querySelector(`#main-content #view-${event.newValue}`);
    if (!!n) {
        n.classList.add('active');
    }
    document.getElementById("view-choice-top").value = event.newValue;
    document.getElementById("view-choice-bottom").value = event.newValue;
}


// state update
// TODO create module for this
EventBus.on([
    "logic",
    "dungeon-type-update",
    "location-update",
    "net:dungeon-type-update",
    "net:location-update"
], function(event) {
    updateChestStates();
    updateSkulltulasStates();
});

function canGet(name, category, dType) {
    let list = GlobalData.get("locations")[name][`${category}_${dType}`];
    let canGet = 0;
    let isOpen = 0;
    for (let i in list) {
        if (!list[i].mode || TrackerLocalState.read("options", list[i].mode, false)) {
            if (!TrackerLocalState.read(category, i, 0)) {
                if (Logic.getValue(category, i)) {
                    canGet++;
                }
                isOpen++;
            }
        }
    }
    return {access: canGet, open: isOpen};
}

function updateChestStates() {
    let access_min = 0;
    let access_max = 0;
    let open_min = 0;
    let open_max = 0;
    let data = GlobalData.get("locations");
    if (!!data) {
        Object.keys(data).forEach(name => {
            let buff = GlobalData.get("locations")[name];
            let dType = TrackerLocalState.read("dungeonTypes", name, buff.hasmq ? "n" : "v");
            if (dType == "n") {
                let cv = canGet(name, "chests", "v");
                let cm = canGet(name, "chests", "mq");
                if (cv.access < cm.access) {
                    access_min += cv.access;
                    access_max += cm.access;
                } else {
                    access_min += cm.access;
                    access_max += cv.access;
                }
                if (cv.open < cm.open) {
                    open_min += cv.open;
                    open_max += cm.open;
                } else {
                    open_min += cm.open;
                    open_max += cv.open;
                }
            } else {
                let c = canGet(name, "chests", dType);
                access_min += c.access;
                access_max += c.access;
                open_min += c.open;
                open_max += c.open;
            }
        });
    }
    if (access_min == access_max) {
        document.getElementById("status-chests-available").innerHTML = access_min;
    } else {
        document.getElementById("status-chests-available").innerHTML = `(${access_min} - ${access_max})`;
    }
    if (open_min == open_max) {
        document.getElementById("status-chests-missing").innerHTML = open_min;
    } else {
        document.getElementById("status-chests-missing").innerHTML = `(${open_min} - ${open_max})`;
    }
}

function updateSkulltulasStates() {
    let access_min = 0;
    let access_max = 0;
    let open_min = 0;
    let open_max = 0;
    let data = GlobalData.get("locations");
    if (!!data) {
        Object.keys(data).forEach(name => {
            let buff = GlobalData.get("locations")[name];
            let dType = TrackerLocalState.read("dungeonTypes", name, buff.hasmq ? "n" : "v");
            if (dType == "n") {
                let cv = canGet(name, "skulltulas", "v");
                let cm = canGet(name, "skulltulas", "mq");
                if (cv.access < cm.access) {
                    access_min += cv.access;
                    access_max += cm.access;
                } else {
                    access_min += cm.access;
                    access_max += cv.access;
                }
                if (cv.open < cm.open) {
                    open_min += cv.open;
                    open_max += cm.open;
                } else {
                    open_min += cm.open;
                    open_max += cv.open;
                }
            } else {
                let c = canGet(name, "skulltulas", dType);
                access_min += c.access;
                access_max += c.access;
                open_min += c.open;
                open_max += c.open;
            }
        });
    }
    if (access_min == access_max) {
        document.getElementById("status-skulltulas-available").innerHTML = access_min;
    } else {
        document.getElementById("status-skulltulas-available").innerHTML = `(${access_min} - ${access_max})`;
    }
    if (open_min == open_max) {
        document.getElementById("status-skulltulas-missing").innerHTML = open_min;
    } else {
        document.getElementById("status-skulltulas-missing").innerHTML = `(${open_min} - ${open_max})`;
    }
}