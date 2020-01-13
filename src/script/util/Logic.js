import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import AbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import GlobalData from "/script/storage/GlobalData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import "/script/editor_logic/LiteralMixin.js";
import "/script/editor_logic/LiteralCustom.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

const RANDO_LOGIC_PROCESSOR = new LogicProcessor();

let randoLogic = {};

class TrackerLogic {

    constructor() {
        EventBus.register("state_change", event => {
            let data = {
                "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
            };
            data = Object.assign(data, event.data);
            this.execute(data);
        });
        EventBus.register("settings", async event => {
            this.loadLogic();
        });
    }

    execute(data) {
        if (!data) {
            data = {
                "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
            };
            data = Object.assign(data, StateStorage.getAll());
        }
        let res = RANDO_LOGIC_PROCESSOR.execute(data);
        EventBus.trigger("logic", res);
    }

    getValue(ref) {
        return RANDO_LOGIC_PROCESSOR.getValue(ref);
    }

    async checkLogicList(name) {
        if (name == "") {
            return 0b001; // no reachable
        }
        let list = GlobalData.get(`world/areas/${name}/locations`);
        if (!list) {
            return 0b001; // no reachable
        }
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
        if (name == "") {
            return 0;
        }
        let list = GlobalData.get(`world/areas/${name}/locations`);
        if (!list) {
            return 0;
        }
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
        randoLogic = GlobalData.get("logic", {});
        if (await SettingsStorage.get("use_custom_logic", false)) {
            Object.assign(randoLogic, await LogicsStorage.getAll());
        }
        RANDO_LOGIC_PROCESSOR.loadLogic(randoLogic);
        this.execute();
    }

    getLogicSVG(ref) {
        let logic = randoLogic[ref];
        if (!!logic) {
            return AbstractElement.buildSVG(logic);
        }
    }

    getLogicView(ref, calc = true) {
        let el = document.createElement("div");
        let logic = randoLogic[ref];
        if (!!logic) {
            let l = AbstractElement.buildLogic(logic);
            if (!!calc) {
                let data = {
                    "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
                };
                data = Object.assign(data, StateStorage.getAll());
                data = Object.assign(data, RANDO_LOGIC_PROCESSOR.getValues());
                l.calculate(data);
            }
            l.readonly = true;
            el.append(l);
        }
        return el;
    }

}

export default new TrackerLogic;


// TODO
function showLogic(ref, title) {
    let l = Logic.getLogicView(ref);
    if (!!l) {
        let d = new Dialog({
            title: I18n.translate(title),
            submit: "OK"
        });
        d.value = ref;
        d.append(l);
        d.show();
    }
}

async function printLogic(ref) {
    let svg = Logic.getLogicSVG(ref);
    let png = await Helper.svg2png(svg);
    let svg_win = window.open("", "_blank", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no");
    let img = document.createElement("img");
    img.src = png;
    svg_win.document.body.append(img);
}