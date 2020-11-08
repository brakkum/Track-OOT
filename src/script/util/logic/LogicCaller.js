import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "./Logic.js";

let cached_values = {};

EventBus.register("state", event => {
    cached_values = {};
    Logic.reset();
    let filter = FilterStorage.getAll();
    let data = Object.assign(filter, event.data.state);
    // keys - value caching
    let dungeonData = FileData.get("dungeonstate/entries");
    cached_values["option.track_keys"] = !!data["option.track_keys"];
    cached_values["option.track_bosskeys"] = !!data["option.track_bosskeys"];
    for (let i = 0; i < dungeonData.length; ++i) {
        let dData = dungeonData[i];
        if (!!dData.keys) {
            cached_values[dData.keys] = data[dData.keys] || 0;
            if (!cached_values["option.track_keys"]) {
                data[dData.keys] = 9999;
            }
        }
        if (!!dData.bosskey) {
            cached_values[dData.bosskey] = data[dData.bosskey] || 0;
            if (!cached_values["option.track_bosskeys"]) {
                data[dData.bosskey] = 9999;
            }
        }
    }
    // ---------------------------------------------------------
    let res = Logic.execute(data, "region.root");
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
    }
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
    // bosskeys - apply values
    if (changed.hasOwnProperty("option.track_bosskeys") && cached_values["option.track_bosskeys"] != changed["option.track_bosskeys"]) {
        cached_values["option.track_bosskeys"] = changed["option.track_bosskeys"];
    }
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
    // ---------------------------------------------------------
    let res = Logic.execute(changed, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("filter", event => {
    const data = {};
    data[event.data.name] = event.data.value;
    let res = Logic.execute(data, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

class LogicCaller {

    async init() {
        try {
            let randoLogic = FileData.get("logic", {edges:{},logic:{}});
            //LOGIC_PROCESSOR.clearLogic();
            Logic.setLogic(randoLogic);
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
            Logic.execute(data, "region.root");
        } catch(err) {
            console.error(err);
            window.alert(err.message);
        }
    }

}

export default new LogicCaller();