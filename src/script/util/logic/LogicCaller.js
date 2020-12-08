import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "./Logic.js";

const ACCEPTED_KEY_GROUPS = [
    "dungeon",
    "gerudo",
    "ganon"
];

const ACCEPTED_BOSSKEY_GROUPS = [
    "dungeon",
    "ganon"
];

let cached_values = {};

EventBus.register("state", event => {
    cached_values = {};
    Logic.reset();
    const filter = FilterStorage.getAll();
    const data = Object.assign(filter, event.data.state);
    // dungeonstate
    const dungeonData = FileData.get("dungeonstate/entries");
    cached_values["option.track_keys"] = !!data["option.track_keys"];
    cached_values["option.track_bosskeys"] = !!data["option.track_bosskeys"];
    for (let i = 0; i < dungeonData.length; ++i) {
        const dData = dungeonData[i];
        // keys - value caching
        if (!!dData.keys) {
            cached_values[dData.keys] = data[dData.keys] || 0;
            if (ACCEPTED_KEY_GROUPS.includes(dData.keys_group) && !cached_values["option.track_keys"]) {
                data[dData.keys] = 9999;
            }
        }
        if (!!dData.bosskey) {
            cached_values[dData.bosskey] = data[dData.bosskey] || 0;
            if (ACCEPTED_BOSSKEY_GROUPS.includes(dData.bosskey_group) && !cached_values["option.track_bosskeys"]) {
                data[dData.bosskey] = 9999;
            }
        }
        // dungeon types
        if (!!dData.hasmq) {
            if (event.data.extra.dungeontype != null) {
                const state = event.data.extra.dungeontype[this.ref];
                if (typeof state != "undefined" && state != "") {
                    data[`dungeontype.${dData.ref}`] = state;
                } else {
                    data[`dungeontype.${dData.ref}`] = "n";
                }
            }
        }
    }
    // ---------------------------------------------------------
    const res = Logic.execute(data, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("statechange", event => {
    const changed = {};
    for (const i in event.data) {
        changed[i] = event.data[i].newValue;
    }
    // keys - cache values
    const dungeonData = FileData.get("dungeonstate/entries");
    for (let i = 0; i < dungeonData.length; ++i) {
        const dData = dungeonData[i];
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
    for (let i = 0; i < dungeonData.length; ++i) {
        const dData = dungeonData[i];
        if (!!dData.keys) {
            if (ACCEPTED_KEY_GROUPS.includes(dData.keys_group) && !cached_values["option.track_keys"]) {
                changed[dData.keys] = 9999;
            } else {
                changed[dData.keys] = cached_values[dData.keys] || 0;
            }
        }
    }
    // bosskeys - apply values
    if (changed.hasOwnProperty("option.track_bosskeys") && cached_values["option.track_bosskeys"] != changed["option.track_bosskeys"]) {
        cached_values["option.track_bosskeys"] = changed["option.track_bosskeys"];
    }
    for (let i = 0; i < dungeonData.length; ++i) {
        const dData = dungeonData[i];
        if (!!dData.bosskey) {
            if (ACCEPTED_BOSSKEY_GROUPS.includes(dData.bosskey_group) && !cached_values["option.track_bosskeys"]) {
                changed[dData.bosskey] = 9999;
            } else {
                changed[dData.bosskey] = cached_values[dData.bosskey] || 0;
            }
        }
    }
    // ---------------------------------------------------------
    const res = Logic.execute(changed, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("statechange_dungeontype", event => {
    const changed = {};
    for (const i in event.data) {
        changed[i] = event.data[i].newValue;
    }
    // dungeonstate
    const dungeonData = FileData.get("dungeonstate/entries");
    for (let i = 0; i < dungeonData.length; ++i) {
        const dData = dungeonData[i];
        // dungeon types
        if (!!dData.hasmq) {
            if (event.data.dungeontype != null) {
                const state = event.data.dungeontype[this.ref];
                if (typeof state != "undefined" && state != "") {
                    data[`dungeontype.${dData.ref}`] = state;
                } else {
                    data[`dungeontype.${dData.ref}`] = "n";
                }
            }
        }
    }
    // ---------------------------------------------------------
    const res = Logic.execute(changed, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

EventBus.register("filter", event => {
    const data = {};
    data[event.data.name] = event.data.value;
    const res = Logic.execute(data, "region.root");
    if (Object.keys(res).length > 0) {
        EventBus.trigger("logic", res);
    }
});

class LogicCaller {

    async init() {
        try {
            const randoLogic = FileData.get("logic", {edges:{},logic:{}});
            //LOGIC_PROCESSOR.clearLogic();
            Logic.setLogic(randoLogic);
            const data = StateStorage.getAll();
            // keys - value caching
            const dungeonData = FileData.get("dungeonstate/entries");
            cached_values["option.track_keys"] = !!data["option.track_keys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                const dData = dungeonData[i];
                if (!!dData.keys) {
                    cached_values[dData.keys] = data[dData.keys] || 0;
                    if (ACCEPTED_KEY_GROUPS.includes(dData.keys_group) && !cached_values["option.track_keys"]) {
                        data[dData.keys] = 9999;
                    }
                }
            }
            cached_values["option.track_bosskeys"] = !!data["option.track_bosskeys"];
            for (let i = 0; i < dungeonData.length; ++i) {
                const dData = dungeonData[i];
                if (!!dData.bosskey) {
                    cached_values[dData.bosskey] = data[dData.bosskey] || 0;
                    if (ACCEPTED_BOSSKEY_GROUPS.includes(dData.bosskey_group) && !cached_values["option.track_bosskeys"]) {
                        data[dData.bosskey] = 9999;
                    }
                }
            }
            // dungeon types
            for (let i = 0; i < dungeonData.length; ++i) {
                const dData = dungeonData[i];
                if (!!dData.hasmq) {
                    data[`dungeontype.${dData.ref}`] = StateStorage.readExtra("dungeontype", dData.ref, "n");
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