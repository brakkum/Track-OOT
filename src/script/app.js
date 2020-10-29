/*
    starting point for application
*/

import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import World from "/script/util/world/World.js";

import "/script/storage/converter/StateConverter.js";

import "/emcJS/ui/Paging.js";

const SettingsStorage = new IDBStorage('settings');

const FILES = {
    "world":                {path: "/database/world.json",              type: "json"},
    "logic":                {path: "/database/logic.json",              type: "json"},
    "logic_glitched":       {path: "/database/logic_glitched.json",     type: "json"},
    "options_trans":        {path: "/database/options_trans.json",      type: "jsonc"},
    "items":                {path: "/database/items.json",              type: "jsonc"},
    "grids":                {path: "/database/grids.json",              type: "jsonc"},
    "dungeonstate":         {path: "/database/dungeonstate.json",       type: "jsonc"},
    "layouts":              {path: "/database/layouts.json",            type: "jsonc"},
    "songs":                {path: "/database/songs.json",              type: "jsonc"},
    "hints":                {path: "/database/hints.json",              type: "jsonc"},
    "settings":             {path: "/database/settings.json",           type: "jsonc"},
    "rulesets":             {path: "/database/rulesets.json",           type: "jsonc"},
    "randomizer_options":   {path: "/database/randomizer_options.json", type: "jsonc"},
    "spoiler_options":      {path: "/database/spoiler_options.json",    type: "jsonc"},
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
        updateLoadingMessage("initialize states...");
        await StateStorage.init(function() {
            let options = FileData.get("randomizer_options");
            let def_state = {};
            for (let i in options) {
                for (let j in options[i]) {
                    let v = options[i][j].default;
                    if (Array.isArray(v)) {
                        v = new Set(v);
                        options[i][j].values.forEach(el => {
                            def_state[el] = v.has(el);
                        });
                    } else {
                        def_state[j] = v;
                    }
                }
            }
            return def_state;
        }());
        updateLoadingMessage("build world data...");
        World.init();
        updateLoadingMessage("poke application...");
        await init();
    } catch(err) {
        console.error(err);
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
        RandomizerOptionsWindow,
        SpoilerLogWindow,
        AugmentExits,
        AugmentCustomLogic,
    ] = await $import.module([
        // consts
        "/emcJS/util/events/EventBus.js",
        "/emcJS/util/Logger.js",
        "/script/ui/TrackerSettingsWindow.js",
        "/script/ui/RandomizerOptionsWindow.js",
        "/script/ui/SpoilerLogWindow.js",
        "/script/util/logic/AugmentExits.js",
        "/script/util/logic/AugmentCustomLogic.js",
        // untracked
        "/emcJS/ui/TextEditor.js",
        "/emcJS/ui/LogScreen.js",
        "/emcJS/ui/Icon.js",
        "/emcJS/ui/input/ChoiceSelect.js",
        "/emcJS/ui/layout/Layout.js",
        "/emcJS/ui/layout/TabView.js",
        "/script/ui/items/ItemGrid.js",
        "/script/ui/dungeonstate/DungeonState.js",
        "/script/ui/world/LocationList.js",
        "/script/ui/world/Map.js",
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
    EventBus.register("state", function(event) {
        if (event.data.notes != null) {
            notePad.value = event.data.notes;
        }
    });
    notePad.addEventListener("change", function() {
        StateStorage.writeNotes(notePad.value);
    });

    updateLoadingMessage("initialize settings...");
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RandomizerOptionsWindow = new RandomizerOptionsWindow();
    window.SpoilerLogWindow = new SpoilerLogWindow();

    updateLoadingMessage("add modules...");
    await $import.module([
        "/script/ui/shops/ShopList.js",
        "/script/ui/songs/SongList.js",
        "/script/ui/exits/ExitList.js",
        "/script/ui/multiplayer/Multiplayer.js",
        "/script/ui/LayoutContainer.js"
    ]);

    updateLoadingMessage("build logic data...");

    const [LogicCaller] = await $import.module(["/script/util/logic/LogicCaller.js"]);
    await LogicCaller.init();
    await AugmentExits.init();
    await AugmentCustomLogic.init();

    updateLoadingMessage("wake up...");
    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

    // hotkeys
    function openDetached() {
        window.open('detached.html#items', "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
    }
    HotkeyHandler.setAction("detached_window", openDetached, {
        ctrlKey: true,
        altKey: true,
        key: "i"
    });
    /*HotkeyHandler.setAction("undo", StateStorage.undo, {
        ctrlKey: true,
        key: "z"
    });
    HotkeyHandler.setAction("redo", StateStorage.redo, {
        ctrlKey: true,
        key: "y"
    });*/
    window.addEventListener('keydown', function(event) {
        if (HotkeyHandler.callHotkey(event.key, event.ctrlKey, event.altKey, event.shiftKey)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

}