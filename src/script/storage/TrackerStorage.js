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
					let data = JSON.parse(localStorage.getItem(i));
					let res = StateConverter.convert({
						name: i.split("\0")[1],
						data: data
					});
					savestateStore.add(res);
					localStorage.removeItem(i);
				}
				if (i.startsWith("settings\0")) {
					let data = JSON.parse(localStorage.getItem(i));
					settingsStore.add(data, i.split("\0")[1]);
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
function writeData(store, key, value) {
	return new Promise(function(resolve, reject) {
		let request;
		if (!!store.keyPath) {
			value[store.keyPath] = key;
			request = store.put(value);
		} else {
			request = store.put(value, key);
		}
		request.onsuccess = function(e) {
			resolve();
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function readData(store, key) {
	return new Promise(function(resolve, reject) {
		let request = store.get(key);
		request.onsuccess = function(e) {
			resolve(e.target.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function deleteData(store, key) {
	return new Promise(function(resolve, reject) {
		let request = store.delete(key);
		request.onsuccess = function(e) {
			resolve(e.target.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function hasKey(store, key) {
	return new Promise(function(resolve, reject) {
		var request = store.getKey(key);
		request.onsuccess = function(e) {
			resolve(e.target.result === key);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function getKeys(store) {
	return new Promise(function(resolve, reject) {
		let request = store.getAllKeys();
		request.onsuccess = function(e) {
			resolve(e.target.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}

const NAME = new WeakMap();

class TrackerStorage {

	constructor(name) {
		NAME.set(this, name);
	}

	async set(key, value) {
		try {
			if (dbInstance == null) {
				await openDB()
			}
			let store = getStoreWritable(NAME.get(this));
			await writeData(store, key, value);
		} catch(error) {
			// error handling
		}
	}

	async get(key, value) {
		try {
			if (dbInstance == null) {
				await openDB()
			}
			let store = getStoreReadonly(NAME.get(this));
			let result = await readData(store, key);
			if (typeof result == "undefined" || result == null) {
				return value;
			}
			return result;
		} catch(error) {
			// error handling
		}
	}

	async has(key) {
		try {
			if (dbInstance == null) {
				await openDB()
			}
			let store = getStoreReadonly(NAME.get(this));
			var res = await hasKey(store, key);
			return !!res;
		} catch(error) {
			// error handling
		}
	}

	async delete(key) {
		try {
			if (dbInstance == null) {
				await openDB()
			}
			let store = getStoreWritable(NAME.get(this));
			let result = await deleteData(store, key);
			return !!result;
		} catch(error) {
			// error handling
		}
	}

	async keys() {
		try {
			if (dbInstance == null) {
				await openDB()
			}
			let store = getStoreReadonly(NAME.get(this));
			let result = await getKeys(store);
			return result;
		} catch(error) {
			// error handling
		}
	}

}

let stores = {
	StatesStorage: new TrackerStorage("savestates"),
	SettingsStorage: new TrackerStorage("settings")
}

export default stores;