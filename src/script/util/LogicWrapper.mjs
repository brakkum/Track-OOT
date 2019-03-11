import EventBus from "/deepJS/util/EventBus.mjs";

const LOGIC = new WeakMap;
const VALUE = new WeakMap;

export default class LogicWrapper {

    constructor(type, ref, logic) {
        let build = DeepLogicAbstractElement.buildLogic(logic[type][ref]);
        build.onupdate = v => {
            this.value = v;
            EventBus.post("logic", type, ref, v);
        };
        LOGIC.set(this, build);
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

}