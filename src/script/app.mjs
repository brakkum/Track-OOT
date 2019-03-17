/*
    starting point for application
*/

import "/script/_vendor/custom-elements.min.js";

import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import loadData from "/script/util/loader.mjs";
import I18n from "/script/util/I18n.mjs";
import Logic from "/script/util/Logic.mjs";

import "/deepJS/ui/Paging.mjs";
import LogicWrapper from "./util/LogicWrapper.mjs";


(async function main() {

    await loadData();
    await I18n.load(DeepLocalStorage.get("settings", "language", "en_us"));
    loadLogic();
    await importModule("/deepJS/ui/Import.mjs");

}());

function loadLogic() {
    const CATEGORIES = {
        "chests_v": "chests",
        "chests_mq": "chests",
        "skulltulas_v": "skulltulas",
        "skulltulas_mq": "skulltulas",
        "gossipstones_v": "gossipstones"
    };
    let locations = GlobalData.get("locations");
    for (let loc in locations) {
        for (let cat in CATEGORIES) {
            let category = CATEGORIES[cat];
            let checks = locations[loc][cat];
            if (!!checks) {
                for (let check in checks) {
                    Logic.setLogic(category, check, new LogicWrapper(category, check));
                }
            }
        }
    }
    for (let i in GlobalData.get("logic").mixins) {
        Logic.setLogic("mixins", i, new LogicWrapper("mixins", i));
    }
    for (let i in GlobalData.get("logic_patched").mixins) {
        if (!!Logic.getLogicView("mixins", i)) continue;
        Logic.setLogic("mixins", i, new LogicWrapper("mixins", i));
    }
}