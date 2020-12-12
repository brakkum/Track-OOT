import NumberState from "/emcJS/data/state/NumberState.js";
import StateStorage from "/script/storage/StateStorage.js";

const REF = new WeakMap();
const PROPS = new WeakMap();

export default class AbstractItemState extends NumberState {

    constructor(ref, props, max, min) {
        super(max, min);
        this.value = StateStorage.read(ref, 0);
        REF.set(this, ref);
        PROPS.set(this, props);
    }

    convert(value) {
        if (typeof value != "number" || isNaN(value)) value = 0;
        const max = this.max;
        const min = this.min;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        return value;
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
