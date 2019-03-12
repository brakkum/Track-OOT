
import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";

const LOGIC_DEFAULT = new WeakMap;
const LOGIC_CUSTOM = new WeakMap;
const VALUE = new WeakMap;

const INSTANCES = new WeakSet;

function buildDefaultLogic(logic, type, ref) {
    let build = DeepLogicAbstractElement.buildLogic(logic[type][ref]);
    build.onupdate = v => {
        if (!DeepLocalStorage.get("settings", "use_custom_logic", false)) {
            this.value = v;
            EventBus.post("logic", type, ref, v);
        }
    };
    return build;
}

function buildCustomLogic(logic, type, ref) {
    let build = DeepLogicAbstractElement.buildLogic(logic[type][ref]);
    build.onupdate = v => {
        if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
            this.value = v;
            EventBus.post("logic", type, ref, v);
        }
    };
    return build;
}

export default class LogicWrapper {

    constructor(type, ref) {
        LOGIC_DEFAULT.set(this, buildDefaultLogic.apply(this, GlobalData.get("logic"), type, ref, false));
        LOGIC_CUSTOM.set(this, buildCustomLogic.apply(this, GlobalData.get("logic_patched"), type, ref, true));
        INSTANCES.add(this);
    }

    set value(value) {
        VALUE.set(this, value);
    }

    get value() {
        if (VALUE.has(this)) {
            return VALUE.get(this);
        }
        return false;
    }

    loadCustomLogic() {
        if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
            let oldValue = GlobalData.get("logic_patched", {});
            let newValue = DeepLocalStorage.get("settings", "logic", {});
            if (JSON.stringify(oldValue) == JSON.stringify(newValue)) {
                GlobalData.set("logic_patched", newValue);
                
            }
        }
    }

}

window.onfocus = function(ev) {
    
}