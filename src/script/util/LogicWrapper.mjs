import DeepLocalStorage from "/deepJS/storage/LocalStorage.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import {deepEquals} from "/deepJS/util/Helper.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";

import "/deepJS/ui/logic/elements/literals/LogicTrue.mjs";
import "/deepJS/ui/logic/elements/operators/LogicAnd.mjs";
import "/deepJS/ui/logic/elements/operators/LogicOr.mjs";
import "/deepJS/ui/logic/elements/operators/LogicNot.mjs";
import "/deepJS/ui/logic/elements/restrictors/LogicMin.mjs";
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
        EventBus.on("settings", this.loadLogic.bind(this));
        window.addEventListener('focus', function(event) {
            this.loadLogic();
            event.preventDefault();
            return false;
        }.bind(this));
    }

    set value(val) {
        let buf = parseInt(val) || 0;
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
        let type = TYPE.get(this);
        let ref = REF.get(this);
        let logic = null;
        if (DeepLocalStorage.get("settings", "use_custom_logic", false)) {
            let custom_logic = GlobalData.get("logic_patched", {});
            if (!!custom_logic[type] && !!custom_logic[type][ref]) {
                logic = custom_logic[type][ref];
            }
        }
        if (!logic) {
            let default_logic = GlobalData.get("logic", {});
            if (!!default_logic[type] && !!default_logic[type][ref]) {
                logic = default_logic[type][ref];
            }
        }
        if (!!logic) {
            if (!LOGIC_SOURCE.has(this) || !deepEquals(LOGIC_SOURCE.get(this), logic)) {
                let build = DeepLogicAbstractElement.buildLogic(logic);
                if (!!build) {
                    build.addEventListener('update', function(event) {
                        this.value = event.value;
                    }.bind(this));
                    build.readonly = true;
                    build.visualize = true;
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

    getLogic() {
        if (LOGIC.has(this)) {
            return LOGIC.get(this);
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