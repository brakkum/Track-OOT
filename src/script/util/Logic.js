import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import LogicProcessor from "/deepJS/util/logic/Processor.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import AbstractElement from "/deepJS/ui/logic/elements/AbstractElement.js";
import GlobalData from "/script/storage/GlobalData.js";
import SettingsStorage from "/script/storage/SettingsStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

const LOGIC = new LogicProcessor();

class TrackerLogic {

    constructor() {
        EventBus.register("state_change", event => {
            let data = {
                "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
            };
            data = Object.assign(data, event.data);
            //data = Object.assign(data, await SettingsStorage.getAll());
            let res = LOGIC.execute(data);
            EventBus.trigger("logic", res);
        });
    }

    getValue(ref) {
        return LOGIC.getValue(ref);
    }

    async checkLogicList(name) {
        if (name == "") {
            return 0b001; // no reachable
        }
        let list = GlobalData.get(`world/areas/${name}/locations`);
        let locations = GlobalData.get(`world/locations`);
        /*if (!!mode) {
            list = GlobalData.get("locations")[name][`${category}_${mode}`];
        } else {
            let dType = StateStorage.read(`dungeonTypes.${name}`, list.hasmq ? "n" : "v");
            if (dType === "n") {
                let res_v = await this.checkLogicList(category, name, "v");
                let res_m = await this.checkLogicList(category, name, "mq");
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    return Math.min(res_v, res_m) || res_v || res_m;
                } else {
                    return Math.max(res_v, res_m);
                }
            }
            list = GlobalData.get("locations")[name][`${category}_${dType}`];
        }*/
    
        let canGet = 0;
        let unopened = 0;
        for (let i = 0; i < list.length; ++i) {
            let data = locations[list[i]];
            let filter = MemoryStorage.get("filter.era_active", GlobalData.get("filter/filter.era_active/default"));
            if (!data.era || !filter || filter === data.era) {
                //if (!data.mode || StateStorage.read(`options.${data.mode}`, false)) {
                    if (!StateStorage.read(list[i], 0)) {
                        unopened++;
                        if (this.getValue(data.access)) {
                            canGet++;
                        }
                    }
                //}
            }
        }
        if (unopened == 0)
            return 0b000; // all open
        if (canGet == unopened)
            return 0b100; // all reachable
        if (canGet == 0)
            return 0b001; // no reachable
        return 0b010; // partly reachable
    }

    async getAccessibleNumber(name) {
        if (name != "") return 0;
        let list = GlobalData.get(`world/areas/${name}/locations`);
        let locations = GlobalData.get(`world/locations`);
        let canGet = 0;
        for (let i = 0; i < list.length; ++i) {
            let data = locations[list[i]];
            let filter = MemoryStorage.get("filter.era_active", GlobalData.get("filter/filter.era_active/default"));
            if (!data.era || !filter || filter === data.era) {
                //if (!data.mode || StateStorage.read(`options.${data.mode}`, false)) {
                    if (!StateStorage.read(list[i], 0)) {
                        if (this.getValue(data.access)) {
                            canGet++;
                        }
                    }
                //}
            }
        }
        return canGet;
    }

    async loadLogic() {
        /*let locations = GlobalData.get("locations");
        for (let loc in locations) {
            for (let cat in CATEGORIES) {
                let category = CATEGORIES[cat];
                let checks = locations[loc][cat];
                if (!!checks) {
                    for (let check in checks) {
                        LOGIC[category][check] = new LogicWrapper(category, check);
                    }
                }
            }
        }
        for (let i in GlobalData.get("logic", {mixins:{}}).mixins) {
            LOGIC["mixins"][i] = new LogicWrapper("mixins", i);
        }
        for (let i in await SettingsStorage.get("logic", {mixins:{}}).mixins) {
            if (!!LOGIC["mixins"][i]) continue;
            LOGIC["mixins"][i] = new LogicWrapper("mixins", i);
        }*/
        LOGIC.loadLogic(GlobalData.get("logic", {}));
    }

    updateLogic() {
        /*for (let i in LOGIC) {
            for (let j in LOGIC[i]) {
                LOGIC[i][j].loadLogic();
            }
        }*/
    }

    getLogicSVG(type, ref) {
        //return LOGIC[type][ref].buildSVG();
    }

    getLogicView(ref) {
        let el = document.createElement("div");
        let logic = GlobalData.get(`logic/${ref}`);
        if (!!logic) {
            let data = {
                "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
            };
            data = Object.assign(data, StateStorage.getAll());
            data = Object.assign(data, LOGIC.getValues());
            let l = AbstractElement.buildLogic(logic);
            l.calculate(data);
            l.readonly = true;
            el.append(l);
        }
        return el;
    }

}

export default new TrackerLogic;