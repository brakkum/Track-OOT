import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Logic from "/script/util/Logic.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";

const SettingsStorage = new IDBStorage('settings');
const LogicsStorage = new IDBStorage('logics');
let GraphStorage = new IDBStorage("edges");

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
        StateStorage.setEntranceRewrite(source, target, reroute);
        StateStorage.setEntranceRewrite(reroute, entrance, source);
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
    if (event.data.hasOwnProperty("option.entrance_shuffle") && entrance_shuffle != event.data["option.entrance_shuffle"]) {
        entrance_shuffle = event.data["option.entrance_shuffle"];
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
    Logic.setLogic(logic);
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

class LogicAlternator {

    async init() {
        let settings = FileData.get("settings", {});
        entrance_shuffle = StateStorage.read("option.entrance_shuffle");
        exit_binding = StateStorage.getAllEntranceRewrites();
        use_custom_logic = await SettingsStorage.get("use_custom_logic", settings["use_custom_logic"].default);
        await updateLogic();
    }

}

export default new LogicAlternator();