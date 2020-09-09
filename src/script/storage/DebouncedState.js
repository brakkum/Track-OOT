
import Helper from "/emcJS/util/Helper.js";

const CATEGORY = new WeakMap();
const STATE = new WeakMap();
const CHANGES = new WeakMap();
const DEBOUNCE_TIMER = new WeakMap();

const DEBOUNCE_TIME = 500;

export default class DebouncedState extends EventTarget {

    constructor(category) {
        super();
        CATEGORY.set(this, category);
        CHANGES.set(this, new Map());
        STATE.set(this, new Map());
    }

    clear() {
        let state = STATE.get(this);
        let changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        state.clear();
        changes.clear();
    }

    overwrite(key, value) {
        let state = STATE.get(this);
        let changes = CHANGES.get(this);
        state.set(key, value);
        if (changes.has(key)) {
            if (Helper.isEqual(changes.get(key), value)) {
                changes.delete(key);
            }
        }
        if (!changes.size && DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
    }

    overwriteAll(data) {
        for (let key in data) {
            let value = data[key];
            this.overwrite(key, value);
        }
    }

    set(key, value) {
        let state = STATE.get(this);
        let changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        if (!state.has(key) || !Helper.isEqual(state.get(key), value)) {
            changes.set(key, value);
        } else {
            changes.delete(key);
        }
        if (!!changes.size) {
            DEBOUNCE_TIMER.set(this, setTimeout(() => {
                let changed = {};
                for (let [key, value] of changes) {
                    changed[key] = {
                        oldValue: state.get(key),
                        newValue: value
                    };
                    state.set(key, value);
                }
                changes.clear();
                let event = new Event("change");
                event.category = CATEGORY.get(this);
                event.data = changed;
                this.dispatchEvent(event);
            }, DEBOUNCE_TIME));
        }
    }

    setAll(data) {
        for (let key in data) {
            let value = data[key];
            this.set(key, value);
        }
    }

    get(key) {
        let state = STATE.get(this);
        let changes = CHANGES.get(this);
        if (changes.has(key)) {
            return changes.get(key);
        } else {
            return state.get(key);
        }
    }

    getAll() {
        let state = STATE.get(this);
        let data = {};
        for (let [key, value] of state) {
            data[key] = value;
        }
        return data;
    }

    has(key) {
        let state = STATE.get(this);
        let changes = CHANGES.get(this);
        if (changes.has(key) || state.has(key)) {
            return true;
        } else {
            return false;
        }
    }

}