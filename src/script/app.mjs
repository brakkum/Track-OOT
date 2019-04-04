/*
    starting point for application
*/

import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import loadData from "/script/util/loader.mjs";
import I18n from "/script/util/I18n.mjs";
import Logic from "/script/util/Logic.mjs";

import "/deepJS/ui/Paging.mjs";


(async function main() {

    updateLoadingMessage("load data...");
    await loadData();
    updateLoadingMessage("learn languages...");
    await I18n.load(DeepLocalStorage.get("settings", "language", "en_us"));
    updateLoadingMessage("build logic data...");
    Logic.loadLogic();
    updateLoadingMessage("poke application...");
    await $import.importModule("/deepJS/ui/Import.mjs");

}());