import EventBus from "/deepJS/util/events/EventBus.js";

const IDS = new WeakMap();
const ALLS = new Map();
const SUBS = new Map();

EventBus.register(function(data = {name:"",data:{}}) {
    SUBS.forEach(function(subs) {
        if (subs.has(data.name)) {
            subs.get(data.name).forEach(function(fn) {
                fn(data);
            });
        }
    });
    ALLS.forEach(function(alls) {
        alls.forEach(function(fn) {
            fn(data);
        });
    });
});

function getAlls(id) {
    return ALLS.get(id);
}

function getSubs(id, name) {
    let subs = SUBS.get(id);
    if (subs.has(name)) {
        return subs.get(name);
    } else {
        let buf = new Set();
        subs.set(name, buf);
        return buf;
    }
}

class ManagedEventBinder {

    constructor(id) {
        IDS.set(this, id);
        if (!SUBS.has(id)) {
            SUBS.set(id, new Map());
        }
        if (!ALLS.has(id)) {
            ALLS.set(id, new Set());
        }
    }

    register(name, fn) {
        let id = IDS.get(this);
        if (typeof name == "function") {
            getAlls(id).add(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.register(n, fn));
            } else {
                getSubs(id, name).add(fn);
            }
        }
    }

    unregister(name, fn) {
        let id = IDS.get(this);
        if (typeof name == "function") {
            getAlls(id).delete(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.unregister(n, fn));
            } else {
                getSubs(id, name).delete(fn);
            }
        }
    }

    reset() {
        let id = IDS.get(this);
        getAlls(id).clear();
        getSubs(id, name).clear();
    }

}

export default ManagedEventBinder;