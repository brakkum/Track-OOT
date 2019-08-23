import LocalStorage from "/deepJS/storage/LocalStorage.js";
import Logger from "/deepJS/util/Logger.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";

!function() {
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
}();

// TODO make autosave be called every X min, store last Y saves. if manual save restart timer to X. autosave to be stored to LocalStorage
function autosave() {
    // TODO remove oldest autosave while autosave count >= Y
    // TODO store new autosave
    Logger.info(`saved state as "${name}"`, "SaveState");
    // TODO call timer with X seconds to autosave
}
// TODO call timer with X seconds to autosave

let state = LocalStorage.get("savestate", {});

class SaveState {

    async save(name) {
		state.lastchanged = new Date();
        await TrackerStorage.StatesStorage.set(name, state);
        Logger.info(`saved state as "${name}"`, "SaveState");
    }

    async load(name) {
        if (await TrackerStorage.StatesStorage.has(name)) {
            state = await TrackerStorage.StatesStorage.get(name);
            LocalStorage.clear();
            for (let i in state) {
                LocalStorage.set(i, state[i]);
            }
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
        LocalStorage.set("savestate", state);
        Logger.info(`state resettet`, "SaveState");
    }

    getState() {
        return JSON.parse(JSON.stringify(state));
    }
}

export default new SaveState;