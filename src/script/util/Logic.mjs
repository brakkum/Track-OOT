import GlobalData from "/deepJS/storage/GlobalData.mjs";
import MemoryStorage from "/deepJS/storage/MemoryStorage.mjs";
import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

const LOGIC = {
    chests: {},
    skulltulas: {},
    gossipstones: {},
    mixins: {}
};

class TrackerLogic {

    getValue(type, ref) {
        if (!!LOGIC[type] && !!LOGIC[type][ref]) {
            return LOGIC[type][ref].value;
        }
        return false;
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
                if (!list[i].mode || TrackerLocalState.read("options", list[i].mode, false)) {
                    if (!TrackerLocalState.read(category, i, 0)) {
                        unopened++;
                        if (this.getValue(category, i)) {
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

    setLogic(type, ref, logic) {
        LOGIC[type][ref] = logic;
    }


    getLogicView(type, ref) {
        return LOGIC[type][ref].getLogic();
    }

}

export default new TrackerLogic;