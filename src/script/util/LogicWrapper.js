import GlobalData from "/script/storage/GlobalData.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Helper from "/deepJS/util/Helper.js";
import SettingsStorage from "/script/storage/SettingsStorage.js";
import LogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.js";

import "/deepJS/ui/logic/elements/literals/LogicTrue.js";
import "/deepJS/ui/logic/elements/operators/LogicAnd.js";
import "/deepJS/ui/logic/elements/operators/LogicOr.js";
import "/deepJS/ui/logic/elements/operators/LogicNot.js";
import "/deepJS/ui/logic/elements/restrictors/LogicMin.js";
import "/script/ui/logic/LogicItem.js";
import "/script/ui/logic/LogicMixin.js";
import "/script/ui/logic/LogicOption.js";
import "/script/ui/logic/LogicSkip.js";
import "/script/ui/logic/LogicFilter.js";

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
        EventBus.register("settings", event => this.loadLogic());
        window.addEventListener('focus', function(event) {
            this.loadLogic();
            event.preventDefault();
            return false;
        }.bind(this));
    }

    set value(val) {
        let buf = parseInt(val) || 0;
        if (VALUE.get(this) != buf) {
            VALUE.set(this, buf);
            let type = TYPE.get(this);
            let ref = REF.get(this);
            EventBus.trigger("logic", {
                type: type,
                ref: ref,
                value: buf
            });
        }
    }

    get value() {
        if (VALUE.has(this)) {
            return VALUE.get(this);
        }
        return false;
    }
    
    async loadLogic() {
        let type = TYPE.get(this);
        let ref = REF.get(this);
        let logic = null;
        if (await SettingsStorage.get("use_custom_logic", false)) {
            let custom_logic = await SettingsStorage.get("logic", {});
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
            if (!LOGIC_SOURCE.has(this) || !Helper.deepEquals(LOGIC_SOURCE.get(this), logic)) {
                let build = LogicAbstractElement.buildLogic(logic);
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

    buildSVG() {
        if (LOGIC_SOURCE.has(this)) {
            return LogicAbstractElement.buildSVG(LOGIC_SOURCE.get(this));
        } else {
            return LogicAbstractElement.buildSVG();
        }
    }

    getLogic() {
        if (LOGIC.has(this)) {
            return LOGIC.get(this);
        }
    }

}
        
window.onfocus = async function(event) {
    if (await SettingsStorage.get("use_custom_logic", false)) {
        for (let i of Array.from(INSTANCES)) {
            i.loadLogic();
        }
    }
}