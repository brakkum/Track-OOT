import GlobalData from "/deepJS/storage/GlobalData.js";
import TrackerStorage from "/script/util/TrackerStorage.js";

class EditorLogic {

    async patch(logic) {
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
        await TrackerStorage.SettingsStorage.set("logic", logic);
    }

    async clear() {
        GlobalData.set("logic_patched", {});
        await TrackerStorage.SettingsStorage.set("logic", {});
    }

    async set(type, key, logic) {
        let data = GlobalData.get("logic_patched", {});
        if (!data[type]) {
            data[type] = {};
        }
        data[type][key] = logic;
        GlobalData.set("logic_patched", data);
        await TrackerStorage.SettingsStorage.set("logic", data);
    }

    async get(type, key) {
        let data = GlobalData.get("logic_patched", {});
        if (!!data[type] && !!data[type][key]) {
            return data[type][key];
        }
        return GlobalData.get("logic")[type][key];
    }

    async remove(type, key) {
        let data = GlobalData.get("logic_patched", {});
        if (!!data[type] && !!data[type][key]) {
            delete data[type][key];
            GlobalData.set("logic_patched", data);
            await TrackerStorage.SettingsStorage.set("logic", data);
        }
    }

}

export default new EditorLogic;