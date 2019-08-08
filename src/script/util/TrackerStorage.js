let dbInstance = null;

function openDB() {
    return new Promise(function(resolve, reject) {
		if (dbInstance != null) {
			resolve();
		} else {
			let request = indexedDB.open("data");
			request.onupgradeneeded = function() {
				let db = this.result;
				let savestateStore = db.createObjectStore("savestates");
				let settingsStore = db.createObjectStore("settings");
				for (let i of Object.keys(localStorage)) {
					if (i.startsWith(`save\0`)) {
						let res = {};
						let data = JSON.parse(localStorage.getItem(i));
						for (let i in data) {
							if (i == "meta" || i == "extras") continue;
							for (let j in data[i]) {
								res[`${i}.${j}`] = data[i][j];
							}
						}
						if (!!data.extras && !!data.extras.notes) {
							res.notes = data.extras.notes;
						}
						savestateStore.add(res, i.split("\0")[1]);
					}
					if (i.startsWith(`settings\0`)) {
						let data = JSON.parse(localStorage.getItem(i));
						settingsStore.add(data, i.split("\0")[1]);
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
		let request = store.add(value, key);
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
			await openDB();
			let store = getStoreWritable(NAME.get(this));
			await writeData(store, key, value);
		} catch(error) {
			// error handling
		}
	}

	async get(key, value) {
		try {
			await openDB();
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
			await openDB();
			let store = getStoreReadonly(NAME.get(this));
			var res = await hasKey(store, key);
			return !!res;
		} catch(error) {
			// error handling
		}
	}

	async remove(key) {
		try {
			await openDB();
			let store = getStoreWritable(NAME.get(this));
			let result = await deleteData(store, key);
			return !!result;
		} catch(error) {
			// error handling
		}
	}

	async keys() {
		try {
			await openDB();
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