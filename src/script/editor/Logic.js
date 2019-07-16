import LocalStorage from "/deepJS/storage/LocalStorage.js";
import GlobalData from "/deepJS/storage/GlobalData.js";

class EditorLogic {

    patch(logic) {
        let data = GlobalData.get("logic_patched", {});
        for (let i in logic) {
            if (!data[i]) {
                data[i] = logic[i];
            } else {
                for (let j in logic[i]) {
                    data[i][j] = logic[i][j];
                }
            }
        }
        GlobalData.set("logic_patched", logic);
        LocalStorage.set("settings", "logic", logic);
    }

    clear() {
        GlobalData.set("logic_patched", {});
        LocalStorage.set("settings", "logic", {});
    }

    set(type, key, logic) {
        let data = GlobalData.get("logic_patched", {});
        if (!data[type]) {
            data[type] = {};
        }
        data[type][key] = logic;
        GlobalData.set("logic_patched", data);
        LocalStorage.set("settings", "logic", data);
    }

    get(type, key) {
        let data = GlobalData.get("logic_patched", {});
        if (!!data[type] && !!data[type][key]) {
            return data[type][key];
        }
        return GlobalData.get("logic")[type][key];
    }

    remove(type, key) {
        let data = GlobalData.get("logic_patched", {});
        if (!!data[type] && !!data[type][key]) {
            delete data[type][key];
            GlobalData.set("logic_patched", data);
            LocalStorage.set("settings", "logic", data);
        }
    }

}

export default new EditorLogic;