import FileData from "/emcJS/storage/FileData.js";
import LogicGraph from "/emcJS/util/graph/LogicGraph.js";
//import LogicSystem from "/emcJS/util/logic/LogicSystem.js";
//import LogicProcessor from "/emcJS/util/logic/Processor.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterStorage from "/script/storage/FilterStorage.js";

const LOGIC_PROCESSOR = new LogicGraph(true);

EventBus.register("state", event => {
    LOGIC_PROCESSOR.reset();
    let filter = FilterStorage.getAll();
    LOGIC_PROCESSOR.setAll(event.data);
    LOGIC_PROCESSOR.setAll(filter);
    let res = LOGIC_PROCESSOR.traverse("region.root");
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

    constructor() {
        try {
            let randoLogic = FileData.get("logic", {edges:{},logic:{}});
            //LOGIC_PROCESSOR.clearLogic();
            LOGIC_PROCESSOR.load(randoLogic);
            let data = StateStorage.getAll();
            LOGIC_PROCESSOR.setAll(data);
            LOGIC_PROCESSOR.traverse("region.root");
        } catch(err) {
            console.error(err);
            window.alert(err.message);
        }
    }

    setLogic(logic) {
        if (!!logic) {
            LOGIC_PROCESSOR.load(logic);
            let res = LOGIC_PROCESSOR.traverse("region.root");
            if (Object.keys(res).length > 0) {
                EventBus.trigger("logic", res);
            }
        }
    }

    execute(data) {
        if (!!data) {
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