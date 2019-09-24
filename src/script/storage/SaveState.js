import LocalStorage from "/deepJS/storage/LocalStorage.js";
import Logger from "/deepJS/util/Logger.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

const STATE_VERSION = 1;
const stateConv = new StateConverter(STATE_VERSION);

!function() {
    LocalStorage.keys("save\0").forEach(async el => {
        let name = el.slice(5);
        let data = LocalStorage.get(el, {});
        data = stateConv.convert(data, data.version);
		data.lastchanged = new Date();
		data.version = STATE_VERSION;
        await TrackerStorage.StatesStorage.set(name, data);
        //LocalStorage.delete(el);
    });

    if (sessionStorage.length > 0) {
        let tmp = {};
        let k = Object.keys(sessionStorage);
        for (let i of k) {
            let r = i.split("\0");
            if (r[0] != "meta") {
                if (r[0] == "extras") {
                    tmp[r[1]] = sessionStorage.getItem(i);
                } else {
                    tmp[`${r[0]}.${r[1]}`] = sessionStorage.getItem(i);
                }
            } else {
                tmp.name = sessionStorage.getItem("meta\0active_state");
            }
        }
        LocalStorage.set("savestate", tmp);
        sessionStorage.clear();
    }
}();

// TODO make autosave be called every X min, store last Y saves. if manual save restart timer to X. autosave to be stored to LocalStorage
function autosave() {
    // TODO remove oldest autosave while autosave count >= Y
    // TODO store new autosave
    Logger.info(`saved state as "${name}"`, "SaveState");
    // TODO call timer with X seconds to autosave
}
// TODO call timer with X seconds to autosave

let state = {};
let activestate = "";

class SaveState {

    constructor() {
        state = LocalStorage.get("savestate", {});
        activestate = state.name || "";
        if (state.version < STATE_VERSION) {
            state = stateConv.convert(state, state.version);
        }
    }

    async save(name = activestate) {
		state.lastchanged = new Date();
		state.version = STATE_VERSION;
		state.name = name;
        await TrackerStorage.StatesStorage.set(name, state);
        LocalStorage.set("savestate", state);
        activestate = name;
        Logger.info(`saved state as "${name}"`, "SaveState");
    }

    async load(name) {
        if (await TrackerStorage.StatesStorage.has(name)) {
            state = await TrackerStorage.StatesStorage.get(name);
            if (state.version < STATE_VERSION) {
                state = stateConv.convert(state, state.version);
            }
            LocalStorage.set("savestate", state);
            activestate = name;
            Logger.info(`loaded state from "${name}"`, "SaveState");
        } else {
            Logger.warn(`tried to load state "${name}" that does not exist`, "SaveState");
            this.reset();
        }
    }

    async rename(current, target) {
        let save = await TrackerStorage.StatesStorage.get(current);
        await TrackerStorage.StatesStorage.remove(current);
        await TrackerStorage.StatesStorage.set(target, save);
    }

    async delete(name) {
        await TrackerStorage.StatesStorage.remove(name); // somehow does not work
        if (name == activestate) {
            activestate = "";
        }
    }

    async exists(name) {
        return await TrackerStorage.StatesStorage.has(name);
    }
    
    async getNames() {
        return await TrackerStorage.StatesStorage.keys();
    }

    async import(name, data, version = 0) {
        version = +version;
        if (version < STATE_VERSION) {
            data = stateConv.convert(data, version);
        }
		data.version = STATE_VERSION;
        await TrackerStorage.StatesStorage.set(name, data);
    }

    async export(name) {
        let data = await TrackerStorage.StatesStorage.get(name, {});
        if (data.version < STATE_VERSION) {
            data = stateConv.convert(data, data.version);
        }
        return {
            name: name,
            data: data,
            version: STATE_VERSION
        };
    }

    getName() {
        return activestate;
    }

    write(key, value) {
        state[key] = value;
        LocalStorage.set("savestate", state);
    }

    read(key, def) {
        if (state.hasOwnProperty(key)) {
            return state[key];
        }
        return def;
    }

    remove(key) {
        if (!!state.hasOwnProperty(key)) {
            delete state[key];
            LocalStorage.set("savestate", state);
        }
    }

    reset() {
        state = {};
        activestate = "";
        LocalStorage.set("savestate", state);
        Logger.info(`state resettet`, "SaveState");
    }

    getState() {
        return JSON.parse(JSON.stringify(state));
    }
}

export default new SaveState;