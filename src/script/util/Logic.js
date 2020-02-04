import GlobalData from "/emcJS/storage/GlobalData.js";
import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import "/script/editor_logic/LiteralMixin.js";
import "/script/editor_logic/LiteralCustom.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

const LOGIC_PROCESSOR = new LogicProcessor();

class TrackerLogic {

    constructor() {
        EventBus.register("state", event => {
            LOGIC_PROCESSOR.reset();
            // TODO add filter back
            LOGIC_PROCESSOR.setAll(event.data);
            let res = LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("state_change", event => {
            let changed = {};
            for (let i in event.data) {
                changed[i] = event.data[i].newValue;
            }
            LOGIC_PROCESSOR.setAll(changed);
            let res = LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("filter", event => {
            LOGIC_PROCESSOR.set(event.data.ref, event.data.value);
            let res = LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        });
        EventBus.register("settings", async event => {
            if (event.data.hasOwnProperty('use_custom_logic') && event.data.use_custom_logic != use_custom_logic) {
                if (event.data.use_custom_logic) {
                    let customLogic = await LogicsStorage.getAll();
                    LOGIC_PROCESSOR.loadLogic(customLogic);
                } else {
                    let randoLogic = GlobalData.get("logic", {});
                    LOGIC_PROCESSOR.loadLogic(randoLogic);
                }
                let res = LOGIC_PROCESSOR.execute();
                if (Object.keys(res).length > 0) {
                    EventBus.trigger("logic", res);
                }
            }
        });
        EventBus.register("custom_logic", async event => {
            // TODO make logic editor fire this event on logic changed if you exit editor
            if (await SettingsStorage.get("use_custom_logic", false)) {
                let randoLogic = GlobalData.get("logic", {});
                LOGIC_PROCESSOR.loadLogic(randoLogic);
                LOGIC_PROCESSOR.loadLogic(event.data);
                let res = LOGIC_PROCESSOR.execute();
                if (Object.keys(res).length > 0) {
                    EventBus.trigger("logic", res);
                }
            }
        });
    }

    async init() {
        let randoLogic = GlobalData.get("logic", {});
        LOGIC_PROCESSOR.loadLogic(randoLogic);
        if (await SettingsStorage.get("use_custom_logic", false)) {
            let customLogic = await LogicsStorage.getAll();
            LOGIC_PROCESSOR.loadLogic(customLogic);
        }
        let data = StateStorage.getAll();
        LOGIC_PROCESSOR.setAll(data);
        LOGIC_PROCESSOR.execute();
    }

    execute(data) {
        if (!!data) {
            LOGIC_PROCESSOR.setAll(data);
            let res = LOGIC_PROCESSOR.execute();
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        }
    }

    getValue(ref) {
        return LOGIC_PROCESSOR.get(ref);
    }

}

export default new TrackerLogic;