import GlobalData from "/script/storage/GlobalData.js";
import SettingsStorage from "/script/storage/SettingsStorage.js";

let logic_patched = null;
async function loadPatchedLogic() {
    if (logic_patched == null) {
        logic_patched = await SettingsStorage.get("logic", {});
    }
    return logic_patched;
}

class EditorLogic {

    async patch(logic) {
        let data = await loadPatchedLogic();
        for (let i in logic) {
            if (!data[i]) {
                data[i] = logic[i];
            } else {
                for (let j in logic[i]) {
                    data[i][j] = logic[i][j];
                }
            }
        }
        await SettingsStorage.set("logic", data);
    }

    async clear() {
        await SettingsStorage.set("logic", {});
    }

    async set(type, key, logic) {
        let data = await loadPatchedLogic();
        if (!data[type]) {
            data[type] = {};
        }
        data[type][key] = logic;
        await SettingsStorage.set("logic", data);
    }

    async get(type, key) {
        let data = await loadPatchedLogic();
        if (!!data[type] && !!data[type][key]) {
            return data[type][key];
        }
        return GlobalData.get("logic")[type][key];
    }

    async getAll() {
        return await loadPatchedLogic();
    }

    async remove(type, key) {
        let data = await loadPatchedLogic();
        if (!!data[type] && !!data[type][key]) {
            delete data[type][key];
            await SettingsStorage.set("logic", data);
        }
    }

}

export default new EditorLogic;