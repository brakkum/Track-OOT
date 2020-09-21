import FileData from "/emcJS/storage/FileData.js";
import LogicGraph from "/emcJS/util/graph/LogicGraph.js";
//import LogicSystem from "/emcJS/util/logic/LogicSystem.js";
//import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterStorage from "/script/storage/FilterStorage.js";

const LOGIC_PROCESSOR = new LogicGraph(true);

let cached_values = {};

EventBus.register("state", event => {
    cached_values = {};
    LOGIC_PROCESSOR.reset();
    let filter = FilterStorage.getAll();
    // keys - value caching
    let dungeonData = FileData.get("dungeonstate/entries");
    cached_values["option.track_keys"] = !!event.data.state["option.track_keys"];
    cached_values["option.track_bosskeys"] = !!event.data.state["option.track_bosskeys"];
    for (let i = 0; i < dungeonData.length; ++i) {
        let dData = dungeonData[i];
        if (!!dData.keys) {
            cached_values[dData.keys] = event.data.state[dData.keys] || 0;
            if (!cached_values["option.track_keys"]) {
                event.data.state[dData.keys] = 9999;
            }
        }
        if (!!dData.bosskey) {
            cached_values[dData.bosskey] = event.data.state[dData.bosskey] || 0;
            if (!cached_values["option.track_bosskeys"]) {
                event.data.state[dData.bosskey] = 9999;
            }
        }
    }
    // ---------------------------------------------------------
    LOGIC_PROCESSOR.setAll(event.data.state);
    LOGIC_PROCESSOR.setAll(filter);
    let res = LOGIC_PROCESSOR.traverse("region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("statechange", event => {
    let changed = {};
    for (let i in event.data) {
        changed[i] = event.data[i].newValue;
    }
    // keys - cache values
    let dungeonData = FileData.get("dungeonstate/entries");
    for (let i = 0; i < dungeonData.length; ++i) {
        let dData = dungeonData[i];
        if (!!dData.keys && changed.hasOwnProperty(dData.keys)) {
            cached_values[dData.keys] = changed[dData.keys];
        }
        if (!!dData.bosskey && changed.hasOwnProperty(dData.bosskey)) {
            cached_values[dData.bosskey] = changed[dData.bosskey];
        }
    }
    // keys - apply values
    if (changed.hasOwnProperty("option.track_keys") && cached_values["option.track_keys"] != changed["option.track_keys"]) {
        cached_values["option.track_keys"] = changed["option.track_keys"];
        if (!cached_values["option.track_keys"]) {
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.keys) {
                    changed[dData.keys] = 9999;
                }
            }
        } else {
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.keys) {
                    changed[dData.keys] = cached_values[dData.keys] || 0;
                }
            }
        }
    }
    if (changed.hasOwnProperty("option.track_bosskeys") && cached_values["option.track_bosskeys"] != changed["option.track_bosskeys"]) {
        cached_values["option.track_bosskeys"] = changed["option.track_bosskeys"];
        if (!cached_values["option.track_bosskeys"]) {
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.bosskey) {
                    changed[dData.bosskey] = 9999;
                }
            }
        } else {
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.bosskey) {
                    changed[dData.bosskey] = cached_values[dData.bosskey] || 0;
                }
            }
        }
    }
    // ---------------------------------------------------------
    LOGIC_PROCESSOR.setAll(changed);
    let res = LOGIC_PROCESSOR.traverse("region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("filter", event => {
    LOGIC_PROCESSOR.set(event.data.name, event.data.value);
    let res = LOGIC_PROCESSOR.traverse("region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

class TrackerLogic {

    async init() {
        try {
            let randoLogic = FileData.get("logic", {edges:{},logic:{}});
            //LOGIC_PROCESSOR.clearLogic();
            LOGIC_PROCESSOR.load(randoLogic);
            let data = StateStorage.getAll();
            // keys - value caching
            let dungeonData = FileData.get("dungeonstate/entries");
            cached_values["option.track_keys"] = !!data["option.track_keys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.keys) {
                    cached_values[dData.keys] = data[dData.keys] || 0;
                    if (!cached_values["option.track_keys"]) {
                        data[dData.keys] = 9999;
                    }
                }
            }
            cached_values["option.track_bosskeys"] = !!data["option.track_bosskeys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.bosskey) {
                    cached_values[dData.bosskey] = data[dData.bosskey] || 0;
                    if (!cached_values["option.track_bosskeys"]) {
                        data[dData.bosskey] = 9999;
                    }
                }
            }
            // ---------------------------------------------------------
            LOGIC_PROCESSOR.setAll(data);
            LOGIC_PROCESSOR.traverse("region.root");
        } catch(err) {
            console.error(err);
            window.alert(err.message);
        }
    }

    setLogic(logic, reset = false) {
        if (!!logic) {
            if (!!reset) {
                LOGIC_PROCESSOR.clearGraph();
            }
            LOGIC_PROCESSOR.load(logic);
            let res = LOGIC_PROCESSOR.traverse("region.root");
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        }
    }

    setTranslation(source, target, reroute) {
        if (Array.isArray(source)) {
            for (let t of source) {
                LOGIC_PROCESSOR.setTranslation(t.source, t.target, t.reroute);
            }
        } else {
            LOGIC_PROCESSOR.setTranslation(source, target, reroute);
        }
        let res = LOGIC_PROCESSOR.traverse("region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }

    execute(data) {
        if (!!data) {
            // keys - value caching
            let dungeonData = FileData.get("dungeonstate/entries");
            cached_values["option.track_keys"] = !!data["option.track_keys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.keys) {
                    cached_values[dData.keys] = data[dData.keys] || 0;
                    if (!cached_values["option.track_keys"]) {
                        data[dData.keys] = 9999;
                    }
                }
            }
            cached_values["option.track_bosskeys"] = !!data["option.track_bosskeys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                let dData = dungeonData[i];
                if (!!dData.bosskey) {
                    cached_values[dData.bosskey] = data[dData.bosskey] || 0;
                    if (!cached_values["option.track_bosskeys"]) {
                        data[dData.bosskey] = 9999;
                    }
                }
            }
            // ---------------------------------------------------------
            LOGIC_PROCESSOR.setAll(data);
            let res = LOGIC_PROCESSOR.traverse("region.root");
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        }
    }

    getValue(ref) {
        return LOGIC_PROCESSOR.get(ref);
    }

    getAll() {
        return LOGIC_PROCESSOR.getAll();
    }

}

export default new TrackerLogic();