/*
    starting point for application
*/

import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import "/script/storage/TrackerStorage.js";
import Language from "/script/util/Language.js";
import LogicAlternator from "/script/util/LogicAlternator.js";
import World from "/script/util/World.js";

import "/emcJS/ui/Paging.js";

const SettingsStorage = new IDBStorage('settings');

const JSON_FILES = {
    "world": "/database/world.json",
    "world_lists": "/database/world_lists.json",
    "logic": "/database/logic.json"
};
const JSONC_FILES = {
    "items": "/database/items.json",
    "grids": "/database/grids.json",
    "dungeonstate": "/database/dungeonstate.json",
    "layouts": "/database/layouts.json",
    "songs": "/database/songs.json",
    "hints": "/database/hints.json",
    "settings": "/database/settings.json",
    "randomizer_options": "/database/randomizer_options.json",
    "filter": "/database/filter.json",
    "shops": "/database/shops.json",
    "shop_items": "/database/shop_items.json"
};

function setVersion(data) {
    MemoryStorage.set("version-dev", data.dev);
    if (data.dev) {
        MemoryStorage.set("version-string", `DEV [${data.commit.slice(0,7)}]`);
    } else {
        MemoryStorage.set("version-string", data.version);
    }
    MemoryStorage.set("version-date", DateUtil.convert(new Date(data.date), "D.M.Y h:m:s"));
}

(async function main() {

    try {
        updateLoadingMessage("load data...");
        await FileData.json(JSON_FILES);
        await FileData.json(JSONC_FILES);
        setVersion(await FileLoader.json("version.json"));
        updateLoadingMessage("learn languages...");
        await Language.load(await SettingsStorage.get("language", "en_us"));
        updateLoadingMessage("build logic data...");
        await LogicAlternator.init();
        updateLoadingMessage("build world data...");
        World.init();
        updateLoadingMessage("poke application...");
        await init();
    } catch(err) {
        updateLoadingMessage(err.message.replace(/\n/g, "<br>"));
    }

}());

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

async function init() {

    const EventBus = (await import("/emcJS/util/events/EventBus.js")).default;
    const Logger = (await import("/emcJS/util/Logger.js")).default;
    const TrackerSettingsWindow = (await import("/script/ui/TrackerSettingsWindow.js")).default;
    const StateStorage = (await import("/script/storage/StateStorage.js")).default;
    const RandomizerOptionsWindow = (await import("/script/ui/RandomizerOptionsWindow.js")).default;
    
    await import("/emcJS/ui/TextEditor.js");
    await import("/emcJS/ui/LogScreen.js");
    await import("/emcJS/ui/Icon.js");
    await import("/emcJS/ui/selection/ChoiceSelect.js");
    await import("/emcJS/ui/layout/Layout.js");
    await import("/emcJS/ui/layout/TabView.js");

    await import("/script/ui/items/ItemGrid.js");
    await import("/script/ui/dungeonstate/DungeonState.js");
    await import("/script/ui/locations/LocationList.js");
    await import("/script/ui/map/Map.js");
    
    await import("/script/ui/LocationStatus.js");
    await import("/script/content/Tracker.js");
    await import("/script/content/EditorChoice.js");
    await import("/script/content/EditorLogic.js");

    if ("SharedWorker" in window) {
        let EventBusModuleShare = (await import("/emcJS/util/events/EventBusModuleShare.js")).default;
        EventBus.addModule(EventBusModuleShare, {blacklist:["logic"]});
    }

    updateLoadingMessage("apply logger...");
    if (!!MemoryStorage.get("version-dev")) {
        let logPanel = document.createElement("div");
        logPanel.setAttribute("ref", "log");
        logPanel.dataset.title = "Logger";
        logPanel.dataset.icon = "images/icons/log.svg";
        let logScreen = document.createElement("emc-logscreen");
        logScreen.title = "Logger";
        logPanel.append(logScreen);
        document.getElementById("main-content").append(logPanel);
        Logger.addOutput(logScreen);
        //Logger.addOutput(console);
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        // not in dev version
    }

    updateLoadingMessage("initialize components...");
    let notePad = document.getElementById("notes-editor");
    notePad.value = StateStorage.read("notes", "");
    notePad.addEventListener("change", function() {
        StateStorage.write("notes", notePad.value);
    });
    EventBus.register("state", function(event) {
        notePad.value = event.data["notes"] || "";
    });

    updateLoadingMessage("initialize settings...");
    // TODO create navigation component class
    // TODO make better use of navigation component once it is declared
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RandomizerOptionsWindow = new RandomizerOptionsWindow();

    updateLoadingMessage("add modules...");
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

    window.addEventListener('keydown', function(event) {
        if (event.ctrlKey == true && event.altKey == true && event.key == "i") {
            window.open('detached.html#items', "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        if (event.ctrlKey == true && event.key == "z") {
            StateStorage.undo();
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        if (event.ctrlKey == true && event.key == "y") {
            StateStorage.redo();
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

}