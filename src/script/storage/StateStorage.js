import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Helper from "/emcJS/util/Helper.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import ActionPath from "/emcJS/util/ActionPath.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import StateConverter from "./converters/StateConverter.js";

import DebouncedState from "./DebouncedState.js";
const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

/* START DEBOUNCE STATE INIT */

const DATA = {
    name: "",
    timestamp: new Date(),
    autosave: false,
    notes: "",
    state: new DebouncedState(),
    extra: new Map()
};

function decodeState(data) {
    DATA.name = data.name;
    DATA.timestamp = data.timestamp;
    DATA.autosave = data.autosave;
    DATA.notes = data.notes;
    DATA.state.clear();
    DATA.state.overwriteAll(data.data);
    DATA.extra.clear();
    if (data.extra != null) {
        for (let category in data.extra) {
            let buffer = new DebouncedState();
            buffer.overwriteAll(data.extra[category]);
            DATA.extra.set(category, buffer);
        }
    }
}

function encodeState() {
    let res = {
        name: DATA.name,
        timestamp: DATA.timestamp,
        autosave: DATA.autosave,
        notes: DATA.notes,
        data: DATA.state.getAll(),
        extra: {}
    };
    for (let category in DATA.extra) {
        res.extra[category] = DATA.extra[category].getAll();
    }
    return res;
}

function onStateChange(event) {
    LocalStorage.set(PERSISTANCE_NAME, encodeState());
    LocalStorage.set(STATE_DIRTY, true);
    if (event.category == null) {
        actionPath.put(event.data);
        EventBus.trigger("statechange", JSON.parse(JSON.stringify(event.data)));
        updateTitle();
    } else {
        EventBus.trigger(`statechange_${event.category}`, event.data);
        updateTitle();
    }
}

DATA.state.addEventListener("change", onStateChange);

decodeState(StateConverter.createEmptyState());

/* END DEBOUNCE STATE INIT */

let actionPath = new ActionPath();
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
        let tmp = Object.assign({}, encodeState());
        tmp.timestamp = new Date();
        tmp.autosave = true;
        await STORAGE.set(`${DateUtil.convert(new Date(tmp.timestamp), "YMDhms")}_${tmp.name}`, tmp);
    }
    autosaveTimeout = setTimeout(autosave, autosaveTime);
}

function updateTitle() {
    if (!document.title.startsWith("[D]")) {
        name = DATA.name || "new state";
        if (LocalStorage.get(STATE_DIRTY)) {
            document.title = `${TITLE_PREFIX} - ${name} *`;
        } else {
            document.title = `${TITLE_PREFIX} - ${name}`;
        }
    }
}

class StateStorage {

    constructor() {
        let state = LocalStorage.get(PERSISTANCE_NAME, StateConverter.createEmptyState());
        if (!state.hasOwnProperty("data")) {
            state = {data: state};
        }
        decodeState(StateConverter.convert(state));
        updateTitle();
        EventBus.trigger("state", JSON.parse(JSON.stringify({
            notes: state.notes,
            state: state.data,
            extra: state.extra
        })));
    }

    async save(name = DATA.name) {
        let state = encodeState();
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
            let state = await STORAGE.get(name);
            if (!state.hasOwnProperty("data")) {
                state = {data: state};
            }
            decodeState(StateConverter.convert(state));
            LocalStorage.set(PERSISTANCE_NAME, state);
            if (autosaveTimeout != null) {
                clearTimeout(autosaveTimeout);
                autosaveTimeout = setTimeout(autosave, autosaveTime);
            }
            LocalStorage.set(STATE_DIRTY, false);
            updateTitle();
            actionPath.clear();
            EventBus.trigger("state", JSON.parse(JSON.stringify({
                notes: state.notes,
                state: state.data,
                extra: state.extra
            })));
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

    reset(data, extraData) {
        let state = StateConverter.createEmptyState();

        if (typeof data == "object") {
            data = JSON.parse(JSON.stringify(data));
            for (let i in data) {
                state.data[i] = data[i];
            }
        }

        if (typeof extraData == "object") {
            extraData = JSON.parse(JSON.stringify(extraData));
            for (let i in extraData) {
                if (!state.extra.hasOwnProperty(i)) {
                    state.extra[i] = {};
                }
                for (let j in extraData[i]) {
                    state.extra[i][j] = extraData[i][j];
                }
            }
        }
        
        decodeState(state);

        LocalStorage.set(PERSISTANCE_NAME, state);
        LocalStorage.set(STATE_DIRTY, false);
        document.title = "Track-OOT - new state";
        actionPath.clear();
        EventBus.trigger("state", JSON.parse(JSON.stringify({
            notes: state.notes,
            state: state.data,
            extra: state.extra
        })));
    }

    getName() {
        return DATA.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    undo() {
        let act = actionPath.undo();
        if (act != null) {
            for (let i in act) {
                DATA.state.set(i, act[i].oldValue);
            }
        }
    }

    redo() {
        let act = actionPath.redo();
        if (act != null) {
            for (let i in act) {
                DATA.state.set(i, act[i].newValue);
            }
        }
    }

    write(key, value) {
        if (typeof key == "object") {
            DATA.state.setAll(key);
        } else {
            DATA.state.set(key, value);
        }
    }

    read(key, def) {
        if (DATA.state.has(key)) {
            return DATA.state.get(key);
        }
        return def;
    }

    getAll() {
        return DATA.state.getAll();
    }

    writeNotes(value) {
        DATA.notes = value.toString();
        LocalStorage.set(PERSISTANCE_NAME, encodeState());
        LocalStorage.set(STATE_DIRTY, true);
        updateTitle();
    }

    readNotes() {
        return DATA.notes || "";
    }

    writeExtra(category, key, value) {
        let buffer = null;
        if (DATA.extra.has(category)) {
            buffer = DATA.extra.get(category);
        } else {
            buffer = new DebouncedState(category);
            buffer.addEventListener("change", onStateChange);
            DATA.extra.set(category, buffer);
        }
        if (typeof key == "object") {
            buffer.setAll(key);
        } else {
            buffer.set(key, value);
        }
    }

    readExtra(category, key, def) {
        if (DATA.extra.has(category) && DATA.extra.get(category).has(key)) {
            return DATA.extra.get(category).get(key);
        }
        return def;
    }

    getAllExtra(category) {
        if (category == null) {
            let res = {};
            for (let [category, state] of DATA.extra) {
                res[category] = state.getAll();
            }
            return res;
        } else {
            if (DATA.extra.has(category)) {
                return DATA.extra.get(category).getAll();
            } else {
                return {};
            }
        }
    }

    resolveNetworkStateEvent(event, data) {
        if (event == "statechange") {
            for (let [key, value] of Object.entries(data)) {
                DATA.state.overwrite(key, value.newValue);
            }
            if (!!Object.keys(data).length) {
                actionPath.put(data);
                LocalStorage.set(PERSISTANCE_NAME, encodeState());
                LocalStorage.set(STATE_DIRTY, true);
                EventBus.trigger("statechange", JSON.parse(JSON.stringify(data)));
                updateTitle();
            }
            return true;
        }
        if (event.startsWith("statechange_")) {
            const category = event.slice(12);
            let buffer = null;
            if (DATA.extra.has(category)) {
                buffer = DATA.extra.get(category);
            } else {
                buffer = new DebouncedState(category);
                buffer.addEventListener("change", onStateChange);
                DATA.extra.set(category, buffer);
            }
            for (let [key, value] of Object.entries(data)) {
                buffer.overwrite(key, value.newValue);
            }
            if (!!Object.keys(changed).length) {
                LocalStorage.set(PERSISTANCE_NAME, encodeState());
                LocalStorage.set(STATE_DIRTY, true);
                EventBus.trigger(`statechange_${category}`, data);
                updateTitle();
            }
            return true;
        }
        return false;
    }

}

export default new StateStorage;