/*
    starting point for application
*/

import "/script/_vendor/custom-elements.min.js";

import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import loadData from "/script/util/loader.mjs";
import I18n from "/script/util/I18n.mjs";

import "/deepJS/ui/Paging.mjs";


(async function main() {

    await loadData();
    await I18n.load(DeepLocalStorage.get("settings", "language", "en_us"));
    await importModule("/deepJS/ui/Import.mjs");

}());