import GlobalData from "/deepJS/storage/GlobalData.js";
import EventBus from "/deepJS/util/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import Dialog from "/deepJS/ui/Dialog.js";

import TrackerLocalState from "/script/util/LocalState.js";
import Logic from "/script/util/Logic.js";
import "/script/util/SaveHandler.js";

import "/deepJS/ui/Icon.js";
import "/deepJS/ui/selection/ChoiceSelect.js";

(async function main() {

    updateLoadingMessage("apply logger...");
    if (!!GlobalData.get("version").dev) {
        Logger.addOutput(document.getElementById("tracker-log"));
        Logger.addOutput(console);
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        document.getElementById("tab_log_top").style.display = "none";
        document.getElementById("tab_log_bottom").style.display = "none";
    }

    updateLoadingMessage("add modules...");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({oldValue:"",newValue:document.getElementById("view-choice-bottom").value});

    await Promise.all([
        $import.importModule("/script/ui/shops/ShopList.js"),
        $import.importModule("/script/ui/songs/SongList.js"),
        $import.importModule("/script/ui/multiplayer/Multiplayer.js"),
        $import.importModule("/script/ui/LayoutContainer.js"),
        $import.importModule("/script/util/Settings.js")
    ]);

    updateChestStates();
    updateSkulltulasStates();

    updateLoadingMessage("wake up...");
    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

    if (window.location.host == "track-oot.2deep4real.de") {
        setTimeout(function() {
            Dialog.alert("Domain changing", "The domain of this application is changing to <a href=\"http://track-oot.net\">track-oot.net</a>.<br>"
                        + "Please consider to export your savestates to the new domain.<br><br>"
                        + "This domain will be active until 01.08.2019. After that it will be shut down."
                        + "The same applies to <a href=\"http://track-oot-dev.2deep4real.de\">track-oot-dev.2deep4real.de</a>");
        }, 1000);
    } else if (window.location.host == "track-oot-dev.2deep4real.de") {
        setTimeout(function() {
            Dialog.alert("Domain changing", "The domain of this application is changing to <a href=\"http://dev.track-oot.net\">dev.track-oot.net</a>.<br>"
                        + "Please consider to export your savestates to the new domain.<br><br>"
                        + "This domain will be active until 01.08.2019. After that it will be shut down."
                        + "The same applies to <a href=\"http://track-oot.2deep4real.de\">track-oot.2deep4real.de</a>");
        }, 1000);
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
EventBus.register([
    "logic",
    "dungeon-type-update",
    "location-update",
    "update-settings",
    "net:dungeon-type-update",
    "net:location-update",
    "net:update-settings"
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
            if (!buff.mode || TrackerLocalState.read("options", buff.mode, false)) {
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