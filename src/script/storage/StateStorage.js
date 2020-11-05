import IDBStorage from "/emcJS/storage/IDBStorage.js";
import DebouncedState from "/emcJS/storage/DebouncedState.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import ActionPath from "/emcJS/util/ActionPath.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import LocalStorage from "/emcJS/storage/LocalStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

const PERSISTANCE_NAME = "savestate";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = document.title;

const STORAGE = new IDBStorage("savestates");

let actionPath = new ActionPath();
let autosaveMax = 0;
let autosaveTime = 0;
let autosaveTimeout = null;

/* START DEBOUNCE STATE INIT */
const DATA = {
    name: "",
    version: 0,
    timestamp: new Date(),
    autosave: false,
    notes: "",
    state: new DebouncedState(),
    extra: new Map()
};

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

function decodeState(data) {
    DATA.name = data.name;
    DATA.version = data.version;
    DATA.timestamp = data.timestamp;
    DATA.autosave = data.autosave;
    DATA.notes = data.notes;
    DATA.state.overwrite(data.data);
    if (data.extra != null) {
        for (let category in data.extra) {
            let buffer = new DebouncedState(category);
            buffer.addEventListener("change", onStateChange);
            buffer.overwrite(data.extra[category]);
            DATA.extra.set(category, buffer);
        }
    }
}

function encodeState() {
    let res = {
        name: DATA.name,
        version: DATA.version,
        timestamp: DATA.timestamp,
        autosave: DATA.autosave,
        notes: DATA.notes,
        data: DATA.state.getAll(),
        extra: {}
    };
    for (let [key, value] of DATA.extra) {
        res.extra[key] = value.getAll();
    }
    return res;
}

DATA.state.addEventListener("change", onStateChange);

decodeState(StateConverter.createEmptyState());
/* END DEBOUNCE STATE INIT */

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

    init(defaultState) {
        let state = LocalStorage.get(PERSISTANCE_NAME, StateConverter.createEmptyState(defaultState));
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
        DATA.timestamp = new Date();
        DATA.name = name;
        DATA.autosave = false;
        let state = encodeState();
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
        let state = StateConverter.createEmptyState(data);

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
            const changes = {};
            for (let i in act) {
                changes[i] = act[i].oldValue;
            }
            DATA.state.setImmediateAll(changes);
        }
    }

    redo() {
        let act = actionPath.redo();
        if (act != null) {
            const changes = {};
            for (let i in act) {
                changes[i] = act[i].oldValue;
            }
            DATA.state.setImmediateAll(changes);
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

    writeAllExtra(data) {
        for(let c in data) {
            let state = data[c];
            this.writeExtra(c, state);
        }
    }

    readExtra(category, key, def) {
        if (DATA.extra.has(category) && DATA.extra.get(category).has(key)) {
            return DATA.extra.get(category).get(key);
        }
        return def;
    }

    readAllExtra(category) {
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
        if (event.startsWith("statechange")) {
            let buffer = null
            if (event === "statechange") {
                // event for statechange
                buffer = DATA.state;
            } else if (event.startsWith("statechange_")) {
                // event for statechange_*
                const category = event.slice(12);
                if (DATA.extra.has(category)) {
                    buffer = DATA.extra.get(category);
                } else {
                    buffer = new DebouncedState(category);
                    buffer.addEventListener("change", onStateChange);
                    DATA.extra.set(category, buffer);
                }
            } else {
                // event missmatch
                return false;
            }
            // write changes
            const changes = {};
            for (let [key, value] of Object.entries(data)) {
                changes[key] = value.newValue;
            }
            buffer.setImmediateAll(changes);
            return true;
        }
        // event missmatch
        return false;
    }

}

window.stateStorage = new StateStorage();

export default window.stateStorage;
