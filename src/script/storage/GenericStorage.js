import TrackerStorage from "./TrackerStorage.js";

const STORAGE = new Map();
const DATA = new Map();
const NAME = new WeakMap();

export default class GenericStorage {

    async static init(name) {
        if (!STORAGE.has(name)) {
            let storage = new TrackerStorage(name);
            STORAGE.set(name, storage);
            let data = await storage.getAll();
            DATA.set(name, data);
        }
    }

    constructor(name) {
        NAME.set(this, name);
    }

    set(key, value) {
        let name = NAME.get(this);
        let data = DATA.get(name);
        let storage = STORAGE.get(name);
        if (typeof key == "object") {
            for (let i in key) {
                if (!data.hasOwnProperty(i) || data[i] != key[i]) {
                    data[i] = key[i];
                    storage.set(i, key[i]);
                }
            }
        } else {
            if (!data.hasOwnProperty(key) || data[key] != value) {
                data[key] = value;
                storage.set(key, value);
            }
        }
    }

    get(key, def) {
        let name = NAME.get(this);
        let data = DATA.get(name);
        if (data.hasOwnProperty(key)) {
            return data[key];
        }
        return def;
    }

    clear() {
        let name = NAME.get(this);
        let storage = STORAGE.get(name);
        storage.clear();
        DATA.set(name, {});
    }

    getAll() {
        let name = NAME.get(this);
        let data = DATA.get(name);
        return JSON.parse(JSON.stringify(data));
    }

}