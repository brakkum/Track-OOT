import DeepLocalStorage from "/deepJS/storage/LocalStorage.js";
import DeepSessionStorage from "/deepJS/storage/SessionStorage.js";
import Logger from "/deepJS/util/Logger.js";

let state = DeepSessionStorage.getAll();

class TrackerLocalState {

    save(name) {
        DeepLocalStorage.set("save", name, state);
        Logger.info(`saved state as "${name}"`, "LocalState");
    }

    load(name) {
        if (DeepLocalStorage.has("save", name)) {
            state = DeepLocalStorage.get("save", name);
            DeepSessionStorage.purge();
            for (let i in state) {
                for (let j in state[i]) {
                    DeepSessionStorage.set(i, j, state[i][j]);
                }
            }
            Logger.info(`loaded state from "${name}"`, "LocalState");
        } else {
            Logger.warn(`tried to load state "${name}" that does not exist`, "LocalState");
            this.reset();
        }
    }

    write(category, key, value) {
        state[category] = state[category] || {};
        state[category][key] = value;
        DeepSessionStorage.set(category, key, value);
    }

    read(category, key, def) {
        if (state.hasOwnProperty(category) && state[category].hasOwnProperty(key)) {
            return state[category][key];
        }
        return def;
    }

    remove(category, key) {
        if (!!state.hasOwnProperty(category)) {
            if (!!state[category].hasOwnProperty(key)) {
                delete state[category][key];
            }
            if (!Object.keys(state[category]).length) {
                delete state[category];
            }
        }
    }

    reset() {
        state = {};
        DeepSessionStorage.purge();
        Logger.info(`state resettet`, "LocalState");
    }

    names(category) {
        if (state.hasOwnProperty(category)) {
            return Object.keys(state[category]);
        }
        return [];
    }

    getState() {
        return JSON.parse(JSON.stringify(state));
    }
}

export default new TrackerLocalState;