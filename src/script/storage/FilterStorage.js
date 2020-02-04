let STORAGE = new Map();

class FilterStorage {

    set(key, value) {
        STORAGE.set(key, value);
    }

    get(key, value) {
        let res = STORAGE.get(key);
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
        let keys = STORAGE.keys();
        if (typeof filter == "string") {
            return keys.filter(key => key.startsWith(filter));
        }
        return keys;
    }

    getAll(filter) {
        let res = {};
        let k = this.keys(filter);
        for (let i of k) {
            res[i] = STORAGE.get(i);
        }
        return res;
    }

}

export default new FilterStorage;