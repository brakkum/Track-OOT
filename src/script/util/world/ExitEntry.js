import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import WorldEntry from "/script/util/world/WorldEntry.js";

function valueGetter(key) {
    return this.get(key);
}

const ACTIVE = new WeakMap();

export default class ExitEntry extends WorldEntry {

    constructor(ref, data) {
        super(ref, data);
        let active_logic = null;

        /* LOGIC */
        if (typeof data.active == "object") {
            const stored_data = new Map(Object.entries(StateStorage.getAll()));
            active_logic = LogicCompiler.compile(data.active);
            ACTIVE.set(this, !!active_logic(valueGetter.bind(stored_data)));
        } else {
            ACTIVE.set(this, !!data.active);
        }

        /* EVENTS */
        const calculateFilter = function(data) {
            if (typeof active_logic == "function") {
                ACTIVE.set(this, !!active_logic(valueGetter.bind(data)));
            }
        }.bind(this);
        EventBus.register("state", event => {
            calculateFilter(new Map(Object.entries(event.data.state)));
        });
        EventBus.register("randomizer_options", event => {
            calculateFilter(new Map(Object.entries(event.data)));
        });
    }

    active() {
        return !!ACTIVE.get(this);
    }

    access() {
        return this.getAccess();
    }

}
