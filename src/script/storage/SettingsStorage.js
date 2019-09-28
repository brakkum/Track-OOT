import TrackerStorage from "/script/storage/TrackerStorage.js";

class SettingsStorage {

    async get(key, value) {
        return await TrackerStorage.SettingsStorage.get(key, value);
    }

    async set(key, value) {
        await TrackerStorage.SettingsStorage.set(key, value);
    }

}

export default new SettingsStorage;