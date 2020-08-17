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

const FILES = {
    "world":                {path: "/database/world.json",              type: "json"},
    "world_lists":          {path: "/database/world_lists.json",        type: "json"},
    "logic":                {path: "/database/logic.json",              type: "json"},
    "logic_glitched":       {path: "/database/logic_glitched.json",     type: "json"},
    "items":                {path: "/database/items.json",              type: "jsonc"},
    "grids":                {path: "/database/grids.json",              type: "jsonc"},
    "dungeonstate":         {path: "/database/dungeonstate.json",       type: "jsonc"},
    "layouts":              {path: "/database/layouts.json",            type: "jsonc"},
    "songs":                {path: "/database/songs.json",              type: "jsonc"},
    "hints":                {path: "/database/hints.json",              type: "jsonc"},
    "settings":             {path: "/database/settings.json",           type: "jsonc"},
    "rulesets":             {path: "/database/rulesets.json",           type: "jsonc"},
    "randomizer_options":   {path: "/database/randomizer_options.json", type: "jsonc"},
    "filter":               {path: "/database/filter.json",             type: "jsonc"},
    "shops":                {path: "/database/shops.json",              type: "jsonc"},
    "shop_items":           {path: "/database/shop_items.json",         type: "jsonc"}
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
        await FileData.load(FILES);
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

    const [
        EventBus,
        Logger,
        TrackerSettingsWindow,
        StateStorage,
        RandomizerOptionsWindow
    ] = await $import.module([
        // consts
        "/emcJS/util/events/EventBus.js",
        "/emcJS/util/Logger.js",
        "/script/ui/TrackerSettingsWindow.js",
        "/script/storage/StateStorage.js",
        "/script/ui/RandomizerOptionsWindow.js",
        // untracked
        "/emcJS/ui/TextEditor.js",
        "/emcJS/ui/LogScreen.js",
        "/emcJS/ui/Icon.js",
        "/emcJS/ui/selection/ChoiceSelect.js",
        "/emcJS/ui/layout/Layout.js",
        "/emcJS/ui/layout/TabView.js",
        "/script/ui/items/ItemGrid.js",
        "/script/ui/dungeonstate/DungeonState.js",
        "/script/ui/locations/LocationList.js",
        "/script/ui/map/Map.js",
        "/script/ui/LocationStatus.js",
        "/script/content/Tracker.js",
        "/script/content/EditorChoice.js"
    ]);
    
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
        logPanel.style.overflow = "hidden";
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
    notePad.value = StateStorage.readNotes();
    notePad.addEventListener("change", function() {
        StateStorage.writeNotes(notePad.value);
    });
    EventBus.register("state", function(event) {
        notePad.value = event.data.notes || "";
    });

    updateLoadingMessage("initialize settings...");
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RandomizerOptionsWindow = new RandomizerOptionsWindow();

    updateLoadingMessage("add modules...");
    await $import.module([
        "/script/ui/shops/ShopList.js",
        "/script/ui/songs/SongList.js",
        "/script/ui/multiplayer/Multiplayer.js",
        "/script/ui/LayoutContainer.js"
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