/*
    starting point for application
*/

import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import GlobalData from "/emcJS/storage/GlobalData.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import I18n from "/script/util/I18n.js";
import LogicAlternator from "/script/util/LogicAlternator.js";
import World from "/script/util/World.js";

import "/emcJS/ui/Paging.js";

const SettingsStorage = new TrackerStorage('settings');

const FILES = {
    "items": "/database/items.json",
    "grids": "/database/grids.json",
    "dungeonstate": "/database/dungeonstate.json",
    "world": "/database/world.json",
    "world_lists": "/database/world_lists.json",
    "layouts": "/database/layouts.json",
    "songs": "/database/songs.json",
    "hints": "/database/hints.json",
    "logic": "/database/logic.json",
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
        await GlobalData.load(FILES);
        setVersion(await FileLoader.json("version.json"));
        updateLoadingMessage("learn languages...");
        await I18n.load(await SettingsStorage.get("language", "en_us"));
        updateLoadingMessage("build logic data...");
        await LogicAlternator.init();
        updateLoadingMessage("build world data...");
        World.init();
        updateLoadingMessage("poke application...");
        await $import.importModule("/emcJS/ui/Import.js");
    } catch(err) {
        updateLoadingMessage(err.message.replace(/\n/g, "<br>"));
    }

}());