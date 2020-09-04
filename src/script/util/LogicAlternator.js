import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Logic from "/script/util/Logic.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";

const SettingsStorage = new IDBStorage('settings');
const LogicsStorage = new IDBStorage('logics');
const GraphStorage = new IDBStorage("edges");
const LogicsStorageGlitched = new IDBStorage('logics_glitched');
const GraphStorageGlitched = new IDBStorage("edges_glitched");

const ENTRANCE_SHUFFLE_RESOLVER_LIST = {
    "entrance_shuffle_off": [],
    "entrance_shuffle_dungeons": [
        "dungeon"
    ],
    "entrance_shuffle_simple": [
        "dungeon",
        "interior.simple",
        "grotto.simple"
    ],
    "entrance_shuffle_indoors": [
        "dungeon",
        "interior.simple",
        "grotto.simple",
        "interior.extended",
        "grotto.extended"
    ],
    "entrance_shuffle_all": [
        "dungeon",
        "interior.simple",
        "grotto.simple",
        "interior.extended",
        "grotto.extended",
        "overworld"
    ],
};

let logic_rules = "logic_rules_glitchless";
let entrance_shuffle = "entrance_shuffle_off";
let exit_binding = {};
let use_custom_logic = false;

// register event on exit target change
EventBus.register("exit_change", event => {
    let types = FileData.get("exit_types", {});
    let source = event.data.source;
    let target = event.data.target;
    let reroute = event.data.reroute;
    let entrance = event.data.entrance;

    let edgeThere = `${source} -> ${target}`;
    let edgeBack = `${reroute} -> ${entrance}`;

    if (types[edgeThere].split(".")[0] == types[edgeBack].split(".")[0]) {
        // set local binding
        exit_binding[`${source} -> ${target}`] = reroute;
        exit_binding[`${reroute} -> ${entrance}`] = source;
        // write to storage
        StateStorage.writeExtra("entrances", `${source} -> ${target}`, reroute);
        StateStorage.writeExtra("entrances", `${reroute} -> ${entrance}`, source);
        // apply if possible
        let shuffled = ENTRANCE_SHUFFLE_RESOLVER_LIST[entrance_shuffle];
        if (shuffled.indexOf(types[edgeThere]) >= 0) {
            Logic.setTranslation(source, target, reroute);
            Logic.setTranslation(reroute, entrance, source);
        }
    }
});
// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    let changed = false;
    if (event.data.hasOwnProperty("option.logic_rules") && logic_rules != event.data["option.logic_rules"]) {
        logic_rules = event.data["option.logic_rules"];
        changed = true;
    }
    if (event.data.hasOwnProperty("option.entrance_shuffle") && entrance_shuffle != event.data["option.entrance_shuffle"]) {
        entrance_shuffle = event.data["option.entrance_shuffle"];
        changed = true;
    }
    if (!!changed) {
        updateLogic();
    }
});
// register event for (de-)activate custom logic
EventBus.register("settings", async event => {
    if (event.data.hasOwnProperty('use_custom_logic')) {
        if (use_custom_logic != event.data.use_custom_logic) {
            use_custom_logic = event.data.use_custom_logic;
            LogicViewer.customLogic = !!use_custom_logic;
            updateLogic();
        }
    }
});
// register event for changing custom logic
EventBus.register("custom_logic", async event => {
    // TODO make logic editor fire this event on logic changed if you exit editor
    if (use_custom_logic) {
        updateLogic();
    }
});

async function updateLogic() {
    if (logic_rules == "logic_rules_glitchless") {
        let logic = FileData.get("logic", {edges:{},logic:{}});
        if (use_custom_logic) {
            let customEdges = await GraphStorage.getAll();
            for (let l in customEdges) {
                let value = customEdges[l];
                let [key, target] = l.split(" -> ");
                logic.edges[key] = logic.edges[key] || {};
                logic.edges[key][target] = value;
            }
            let customLogic = await LogicsStorage.getAll();
            for (let l in customLogic) {
                logic.logic[l] = customLogic[l];
            }
        }
        Logic.setLogic(logic, true);
    } else {
        let logic = FileData.get("logic_glitched", {edges:{},logic:{}});
        if (use_custom_logic) {
            let customEdges = await GraphStorageGlitched.getAll();
            for (let l in customEdges) {
                let value = customEdges[l];
                let [key, target] = l.split(" -> ");
                logic.edges[key] = logic.edges[key] || {};
                logic.edges[key][target] = value;
            }
            let customLogic = await LogicsStorageGlitched.getAll();
            for (let l in customLogic) {
                logic.logic[l] = customLogic[l];
            }
        }
        Logic.setLogic(logic, true);
    }
    /* rewrite the edge from [source] to [target], so it instead links to [reroute] */
    let shuffled = ENTRANCE_SHUFFLE_RESOLVER_LIST[entrance_shuffle];
    for (let l in exit_binding) {
        if (shuffled.indexOf(types[l]) >= 0) {
            let reroute = exit_binding[i];
            let [source, target] = l.split(" -> ");
            Logic.setTranslation(source, target, reroute);
        }
    }
}

async function initOptionSet() {
    console.error("LogicAlternator had to initialize options, check converters and state creation calls");
    let options = FileData.get("randomizer_options");
    let def_state = {};
    for (let i in options) {
        for (let j in options[i]) {
            let v = options[i][j].default;
            if (Array.isArray(v)) {
                v = new Set(v);
                options[i][j].values.forEach(el => {
                    def_state[el] = v.has(el);
                });
            } else {
                def_state[j] = v;
            }
        }
    }
    StateStorage.write(def_state);
}

class LogicAlternator {

    async init() {
        let settings = FileData.get("settings", {});
		let initState = StateStorage.read("option.starting_age", true);
		if(initState === true) {
			initOptionSet(); // should never be reached
        }
        logic_rules = StateStorage.read("option.logic_rules");
        entrance_shuffle = StateStorage.read("option.entrance_shuffle");
        exit_binding = StateStorage.getAllExtra("entrances");
        use_custom_logic = await SettingsStorage.get("use_custom_logic", settings["use_custom_logic"].default);
        await updateLogic();
    }

}

export default new LogicAlternator();