import LocalStorage from "/deepJS/storage/LocalStorage.js";
import Logger from "/deepJS/util/Logger.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";

!function() {
    let k = Object.keys(sessionStorage);
    for (let i of k) {
        let r = i.split("\0");
        if (r[0] != "meta") {
            if (r[0] == "extras") {
                localStorage.setItem(r[1], sessionStorage.getItem(i));
            } else {
                localStorage.setItem(`${r[0]}.${r[1]}`, sessionStorage.getItem(i));
            }
        } else {
            localStorage.setItem("name", sessionStorage.getItem("meta\0active_state"));
        }
    }
    sessionStorage.clear();
}();

let state = LocalStorage.getAll();

class SaveState {

    async save(name) {
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
        LocalStorage.set(key, value);
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
            LocalStorage.delete(key);
        }
    }

    reset() {
        state = {};
        LocalStorage.clear();
        Logger.info(`state resettet`, "SaveState");
    }

    getState() {
        return JSON.parse(JSON.stringify(state));
    }
}

export default new SaveState;