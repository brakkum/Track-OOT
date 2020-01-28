import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import LogicUIAbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import GlobalData from "/emcJS/storage/GlobalData.js";
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
        EventBus.register("state", event => {
            RANDO_LOGIC_PROCESSOR.reset();
            // TODO add filter back
            RANDO_LOGIC_PROCESSOR.setAll(event.data);
            let res = RANDO_LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("state_change", event => {
            let changed = {};
            for (let i in event.data) {
                changed[i] = event.data[i].newValue;
            }
            RANDO_LOGIC_PROCESSOR.setAll(changed);
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