
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
					data.name = i.split("\0")[1];
					savestateStore.add(data);
				}
				if (i.startsWith("settings\0")) {
					let data = JSON.parse(localStorage.getItem(i));
					settingsStore.add(data, i.split("\0")[1]);
				}
			}
        };
        request.onsuccess = function() {
            resolve(request.result);
        };
        request.onerror = function(e) {
            reject(e);
        }
    });
}
function getStoreWritable(db, name) {
	return db.transaction(name, "readwrite").objectStore(name);
}
function getStoreReadonly(db, name) {
	return db.transaction(name, "readonly").objectStore(name);
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

class DBStorage {

	async writeState(key, value) {
		try {
			let db = await openDB();
			let store = getStoreWritable(db, "savestates");
			await writeData(store, key, value);
			db.close();
		} catch(error) {
			// error handling
		}
	}

	async readState(key, value) {
		try {
			let db = await openDB();
			let store = getStoreReadonly(db, "savestates");
			let result = await readData(store, key);
			db.close();
			if (typeof result == "undefined" || result == null) {
				return value;
			}
			return result;
		} catch(error) {
			// error handling
		}
	}

	async removeState(key) {
		try {
			let db = await openDB();
			let store = getStoreWritable(db, "savestates");
			let result = await deleteData(store, key);
			db.close();
			return !!result;
		} catch(error) {
			// error handling
		}
	}

	async getStates() {
		try {
			let db = await openDB();
			let store = getStoreReadonly(db, "savestates");
			let result = await getKeys(store);
			db.close();
			return result;
		} catch(error) {
			// error handling
		}
	}

	async writeSetting(key, value) {
		try {
			let db = await openDB();
			let store = getStoreWritable(db, "settings");
			await writeData(store, key, value);
			db.close();
		} catch(error) {
			// error handling
		}
	}

	async readSetting(key, value) {
		try {
			let db = await openDB();
			let store = getStoreReadonly(db, "settings");
			let result = await readData(store, key);
			db.close();
			if (typeof result == "undefined" || result == null) {
				return value;
			}
			return result;
		} catch(error) {
			// error handling
		}
	}

	async removeSetting(key) {
		try {
			let db = await openDB();
			let store = getStoreWritable(db, "settings");
			let result = await deleteData(store, key);
			db.close();
			return !!result;
		} catch(error) {
			// error handling
		}
	}

}

export default new DBStorage;

// TODO split settings and savestates into 2 subclasses using the same database