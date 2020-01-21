import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import LogicUIAbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import GlobalData from "/script/storage/GlobalData.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import "/script/editor_logic/LiteralMixin.js";
import "/script/editor_logic/LiteralCustom.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

const RANDO_LOGIC_PROCESSOR = new LogicProcessor();
const CUSTOM_LOGIC_PROCESSOR = new LogicProcessor();

let randoLogic = {};
let customLogic = {};
let use_custom_logic = false;

class TrackerLogic {

    constructor() {
        EventBus.register("state_change", event => {
            RANDO_LOGIC_PROCESSOR.setAll(event.data);
            let res = RANDO_LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("filter", event => {
            RANDO_LOGIC_PROCESSOR.set(event.data.ref, event.data.value);
            let res = RANDO_LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("settings", async event => {
            if (event.data.hasOwnProperty('use_custom_logic') && event.data.use_custom_logic != use_custom_logic) {
                use_custom_logic = event.data.use_custom_logic;
                if (use_custom_logic) {
                    let data = StateStorage.getAll();
                    let ldata = RANDO_LOGIC_PROCESSOR.getAll();
                    CUSTOM_LOGIC_PROCESSOR.setAll(data);
                    CUSTOM_LOGIC_PROCESSOR.setAll(ldata);
                    let res = CUSTOM_LOGIC_PROCESSOR.execute();
                    if (Object.keys(res).length > 0) {
                        EventBus.trigger("logic", res);
                    }
                }
            }
        });
        EventBus.register("custom_logic", async event => {
            // TODO make logic editor fire this event on logic changed if you exit editor
            CUSTOM_LOGIC_PROCESSOR.loadLogic(event.data);
            for (let name in event.data) {
                if (event.data[name] == null) {
                    delete customLogic[name];
                } else {
                    customLogic[name] = event.data[name];
                }
            }
            if (!!use_custom_logic) {
                let data = RANDO_LOGIC_PROCESSOR.getAll();
                CUSTOM_LOGIC_PROCESSOR.setAll(data);
                let res = CUSTOM_LOGIC_PROCESSOR.execute();
                if (Object.keys(res).length > 0) {
                    EventBus.trigger("logic", res);
                }
            }
        });
    }

    async init() {
        randoLogic = GlobalData.get("logic", {});
        RANDO_LOGIC_PROCESSOR.loadLogic(randoLogic);
        customLogic = await LogicsStorage.getAll();
        CUSTOM_LOGIC_PROCESSOR.loadLogic(customLogic);
        use_custom_logic = await SettingsStorage.get("use_custom_logic", false);
        let data = StateStorage.getAll();
        this.execute(data);
    }

    execute(data) {
        if (!!data) {
            RANDO_LOGIC_PROCESSOR.setAll(data);
            let res = RANDO_LOGIC_PROCESSOR.execute();
            if (!!use_custom_logic) {
                CUSTOM_LOGIC_PROCESSOR.setAll(data);
                CUSTOM_LOGIC_PROCESSOR.setAll(res);
                let cRes = CUSTOM_LOGIC_PROCESSOR.execute();
                res = Object.assign(res, cRes);
            }
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        }
    }

    getValue(ref) {
        if (!!use_custom_logic && CUSTOM_LOGIC_PROCESSOR.has(ref)) {
            return CUSTOM_LOGIC_PROCESSOR.get(ref);
        }
        return RANDO_LOGIC_PROCESSOR.get(ref);
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
        // TODO implement master quest
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
        // TODO implement master quest
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

    getLogicSVG(ref) {
        let logic = randoLogic[ref];
        if (!!use_custom_logic && customLogic.hasOwnProperty(ref)) {
            logic = customLogic[ref];
        }
        if (!!logic) {
            return LogicUIAbstractElement.buildSVG(logic);
        }
    }

    getLogicView(ref, calc = true) {
        let el = document.createElement("div");
        let logic = randoLogic[ref];
        if (!!use_custom_logic && customLogic.hasOwnProperty(ref)) {
            logic = customLogic[ref];
        }
        if (!!logic) {
            let l = LogicUIAbstractElement.buildLogic(logic);
            if (!!calc) {
                let data = {
                    "filter.era_active": MemoryStorage.get('filter.era_active', GlobalData.get("filter/filter.era_active/default"))
                };
                data = Object.assign(data, StateStorage.getAll());
                data = Object.assign(data, RANDO_LOGIC_PROCESSOR.getAll());
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