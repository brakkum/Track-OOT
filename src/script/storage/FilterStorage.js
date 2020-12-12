const STORAGE = new Map();

class FilterStorage {

    set(key, value) {
        STORAGE.set(key, value);
    }

    get(key, value) {
        const res = STORAGE.get(key);
        if (typeof res == "undefined" || res == null) {
            return value;
        }
        return res;
    }

    has(key) {
        return STORAGE.has(key);
    }

    delete(key) {
        STORAGE.delete(key);
    }

    clear() {
        STORAGE.clear();
    }

    keys(filter) {
        const keys = STORAGE.keys();
        if (typeof filter == "string") {
            return keys.filter(key => key.startsWith(filter));
        }
        return keys;
    }

    getAll(filter) {
        const res = {};
        const k = this.keys(filter);
        for (const i of k) {
            res[i] = STORAGE.get(i);
        }
        return res;
    }

}

export default new FilterStorage;
