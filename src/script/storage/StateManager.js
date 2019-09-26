import LocalStorage from "/deepJS/storage/LocalStorage.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

!function() {
    LocalStorage.keys("save\0").forEach(async el => {
        let name = el.slice(5);
        let data = LocalStorage.get(el, {});
        data = StateConverter.convert({
            name: name,
            data: data
        });
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

class StateManager {

    async rename(current, target) {
        let save = await TrackerStorage.StatesStorage.get(current);
        await TrackerStorage.StatesStorage.delete(current);
        await TrackerStorage.StatesStorage.set(target, save);
    }

    async delete(name) {
        await TrackerStorage.StatesStorage.delete(name);
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
            data = StateConverter.convert(data, version);
        }
        await TrackerStorage.StatesStorage.set(name, data);
    }

    async export(name) {
        let data = await TrackerStorage.StatesStorage.get(name, {});
        if (data.version < STATE_VERSION) {
            data = StateConverter.convert(data, data.version);
        }
        return data;
    }
}

export default new StateManager;