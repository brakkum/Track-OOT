/*
    starting point for application
*/

import DeepLocalStorage from "/deepJS/storage/LocalStorage.js";
import loadData from "/script/util/loader.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";

import "/deepJS/ui/Paging.js";


(async function main() {

    updateLoadingMessage("load data...");
    await loadData();
    updateLoadingMessage("learn languages...");
    await I18n.load(DeepLocalStorage.get("settings", "language", "en_us"));
    updateLoadingMessage("build logic data...");
    Logic.loadLogic();
    updateLoadingMessage("poke application...");
    await $import.importModule("/deepJS/ui/Import.js");

}());