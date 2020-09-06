import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Helper from "/emcJS/util/Helper.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import ActionPath from "/emcJS/util/ActionPath.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import StateConverter from "./converters/StateConverter.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

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
    if (!document.title.startsWith("[D]")) {
        name = state.name || "new state";
        if (LocalStorage.get(STATE_DIRTY)) {
            document.title = `${TITLE_PREFIX} - ${name} *`;
        } else {
            document.title = `${TITLE_PREFIX} - ${name}`;
        }
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
        EventBus.trigger("state", JSON.parse(JSON.stringify({
            notes: state.notes,
            state: state.data,
            extra: state.extra
        })));
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
        state = StateConverter.createEmptyState();

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
        return state.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    undo() {
        let act = actionPath.undo();
        if (act != null) {
            for (let i in act) {
                state.data[i] = act[i].oldValue;
            }
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            // EventBus.trigger("statechange", JSON.parse(JSON.stringify(changed))); // TODO
            EventBus.trigger("state", JSON.parse(JSON.stringify({
                notes: state.notes,
                state: state.data,
                extra: state.extra
            })));
        }
    }

    redo() {
        let act = actionPath.redo();
        if (act != null) {
            for (let i in act) {
                state.data[i] = act[i].newValue;
            }
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            // EventBus.trigger("statechange", JSON.parse(JSON.stringify(changed))); // TODO
            EventBus.trigger("state", JSON.parse(JSON.stringify({
                notes: state.notes,
                state: state.data,
                extra: state.extra
            })));
        }
    }

    write(key, value) {
        let changed = {};
        if (typeof key == "object") {
            for (let i in key) {
                if (!state.data.hasOwnProperty(i) || !Helper.isEqual(state.data[i], key[i])) {
                    changed[i] = {
                        oldValue: state.data[i],
                        newValue: key[i]
                    };
                    state.data[i] = key[i];
                }
            }
        } else {
            if (!state.data.hasOwnProperty(key) || !Helper.isEqual(state.data[key], value)) {
                changed[key] = {
                    oldValue: state.data[key],
                    newValue: value
                };
                state.data[key] = value;
            }
        }
        if (!!Object.keys(changed).length) {
            actionPath.put(changed);
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            EventBus.trigger("statechange", JSON.parse(JSON.stringify(changed)));
            updateTitle();
        }
    }

    read(key, def) {
        if (state.data.hasOwnProperty(key)) {
            return state.data[key];
        }
        return def;
    }

    getAll() {
        return JSON.parse(JSON.stringify(state.data));
    }

    writeNotes(value) {
        state.notes = value.toString();
        LocalStorage.set(PERSISTANCE_NAME, state);
        LocalStorage.set(STATE_DIRTY, true);
        updateTitle();
    }

    readNotes() {
        return state.notes || "";
    }

    writeExtra(category, key, value) {
        let changed = {};
        if (!state.extra.hasOwnProperty(category)) {
            state.extra[category] = {};
        }
        if (typeof key == "object") {
            for (let i in key) {
                if (!state.extra[category].hasOwnProperty(i) || !Helper.isEqual(state.extra[category][i], key[i])) {
                    changed[i] = {
                        oldValue: state.extra[category][i],
                        newValue: key[i]
                    };
                    state.extra[category][i] = key[i];
                }
            }
        } else {
            if (!state.extra[category].hasOwnProperty(key) || !Helper.isEqual(state.extra[category][key], value)) {
                changed[key] = {
                    oldValue: state.extra[category][key],
                    newValue: value
                };
                state.extra[category][key] = value;
            }
        }
        if (!!Object.keys(changed).length) {
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            EventBus.trigger(`statechange_${category}`, changed);
            updateTitle();
        }
    }

    readExtra(category, key, def) {
        if (state.extra.hasOwnProperty(category) && state.extra[category].hasOwnProperty(key)) {
            return state.extra[category][key];
        }
        return def;
    }

    getAllExtra(category) {
        if (category == null) {
            return JSON.parse(JSON.stringify(state.extra));
        } else {
            if (state.extra.hasOwnProperty(category)) {
                return JSON.parse(JSON.stringify(state.extra[category]));
            } else {
                return {};
            }
        }
    }

    resolveNetworkStateEvent(event, data) {
        if (event == "statechange") {
            let changed = {};
            for (let [key, value] of Object.entries(data)) {
                if (!state.data.hasOwnProperty(key) || !Helper.isEqual(state.data[key], value.newValue)) {
                    changed[key] = value;
                    state.data[key] = value.newValue;
                }
            }
            if (!!Object.keys(changed).length) {
                actionPath.put(changed);
                LocalStorage.set(PERSISTANCE_NAME, state);
                LocalStorage.set(STATE_DIRTY, true);
                EventBus.trigger("statechange", JSON.parse(JSON.stringify(changed)));
                updateTitle();
            }
            return true;
        }
        if (event.startsWith("statechange_")) {
            const category = event.slice(12);
            let changed = {};
            if (!state.extra.hasOwnProperty(category)) {
                state.extra[category] = {};
            }
            for (let [key, value] of Object.entries(data)) {
                if (!state.extra[category].hasOwnProperty(key) || !Helper.isEqual(state.extra[category][key], value.newValue)) {
                    changed[key] = value;
                    state.extra[category][key] = value.newValue;
                }
            }
            if (!!Object.keys(changed).length) {
                LocalStorage.set(PERSISTANCE_NAME, state);
                LocalStorage.set(STATE_DIRTY, true);
                EventBus.trigger(`statechange_${category}`, changed);
                updateTitle();
            }
            return true;
        }
        return false;
    }

}

export default new StateStorage;