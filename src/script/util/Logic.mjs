import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import MemoryStorage from "/deepJS/storage/MemoryStorage.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Logic from "/deepJS/util/Logic.mjs";
import TrackerLocalState from "./LocalState.mjs";

function checkLogic(logic) {
    if (!logic || logic == null) return true;
    switch(logic.type) {
        case "false":
            return false;
        case "true":
            return true;
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
        case "filter":
            let filter = MemoryStorage.get("active_filter", logic.el, GlobalData.get("filter")[logic.el].default);
            if (logic.hasOwnProperty("value")) {
                return filter == logic.value;
            }
            return filter;
        case "item":
            return TrackerLocalState.read("items", logic.el, 0);
        default:
            return false;
    }
}

function getLogic(category, name) {
    if (DeepLocalStorage.get("settings", "use_custom_logic", false)
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
                if (DeepLocalStorage.get("settings", "unknown_dungeon_need_both", false)) {
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
            let filter = MemoryStorage.get("active_filter", "filter_era_active", GlobalData.get("filter")["filter_era_active"].default);
            if (!list[i].era || !filter || filter === list[i].era) {
                if (!list[i].mode || list[i].mode != "scrubsanity" || TrackerLocalState.read("options", "scrubsanity", false)) {
                    if (!TrackerLocalState.read(category, i, 0)) {
                        unopened++;
                        if (this.checkLogic(category, i)) {
                            canGet++;
                        }
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

window.printLogic = function(category, name, followMixins) {
    console.log(printLogicRecursive(getLogic(category, name), 0, followMixins));
}

function printLogicRecursive(logic, level = 0, mixins = false) {
    if (!!mixins && logic.type == "mixin") {
        return printLogicRecursive(getLogic("mixins", logic.el), level)
    } else {
        if (typeof logic.el == "object") {
            if (logic.el == null) {
                return `${(new Array(level+1)).join("\t")} <null>\n`;
            } else if (Array.isArray(logic.el)) {
                // TODO read settings reduce && and ||
                return `${(new Array(level+1)).join("\t")}- ${logic.type}\n${logic.el.map(el => printLogicRecursive(el, level+1)).join("")}`;
            } else {
                return `${(new Array(level+1)).join("\t")}- ${logic.type}\n${printLogicRecursive(logic.el, level+1)}`;
            }
        } else {
            if (typeof logic == "boolean") {
                return `${(new Array(level+1)).join("\t")}${logic?"TRUE":"FALSE"}\n`;
            } else if (typeof logic == "string") {
                return `${(new Array(level+1)).join("\t")}"${logic}"\n`;
            } else if (typeof logic == "number") {
                return `${(new Array(level+1)).join("\t")}${logic}\n`;
            } else {
                return `${(new Array(level+1)).join("\t")}[${logic.type}] ${logic.el}\n`;
            }
        }
    }
}