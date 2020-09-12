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

let logic_rules = "logic_rules_glitchless";
let entrance_shuffle = "entrance_shuffle_off";
let exit_binding = {};
let use_custom_logic = false;

// register event on exit target change
EventBus.register("statechange_exits", event => {
    let exits = FileData.get("exits");
    let changes = [];
    for (let edgeThere in event.data) {
        let edgeBack = event.data[edgeThere].newValue;
        let [source, target] = edgeThere.split(" -> ");
        let [reroute, entrance] = edgeBack.split(" -> ");
        let edgeThereData = exits[edgeThere];
        if (edgeThereData == null) {
            edgeThereData = exits[`${target} -> ${source}`];
        }
        let edgeBackData = exits[edgeBack];
        if ((edgeBackData == null || edgeThereData.type == edgeBackData.type) && edgeThereData.active.indexOf(entrance_shuffle) >= 0) {
            if (exit_binding[edgeThere] != reroute) {
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                changes.push({source: `${reroute}[child]`, target: `${entrance}[child]`, reroute: `${source}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
                changes.push({source: `${reroute}[adult]`, target: `${entrance}[adult]`, reroute: `${source}[adult]`});
                exit_binding[edgeThere] = reroute;
                exit_binding[edgeBack] = source;
                StateStorage.writeExtra("exits", edgeBack, edgeThere);
            }
        }
    }
    if (!!changes.length) {
        Logic.setTranslation(changes);
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
    updateEntrances();
}

function updateEntrances() {
    let exits = FileData.get("exits");
    let changes = [];
    for (let exit in exit_binding) {
        let [source, target] = exit.split(" -> ");
        let edgeData = exits[exit];
        if (edgeData == null) {
            edgeData = exits[`${target} -> ${source}`];
        }
        if (edgeData.active.indexOf(entrance_shuffle) >= 0) {
            let reroute = exit_binding[exit];
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
        } else {
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${target}[child]`});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${target}[adult]`});
        }
    }
    if (!!changes.length) {
        Logic.setTranslation(changes);
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
        let exits = StateStorage.getAllExtra("exits");
        for (let exit in exits) {
            exit_binding[exit] = exits[exit].split(" -> ")[0]
        }
        use_custom_logic = await SettingsStorage.get("use_custom_logic", settings["use_custom_logic"].default);
        await updateLogic();
    }

}

export default new LogicAlternator();