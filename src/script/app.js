/*
    starting point for application
*/

import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import StateStorage from "/script/storage/StateStorage.js";
import World from "/script/util/world/World.js";

import {loadResources, registerWorker} from "/script/boot.js";

import "/script/storage/converter/StateConverter.js";

import "/emcJS/ui/Paging.js";

function setVersion(data) {
    MemoryStorage.set("version-dev", data.dev);
    if (data.dev) {
        MemoryStorage.set("version-string", `DEV [${data.commit.slice(0, 7)}]`);
    } else {
        MemoryStorage.set("version-string", data.version);
    }
    MemoryStorage.set("version-date", DateUtil.convert(new Date(data.date), "D.M.Y h:m:s"));
}

function setDevs(data) {
    MemoryStorage.set("devs-owner", data.owner);
    MemoryStorage.set("devs-team", data.team);
    MemoryStorage.set("devs-contributors", data.contributors);
}

(async function main() {
    try {
        setVersion(await FileLoader.json("version.json"));
        setDevs(await FileLoader.json("devs.json"));
        // initial boot
        await loadResources(updateLoadingMessage); // eslint-disable-line no-undef
        // ---
        updateLoadingMessage("build world data..."); // eslint-disable-line no-undef
        World.init();
        updateLoadingMessage("poke application..."); // eslint-disable-line no-undef
        await init();
    } catch(err) {
        console.error(err);
        updateLoadingMessage(err.message.replace(/\n/g, "<br>")); // eslint-disable-line no-undef
    }
}());

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

async function init() {
    const [
        LogicCaller,
        AugmentExits,
        AugmentCustomLogic
    ] = await $import.module([ // eslint-disable-line no-undef
        "/script/util/logic/LogicCaller.js",
        "/script/util/logic/AugmentExits.js",
        "/script/util/logic/AugmentCustomLogic.js"
    ]);

    updateLoadingMessage("build logic data..."); // eslint-disable-line no-undef
    await AugmentExits.init();
    await AugmentCustomLogic.init();
    await LogicCaller.init();

    updateLoadingMessage("load visuals..."); // eslint-disable-line no-undef
    const [
        EventBus,
        Logger,
        TrackerSettingsWindow,
        RandomizerOptionsWindow,
        SpoilerLogWindow
    ] = await $import.module([ // eslint-disable-line no-undef
        // consts
        "/emcJS/util/events/EventBus.js",
        "/emcJS/util/Logger.js",
        "/script/ui/TrackerSettingsWindow.js",
        "/script/ui/RandomizerOptionsWindow.js",
        "/script/ui/SpoilerLogWindow.js",
        // untracked
        "/emcJS/ui/input/TextEditor.js",
        "/emcJS/ui/LogScreen.js",
        "/emcJS/ui/Icon.js",
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
    
    await registerWorker();

    updateLoadingMessage("apply logger..."); // eslint-disable-line no-undef
    if (MemoryStorage.get("version-dev")) {
        const logPanel = document.createElement("div");
        logPanel.setAttribute("slot", "log");
        logPanel.dataset.title = "Logger";
        logPanel.dataset.icon = "images/icons/log.svg";
        logPanel.style.overflow = "hidden";
        const logScreen = document.createElement("emc-logscreen");
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

    updateLoadingMessage("initialize components..."); // eslint-disable-line no-undef
    const notePad = document.getElementById("notes-editor");
    notePad.value = StateStorage.readNotes();
    EventBus.register("state", function(event) {
        if (event.data.notes != null) {
            notePad.value = event.data.notes;
        }
    });
    notePad.addEventListener("change", function() {
        StateStorage.writeNotes(notePad.value);
    });

    updateLoadingMessage("initialize settings..."); // eslint-disable-line no-undef
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RandomizerOptionsWindow = new RandomizerOptionsWindow();
    window.SpoilerLogWindow = new SpoilerLogWindow();

    updateLoadingMessage("add modules..."); // eslint-disable-line no-undef
    await $import.module([ // eslint-disable-line no-undef
        "/script/ui/shops/ShopList.js",
        "/script/ui/songs/SongList.js",
        "/script/ui/exits/ExitList.js",
        "/script/ui/multiplayer/Multiplayer.js",
        "/script/ui/LayoutContainer.js"
    ]);

    updateLoadingMessage("wake up..."); // eslint-disable-line no-undef
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }
    
    // hotkeys
    function openDetached() {
        window.open('/detached/#items', "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
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
