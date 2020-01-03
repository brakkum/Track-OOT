import TrackerStorage from "/script/storage/TrackerStorage.js";

class SettingsStorage {

    async set(key, value) {
        await TrackerStorage.SettingsStorage.set(key, value);
    }

    async get(key, value) {
        return await TrackerStorage.SettingsStorage.get(key, value);
    }

    async getAll() {
        return await TrackerStorage.SettingsStorage.getAll();
    }

}

export default new SettingsStorage;