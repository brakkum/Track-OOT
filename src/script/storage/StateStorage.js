import GlobalData from "/emcJS/storage/GlobalData.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import ActionPath from "/emcJS/util/ActionPath.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import TrackerStorage from "./TrackerStorage.js";
import StateConverter from "./converters/StateConverter.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = "Track-OOT";

const STORAGE = new TrackerStorage("savestates");

let actionPath = new ActionPath();
let state = StateConverter.createEmptyState();
let autosaveMax = 0;
let autosaveTime = 0;
let autosaveTimeout = null;

function sortStates(a, b) {
    if (a < b) {
        return 1;
    } else if (a > b) {
        return -1;
    } else {
        return 0;
    }
}

async function removeOverflowAutosaves() {
    let saves = await STORAGE.getAll();
    let keys = Object.keys(saves);
    let autoKeys = [];
    for (let key of keys) {
        if (saves[key].autosave) {
            autoKeys.push(key);
        }
    }
    autoKeys.sort(sortStates);
    while (autoKeys.length >= autosaveMax) {
        let key = autoKeys.pop();
        if (saves[key].autosave) {
            await STORAGE.delete(key);
        }
    }
}

async function autosave() {
    if (LocalStorage.get(STATE_DIRTY, false)) {
        await removeOverflowAutosaves();
        let tmp = Object.assign({}, state);
        tmp.timestamp = new Date();
        tmp.autosave = true;
        await STORAGE.set(`${DateUtil.convert(new Date(tmp.timestamp), "YMDhms")}_${tmp.name}`, tmp);
    }
    autosaveTimeout = setTimeout(autosave, autosaveTime);
}

function updateTitle() {
    name = state.name || "new state";
    if (LocalStorage.get(STATE_DIRTY)) {
        document.title = `${TITLE_PREFIX} - ${name} *`;
    } else {
        document.title = `${TITLE_PREFIX} - ${name}`;
    }
}

class StateStorage {

    constructor() {
        state = LocalStorage.get(PERSISTANCE_NAME, StateConverter.createEmptyState());
        if (!state.hasOwnProperty("data")) {
            state = {data: state};
        }
        state = StateConverter.convert(state);
        updateTitle();
        EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
    }

    async save(name = state.name) {
        state.timestamp = new Date();
        state.name = name;
        state.autosave = false;
        LocalStorage.set(PERSISTANCE_NAME, state);
        await STORAGE.set(name, state);
        if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        }
        LocalStorage.set(STATE_DIRTY, false);
        updateTitle();
    }

    async load(name) {
        if (await STORAGE.has(name)) {
            state = await STORAGE.get(name);
            if (!state.hasOwnProperty("data")) {
                state = {data: state};
            }
            state = StateConverter.convert(state);
            LocalStorage.set(PERSISTANCE_NAME, state);
            if (autosaveTimeout != null) {
                clearTimeout(autosaveTimeout);
                autosaveTimeout = setTimeout(autosave, autosaveTime);
            }
            LocalStorage.set(STATE_DIRTY, false);
            updateTitle();
            actionPath.clear();
            EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
        }
    }

    async setAutosave(time, amount) {
        if (time > 0) {
            autosaveMax = amount;
            autosaveTime = time * 60000;
            await removeOverflowAutosaves();
            if (autosaveTimeout != null) {
                clearTimeout(autosaveTimeout);
            }
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        } else if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = null;
        }
    }

    getName() {
        return state.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    write(key, value) {
        let changed = {};
        if (typeof key == "object") {
            for (let i in key) {
                if (!state.data.hasOwnProperty(i) || state.data[i] != key[i]) {
                    changed[i] = {
                        oldValue: state.data[i],
                        newValue: key[i]
                    };
                    state.data[i] = key[i];
                }
            }
        } else {
            if (!state.data.hasOwnProperty(key) || state.data[key] != value) {
                changed[key] = {
                    oldValue: state.data[key],
                    newValue: value
                };
                state.data[key] = value;
            }
        }
        if (!!Object.keys(changed).length) {
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            actionPath.put(changed);
            EventBus.trigger("state_change", changed);
            updateTitle();
        }
    }

    read(key, def) {
        if (state.data.hasOwnProperty(key)) {
            return state.data[key];
        }
        return def;
    }

    reset() {
        state = StateConverter.createEmptyState();

        let options = GlobalData.get("randomizer_options");
        for (let i in options) {
            for (let j in options[i]) {
                let v = options[i][j].default;
                if (Array.isArray(v)) {
                    v = new Set(v);
                    options[i][j].values.forEach(el => {
                        state.data[el] = v.has(el);
                    });
                } else {
                    state.data[j] = v;
                }
            }
        }

        LocalStorage.set(PERSISTANCE_NAME, state);
        LocalStorage.set(STATE_DIRTY, false);
        document.title = "Track-OOT - new state";
        actionPath.clear();
        EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
    }

    undo() {
        let act = actionPath.undo();
        if (!!act) {
            for (let i in act) {
                state.data[i] = act[i].oldValue;
            }
            EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
        }
    }

    redo() {
        let act = actionPath.redo();
        if (!!act) {
            for (let i in act) {
                state.data[i] = act[i].newValue;
            }
            EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
        }
    }

    getAll() {
        return JSON.parse(JSON.stringify(state.data));
    }

}

export default new StateStorage;


/* TODO
** use this to create unified states
** currently ugly (hence not used) but we keep an eye on async modules for now
*/
function getDefaultState() {
    let DEFAULT_STATE = {
        notes: ""
    };
    let shops = GlobalData.get("shops");
    for (let i in shops) {
        DEFAULT_STATE[i] = shops[i];
        DEFAULT_STATE[`${i}.names`] = ["", "", "", "", "", "", "", ""];
        DEFAULT_STATE[`${i}.bought`] = [0, 0, 0, 0, 0, 0, 0, 0]
    }
    let songs = GlobalData.get("songs");
    for (let i in songs) {
        if (songs[i].editable) {
            DEFAULT_STATE[i] = songs[i].notes;
        }
    }
    let items = GlobalData.get("items");
    for (let i in items) {
        DEFAULT_STATE[i] = 0;
    }
    let locations = GlobalData.get("world/locations");
    for (let i in locations) {
        DEFAULT_STATE[i] = false;
        if (locations[i].type == "gossipstone") {
            DEFAULT_STATE[`${i}.item`] = "";
            DEFAULT_STATE[`${i}.location`] = "";
        }
    }
    let entrances = GlobalData.get("world/entrances");
    for (let i in entrances) {
        DEFAULT_STATE[i] = "";
    }
    let dungeonstate = GlobalData.get("dungeonstate");
    for (let i in dungeonstate) {
        if (dungeonstate[i].hasmq) {
            DEFAULT_STATE[`dungeonTypes.${i}`] = "n";
        }
        if (dungeonstate[i].boss_reward) {
            DEFAULT_STATE[`dungeonRewards.${i}`] = 0;
        }
    }
    let options = GlobalData.get("randomizer_options");
    for (let i in options) {
        for (let j in options[i]) {
            if (options[i][j].type == "list") {
                let def = new Set(options[i][j].default);
                for (let k of options[i][j].values) {
                    if (def.has(k)) {
                        DEFAULT_STATE[k] = true;
                    } else {
                        DEFAULT_STATE[k] = false;
                    }
                }
            } else {
                DEFAULT_STATE[j] = options[i][j].default;
            }
        }
    }
    return DEFAULT_STATE;
}