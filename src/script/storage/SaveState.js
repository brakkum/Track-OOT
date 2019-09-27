import EventBus from "/deepJS/util/EventBus/EventBus.js";
import LocalStorage from "/deepJS/storage/LocalStorage.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

let state = StateConverter.createEmptyState();
let dirty = false;

// TODO make autosave be called every X min, store last Y saves. if manual save restart timer to X
// TODO save autosave to localstorage
function autosave() {
    // TODO remove oldest autosave while autosave count >= Y
    // TODO store new autosave
    Logger.info(`saved state as "${name}"`, "SaveState");
    // TODO call timer with X seconds to autosave
}
// TODO call timer with X seconds to autosave

class SaveState {
    // TODO add activateAutosave(timeout, counter)
    // TODO add deactivateAutosave()

    constructor() {
        state = LocalStorage.get("savestate", StateConverter.createEmptyState());
        if (!state.hasOwnProperty("data")) {
            state = {data: state};
        }
        state = StateConverter.convert(state);
        dirty = false;
        EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
    }

    async save(name = state.name) {
        state.timestamp = new Date();
        state.name = name;
        LocalStorage.set("savestate", state);
        await TrackerStorage.StatesStorage.set(name, state);
        dirty = false;
    }

    async load(name) {
        if (await TrackerStorage.StatesStorage.has(name)) {
            state = await TrackerStorage.StatesStorage.get(name);
            if (!state.hasOwnProperty("data")) {
                state = {data: state};
            }
            state = StateConverter.convert(state);
            LocalStorage.set("savestate", state);
            dirty = false;
            EventBus.trigger("state", JSON.parse(JSON.stringify(state.data)));
        }
    }

    getName() {
        return state.name;
    }

    isDirty() {
        return dirty;
    }

    write(key, value) {
        if (!state.data.hasOwnProperty(key) || state.data[key] != value) {
            state.data[key] = value;
            LocalStorage.set("savestate", state);
            dirty = true;
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
            LocalStorage.set("savestate", state);
            dirty = true;
        }
    }

    reset() {
        state = StateConverter.createEmptyState();
        dirty = false;
        EventBus.trigger("state", {});
    }

}

export default new SaveState;