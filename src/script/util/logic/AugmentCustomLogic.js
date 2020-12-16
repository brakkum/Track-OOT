import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Logic from "/script/util/logic/Logic.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";

const SettingsStorage = new IDBStorage('settings');
const LogicsStorage = new IDBStorage('logics');
const GraphStorage = new IDBStorage("edges");
const LogicsStorageGlitched = new IDBStorage('logics_glitched');
const GraphStorageGlitched = new IDBStorage("edges_glitched");

let logic_rules = "logic_rules_glitchless";
let use_custom_logic = false;

// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    if (event.data["option.logic_rules"] != null && logic_rules != event.data["option.logic_rules"]) {
        logic_rules = event.data["option.logic_rules"];
        update();
    }
});
// register event for (de-)activate custom logic
EventBus.register("settings", async event => {
    if (event.data['use_custom_logic'] != null) {
        if (use_custom_logic != event.data.use_custom_logic) {
            use_custom_logic = event.data.use_custom_logic;
            LogicViewer.customLogic = !!use_custom_logic;
            update();
        }
    }
});
// register event for changing custom logic
EventBus.register("custom_logic", async event => {
    // TODO make logic editor fire this event on logic changed if you exit editor
    if (use_custom_logic) {
        update();
    }
});

function augmentLogic(logic, customEdges, customLogic) {
    for (const l in customEdges) {
        const value = customEdges[l];
        const [key, target] = l.split(" -> ");
        logic.edges[key] = logic.edges[key] || {};
        logic.edges[key][target] = value;
    }
    for (const l in customLogic) {
        logic.logic[l] = customLogic[l];
    }
}

async function update() {
    if (logic_rules == "logic_rules_glitchless") {
        const logic = FileData.get("logic", {edges:{}, logic:{}});
        if (use_custom_logic) {
            const customEdges = await GraphStorage.getAll();
            const customLogic = await LogicsStorage.getAll();
            augmentLogic(logic, customEdges, customLogic);
        }
        const res = Logic.setLogic(logic, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
        LogicViewer.glitched = false;
    } else {
        const logic = FileData.get("logic_glitched", {edges:{}, logic:{}});
        if (use_custom_logic) {
            const customEdges = await GraphStorageGlitched.getAll();
            const customLogic = await LogicsStorageGlitched.getAll();
            augmentLogic(logic, customEdges, customLogic);
        }
        const res = Logic.setLogic(logic, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
        LogicViewer.glitched = true;
    }
}

class AugmentCustomLogic {

    async init() {
        const settings = FileData.get("settings", {});
        logic_rules = StateStorage.read("option.logic_rules");
        use_custom_logic = await SettingsStorage.get("use_custom_logic", settings["use_custom_logic"].default);
        await update();
    }

}

export default new AugmentCustomLogic();
