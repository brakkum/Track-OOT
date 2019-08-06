function getOldStates() {
	let k = Object.keys(localStorage);
	k = k.filter(filterCategory.bind(this, category));
	k = k.map(getName);
	return Array.from(new Set(k));
}

function openDB() {
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open("data");
        request.onupgradeneeded = function() {
            var db = this.result;
            if(!db.objectStoreNames.contains("savestates")){
				let store = db.createObjectStore("savestates", {keyPath: "name"});
				
				store.add();
            }
            if(!db.objectStoreNames.contains("settings")){
                db.createObjectStore("settings");
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

// TODO all down from here
function writeData(db, store, key, value) {
	return new Promise(function(resolve, reject) {
		var request = db.transaction([store],"readwrite").objectStore(store).add(value, key);
		request.onsuccess = function(e) {
			resolve();
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function readData(db, store, key) {
	return new Promise(function(resolve, reject) {
		var request = db.transaction([store],"readonly").objectStore(store).get(key);
		request.onsuccess = function(e) {
			resolve(e.target.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}
function deleteData(db, store, key) {
	return new Promise(function(resolve, reject) {
		var request = db.transaction([store],"readwrite").objectStore(store).delete(key);
		request.onsuccess = function(e) {
			resolve(e.target.result);
		};
		request.onerror = function(e) {
			reject(e);
		}
	});
}

class IndexedDB {

	async writeState(name, key, value) {
		try {
			var db = await openDB(name);
			await writeData(db, "savestates", key, value);
			db.close();
		} catch(error) {
			// error handling
		}
	}

	async readState(name, key, value) {
		try {
			var db = await openDB(name);
			var result = await readData(db, "savestates", key);
			db.close();
			if (typeof result == "undefined" || result == null) {
				return value;
			}
			return result;
		} catch(error) {
			// error handling
		}
	}

	async removeState(name, key) {
		try {
			var db = await openDB(name);
			var result = await deleteData(db, "savestates", key);
			db.close();
			return !!result;
		} catch(error) {
			// error handling
		}
	}

	async writeSetting(name, key, value) {
		try {
			var db = await openDB(name);
			await writeData(db, "settings", key, value);
			db.close();
		} catch(error) {
			// error handling
		}
	}

	async readSetting(name, key, value) {
		try {
			var db = await openDB(name);
			var result = await readData(db, "settings", key);
			db.close();
			if (typeof result == "undefined" || result == null) {
				return value;
			}
			return result;
		} catch(error) {
			// error handling
		}
	}

	async removeSetting(name, key) {
		try {
			var db = await openDB(name);
			var result = await deleteData(db, "settings", key);
			db.close();
			return !!result;
		} catch(error) {
			// error handling
		}
	}

}

export default new IndexedDB;