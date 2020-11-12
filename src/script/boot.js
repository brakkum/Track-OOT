
import EventBus from "/emcJS/util/events/EventBus.js";
import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

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

function loadingMessage(msg) {
    console.log(msg);
}

export async function loadResources(updateLoadingMessage = loadingMessage) {
    updateLoadingMessage("load data...");
    await FileData.load(FILES);

    updateLoadingMessage("learn languages...");
    await Language.load(await SettingsStorage.get("language", "en_us"));

    updateLoadingMessage("initialize states...");
    await StateStorage.init(function() {
        const options = FileData.get("randomizer_options");
        const def_state = {};
        for (const i in options) {
            for (const j in options[i]) {
                const value = options[i][j].default;
                if (Array.isArray(value)) {
                    const valueSet = new Set(value);
                    options[i][j].values.forEach(el => {
                        def_state[el] = valueSet.has(el);
                    });
                } else {
                    def_state[j] = value;
                }
            }
        }
        return def_state;
    }());
}

export async function registerWorker() {
    if ("SharedWorker" in window) {
        const EventBusModuleShare = (await import("/emcJS/util/events/EventBusModuleShare.js")).default;
        EventBus.addModule(EventBusModuleShare, {blacklist:["logic"]});
    }
}