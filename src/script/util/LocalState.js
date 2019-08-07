import DeepLocalStorage from "/deepJS/storage/LocalStorage.js";
import Logger from "/deepJS/util/Logger.js";
import TrackerStorage from "./TrackerStorage.js";

!function() {
    let res = {};
    let k = Object.keys(sessionStorage);
    for (let i of k) {
        let r = i.split("\0");
        res[`${r[0]}.${r[1]}`] = JSON.parse(sessionStorage.getItem(i));
    }
    DeepLocalStorage.set("savestate", res);
    DeepLocalStorage.set("activestate", sessionStorage.getItem("active_state"));
}();

let state = DeepLocalStorage.get("savestate", {});

class LocalState {

    async save(name) {
        await TrackerStorage.StatesStorage.set(name, state);
        Logger.info(`saved state as "${name}"`, "LocalState");
    }

    async load(name) {
        if (await TrackerStorage.StatesStorage.has(name)) {
            state = await TrackerStorage.StatesStorage.get(name);
            DeepLocalStorage.set("savestate", state);
            Logger.info(`loaded state from "${name}"`, "LocalState");
        } else {
            Logger.warn(`tried to load state "${name}" that does not exist`, "LocalState");
            this.reset();
        }
    }

    write(key, value) {
        state[key] = value;
        DeepLocalStorage.set("savestate", state);
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
            DeepLocalStorage.set("savestate", state);
        }
    }

    reset() {
        state = {};
        DeepLocalStorage.set("savestate", state);
        Logger.info(`state resettet`, "LocalState");
    }

    getState() {
        return JSON.parse(JSON.stringify(state));
    }
}

export default new LocalState;