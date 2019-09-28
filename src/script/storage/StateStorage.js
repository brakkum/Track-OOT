import EventBus from "/deepJS/util/EventBus/EventBus.js";
import DateUtil from "/deepJS/util/DateUtil.js";
import LocalStorage from "/deepJS/storage/LocalStorage.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

const PERSISTANCE_NAME = "savestate";
const AUTOSAVE_PREFIX = "autosave_";
const STATE_DIRTY = "state_dirty";
const TITLE_PREFIX = "Track-OOT";

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

async function autosave() {
    let saves = LocalStorage.keys(AUTOSAVE_PREFIX);
    saves.sort(sortStates);
    while (saves.length >= autosaveMax) {
        LocalStorage.delete(saves.pop());
    }
    let tmp = Object.assign({}, state);
    tmp.timestamp = new Date();
    LocalStorage.set(`${AUTOSAVE_PREFIX}${DateUtil.convert(new Date(tmp.timestamp), "YMDhms")}`, tmp);
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
        LocalStorage.set(PERSISTANCE_NAME, state);
        await TrackerStorage.StatesStorage.set(name, state);
        if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        }
        LocalStorage.set(STATE_DIRTY, false);
        updateTitle();
    }

    async load(name) {
        if (await TrackerStorage.StatesStorage.has(name)) {
            state = await TrackerStorage.StatesStorage.get(name);
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
            EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
        }
    }

    setAutosave(time, amount) {
        if (time > 0) {
            autosaveMax = amount;
            autosaveTime = time * 60000;
            let saves = LocalStorage.keys(AUTOSAVE_PREFIX);
            saves.sort(sortStates);
            while (saves.length >= autosaveMax) {
                LocalStorage.delete(saves.pop());
            }
            autosaveTimeout = setTimeout(autosave, autosaveTime);
        } else if (autosaveTimeout != null) {
            clearTimeout(autosaveTimeout);
        }
    }

    getName() {
        return state.name;
    }

    isDirty() {
        return LocalStorage.get(STATE_DIRTY);
    }

    write(key, value) {
        if (!state.data.hasOwnProperty(key) || state.data[key] != value) {
            state.data[key] = value;
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            updateTitle();
        }
    }

    read(key, def) {
        if (state.data.hasOwnProperty(key)) {
            return state.data[key];
        }
        return def;
    }

    remove(key) {
        if (!!state.data.hasOwnProperty(key)) {
            delete state.data[key];
            LocalStorage.set(PERSISTANCE_NAME, state);
            LocalStorage.set(STATE_DIRTY, true);
            updateTitle();
        }
    }

    reset() {
        state = StateConverter.createEmptyState();
        LocalStorage.set(PERSISTANCE_NAME, state);
        LocalStorage.set(STATE_DIRTY, false);
        document.title = "Track-OOT - new state";
        EventBus.trigger("state", {});
    }

}

export default new StateStorage;