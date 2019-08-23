import EventBus from "/deepJS/util/EventBus/EventBus.js";
//import EventBusModuleShare from "/deepJS/util/EventBus/EventBusModuleShare.js";
import Logger from "/deepJS/util/Logger.js";
import Dialog from "/deepJS/ui/Dialog.js";

import GlobalData from "/script/storage/GlobalData.js";
import Settings from "/script/util/Settings.js";
import SaveHandler from "/script/util/SaveHandler.js";

import "/deepJS/ui/Icon.js";
import "/deepJS/ui/selection/ChoiceSelect.js";
import "/script/ui/LocationStatus.js";

(async function main() {

    
    if ("SharedWorker" in window) {
        let EventBusModuleShare = (await import("/deepJS/util/EventBus/EventBusModuleShare.js")).default;
        EventBusModuleShare.mute("logic");
        EventBus.addModule(EventBusModuleShare);
    }

    updateLoadingMessage("apply logger...");
    if (!!GlobalData.get("version-dev")) {
        Logger.addOutput(document.getElementById("tracker-log"));
        Logger.addOutput(console);
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        document.getElementById("tab_log_top").style.display = "none";
        document.getElementById("tab_log_bottom").style.display = "none";
    }

    updateLoadingMessage("initialize savestates...");
    await SaveHandler.init();

    updateLoadingMessage("initialize settings...");
    await Settings.init();

    updateLoadingMessage("add modules...");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({oldValue:"",newValue:document.getElementById("view-choice-bottom").value});

    await Promise.all([
        $import.importModule("/script/ui/shops/ShopList.js"),
        $import.importModule("/script/ui/songs/SongList.js"),
        $import.importModule("/script/ui/multiplayer/Multiplayer.js"),
        $import.importModule("/script/ui/LayoutContainer.js")
    ]);

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

    window.addEventListener('keydown', function(event) {
        if (event.ctrlKey == true && event.altKey == true && event.key == "i") {
            window.open('detached.html#items', "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

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