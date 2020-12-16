import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateConverter from "/script/storage/StateConverter.js";

const STORAGE = new IDBStorage("savestates");

class StateManager {

    async rename(current, target) {
        const save = await STORAGE.get(current);
        save.autosave = false;
        await STORAGE.delete(current);
        await STORAGE.set(target, save);
    }

    async delete(name) {
        await STORAGE.delete(name);
    }

    async exists(name) {
        return await STORAGE.has(name);
    }
    
    async getNames() {
        return await STORAGE.keys();
    }
    
    async getStates() {
        return await STORAGE.getAll();
    }

    async import(data) {
        data = StateConverter.convert(data);
        data.autosave = false;
        await STORAGE.set(data.name, data);
    }

    async export(name) {
        return await STORAGE.get(name, {});
    }

}

export default new StateManager;
