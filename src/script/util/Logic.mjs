import DeepLocalStorage from "deepJS/storage/LocalStorage.mjs";
import GlobalData from "deepJS/storage/GlobalData.mjs";
import Logic from "deepJS/util/Logic.mjs";
import TrackerLocalState from "./LocalState.mjs";

function checkLogic(logic) {
    if (!logic || logic == null) return true;
    switch(logic.type) {
        case "mixin":
            return this.checkLogic("mixins", logic.el);
        case "skip":
            let skip = TrackerLocalState.read("skips", logic.el, GlobalData.get("settings").skips[logic.el].default);
            if (logic.hasOwnProperty("value")) {
                return skip == logic.value;
            }
            return skip;
        case "option":
            let option = TrackerLocalState.read("options", logic.el, GlobalData.get("settings").options[logic.el].default);
            if (logic.hasOwnProperty("value")) {
                return option == logic.value;
            }
            return option;
        case "item":
            return TrackerLocalState.read("items", logic.el, 0);
        default:
            return false;
    }
}

function getLogic(category, name) {
    if (DeepLocalStorage.get("settings", "general:use_custom_logic", false)
    && GlobalData.get("logic_patched").hasOwnProperty(category)
    && GlobalData.get("logic_patched")[category].hasOwnProperty(name)) {
        return GlobalData.get("logic_patched")[category][name];
    }
    if (GlobalData.get("logic").hasOwnProperty(category)
    && GlobalData.get("logic")[category].hasOwnProperty(name)) {
        return GlobalData.get("logic")[category][name];
    }
}

class TrackerLogic {

    checkLogic(category, name) {
        let logic = getLogic(category, name);
        if (typeof logic == "undefined") {
            return false;
        }
        return Logic.checkLogic(logic, checkLogic.bind(this));
    }

    checkLogicList(category, name, mode) {
        let list = GlobalData.get("locations")[name];
        if (!!mode) {
            list = GlobalData.get("locations")[name][`${category}_${mode}`];
        } else {
            let dType = TrackerLocalState.read("dungeonTypes", name, list.hasmq ? "n" : "v");
            if (dType === "n") {
                let res_v = this.checkLogicList(category, name, "v");
                let res_m = this.checkLogicList(category, name, "mq");
                if (DeepLocalStorage.get("settings", "general:unknown_dungeon_need_both", true)) {
                    return Math.min(res_v, res_m) || res_v || res_m;
                } else {
                    return Math.max(res_v, res_m);
                }
            }
            list = GlobalData.get("locations")[name][`${category}_${dType}`];
        }
    
        let canGet = 0;
        let unopened = 0;
        for (let i in list) {
            if (!list[i].mode || list[i].mode != "scrubsanity" || TrackerLocalState.read("settings", "options:scrubsanity", false)) {
                if (!TrackerLocalState.read(category, i, 0)) {
                    unopened++;
                    if (this.checkLogic(category, i)) {
                        canGet++;
                    }
                }
            }
        }
        if (unopened == 0)
            return 0b000;
        if (canGet == unopened)
            return 0b100;
        if (canGet == 0)
            return 0b001;
        return 0b010;
    }

}

export default new TrackerLogic;