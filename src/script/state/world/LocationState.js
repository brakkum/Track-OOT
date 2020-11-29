import BoolState from "/emcJS/data/state/BoolState.js";
import StateStorage from "/script/storage/StateStorage.js";

const REF = new WeakMap();
const PROPS = new WeakMap();

export default class AbstractItemState extends BoolState {

    constructor(ref, props, max, min) {
        super(max, min);
        this.value = StateStorage.read(ref, false);
        REF.set(this, ref);
        PROPS.set(this, props);
    }

    get ref() {
        return REF.get(this);
    }

    get props() {
        return JSON.parse(JSON.stringify(PROPS.get(this)));
    }

    set value(value) {
        const old = this.value;
        super.value = value;
        if (this.value != old) {
            StateStorage.write(this.ref, parseInt(this.value));
        }
    }

    get value() {
        return super.value;
    }

}