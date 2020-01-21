/*
    starting point for application
*/

import TrackerStorage from "/script/storage/TrackerStorage.js";
import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";

import "/emcJS/ui/Paging.js";

const SettingsStorage = new TrackerStorage('settings');

(async function main() {

    updateLoadingMessage("load data...");
    await GlobalData.init();
    updateLoadingMessage("learn languages...");
    await I18n.load(await SettingsStorage.get("language", "en_us"));
    updateLoadingMessage("build logic data...");
    await Logic.init();
    updateLoadingMessage("poke application...");
    await $import.importModule("/emcJS/ui/Import.js");

}());