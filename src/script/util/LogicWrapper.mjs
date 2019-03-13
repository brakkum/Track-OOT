import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import {deepEquals} from "/deepJS/util/Helper.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import "/script/ui/logic/LogicItem.mjs";
import "/script/ui/logic/LogicMixin.mjs";
import "/script/ui/logic/LogicOption.mjs";
import "/script/ui/logic/LogicSkip.mjs";
import "/script/ui/logic/LogicFilter.mjs";

const LOGIC = new WeakMap;
const TYPE = new WeakMap;
const REF = new WeakMap;
const VALUE = new WeakMap;

const LOGIC_SOURCE = new WeakMap;
const INSTANCES = new WeakSet;

export default class LogicWrapper {

    constructor(type, ref) {
        TYPE.set(this, type);
        REF.set(this, ref);
        this.loadLogic();
        INSTANCES.add(this);
    }

    set value(val) {
        let buf = parseInt(val);
        if (isNaN(buf)) buf = 0;
        VALUE.set(this, buf);
        let type = TYPE.get(this);
        let ref = REF.get(this);
        EventBus.post("logic", type, ref, buf);
    }

    get value() {
        if (VALUE.has(this)) {
            return VALUE.get(this);
        }
        return false;
    }
    
    loadLogic() {
        let logic;
        if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
            logic = GlobalData.get("logic_patched", GlobalData.get("logic"));
        } else {
            logic = GlobalData.get("logic");
        }
        let type = TYPE.get(this);
        let ref = REF.get(this);
        if (!!logic[type] && !!logic[type][ref]) {
            logic = logic[type][ref];
            if (!LOGIC_SOURCE.has(this) || !deepEquals(LOGIC_SOURCE.get(this), logic)) {
                let build = DeepLogicAbstractElement.buildLogic(logic);
                if (!!build) {
                    build.onupdate = value => {
                        this.value = value;
                    };
                    LOGIC.set(this, build);
                }
                this.value = build.value;
                LOGIC_SOURCE.set(this, logic);
            }
        } else {
            this.value = false;
            LOGIC.delete(this);
            LOGIC_SOURCE.delete(this);
        }
    }

}
        
window.onfocus = function(event) {
    if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
        for (let i of Array.from(INSTANCES)) {
            i.loadLogic();
        }
    }
}