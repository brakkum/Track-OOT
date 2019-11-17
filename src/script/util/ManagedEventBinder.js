import EventBus from "/deepJS/util/events/EventBus.js";

const INSTANCES = new Map;
const ALLS = new Set;
const SUBS = new Map;


function triggerEvent(data = {name:"",data:{}}) {
    if (SUBS.has(data.name)) SUBS.get(data.name).forEach(function(fn) {
        fn(data);
    });
    ALLS.forEach(function(fn) {
        fn(data);
    });
}

class ManagedEventBinder {

    constructor(name) {
        if (INSTANCES.has(name)) {
            return INSTANCES.get(name);
        }
        EventBus.register(triggerEvent);
        INSTANCES.set(name, this);
    }

    register(name, fn) {
        if (typeof name == "function") {
            ALLS.add(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.register(n, fn));
            } else {
                let subs;
                if (!SUBS.has(name)) {
                    subs = new Set;
                    SUBS.set(name, subs);
                } else {
                    subs = SUBS.get(name);
                }
                subs.add(fn);
            }
        }
    }

    unregister(name, fn) {
        if (typeof name == "function") {
            ALLS.delete(name);
        } else {
            if (Array.isArray(name)) {
                name.forEach(n => this.unregister(n, fn));
            } else {
                if (SUBS.has(name)) {
                    let subs = SUBS.get(name);
                    if (subs.has(fn)) {
                        subs.delete(fn);
                    }
                }
            }
        }
    }

    reset() {
        ALLS.clear();
        SUBS.clear();
    }

}

export default ManagedEventBinder;