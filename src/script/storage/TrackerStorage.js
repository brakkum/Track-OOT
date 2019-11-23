import StateConverter from "/script/storage/StateConverter.js";

let dbInstance = null;

!function() {
    if (sessionStorage.length > 0) {
        let tmp = StateConverter.createEmptyState();
        let k = Object.keys(sessionStorage);
        for (let i of k) {
            let r = i.split("\0");
            if (r[0] != "meta") {
                if (r[0] == "extras") {
                    tmp.data[r[1]] = JSON.parse(sessionStorage.getItem(i));
                } else {
                    tmp.data[`${r[0]}.${r[1]}`] = JSON.parse(sessionStorage.getItem(i));
                }
            } else {
                tmp.name = JSON.parse(sessionStorage.getItem("meta\0active_state"));
            }
        }
        localStorage.setItem("savestate", JSON.stringify(tmp));
        sessionStorage.clear();
    }
}();

function openDB() {
    return new Promise(function(resolve, reject) {
		let request = indexedDB.open("data");
		request.onupgradeneeded = function() {
			let db = this.result;
			let savestateStore = db.createObjectStore("savestates", {keyPath: "name"});
			let settingsStore = db.createObjectStore("settings");
			for (let i of Object.keys(localStorage)) {
				if (i.startsWith("save\0")) {
					savestateStore.add({
						name: i.split("\0")[1],
						data: JSON.parse(localStorage.getItem(i))
					});
					localStorage.removeItem(i);
				}
				if (i.startsWith("settings\0")) {
					settingsStore.add(JSON.parse(localStorage.getItem(i)), i.split("\0")[1]);
					localStorage.removeItem(i);
				}
			}
		};
		request.onsuccess = function() {
			dbInstance = request.result;
			resolve(request.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
    });
}
function getStoreWritable(name) {
	return dbInstance.transaction(name, "readwrite").objectStore(name);
}
function getStoreReadonly(name) {
	return dbInstance.transaction(name, "readonly").objectStore(name);
}

const NAME = new WeakMap();

class TrackerStorage {

	constructor(name) {
		NAME.set(this, name);
	}
    
	set(key, value) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let table = getStoreWritable(NAME.get(this));
			let request;
			if (!!table.keyPath) {
				value[table.keyPath] = key;
				request = table.put(value);
			} else {
				request = table.put(value, key);
			}
			request.onsuccess = function(e) {
				resolve();
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
	}

	get(key, value) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreReadonly(NAME.get(this)).get(key);
			request.onsuccess = function(e) {
				let res = e.target.result;
				if (typeof res == "undefined") {
					resolve(value);
				} else {
					resolve(res);
				}
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
	}

	has(key) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreReadonly(NAME.get(this)).getKey(key);
			request.onsuccess = function(e) {
				resolve(e.target.result === key);
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
	}

	delete(key) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreWritable(NAME.get(this)).delete(key);
			request.onsuccess = function(e) {
				resolve();
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
	}

    clear() {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreWritable(NAME.get(this)).clear();
			request.onsuccess = function(e) {
				resolve();
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
    }

	keys(filter) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreReadonly(NAME.get(this)).getAllKeys();
			request.onsuccess = function(e) {
				let res = e.target.result;
				if (typeof filter == "string") {
					resolve(res.filter(key => key.startsWith(filter)));
				} else {
					resolve(res);
				}
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
	}

    getAll(filter) {
		return new Promise(async (resolve, reject) => {
			await openDB();
			let request = getStoreReadonly(NAME.get(this)).openCursor();
			let res = {};
			request.onsuccess = function(e) {
				let el = e.target.result;
				if (el) {
					res[el.key] = el.value;
					el.continue();
				} else {
					if (typeof filter == "string") {
						resolve(res.filter(key => key.startsWith(filter)));
					} else {
						resolve(res);
					}
				}
			};
			request.onerror = function(e) {
				reject(e);
			}
		});
    }

}

let stores = {
	StatesStorage: new TrackerStorage("savestates"),
	SettingsStorage: new TrackerStorage("settings")
}

export default stores;