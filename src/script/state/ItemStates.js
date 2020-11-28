import FileData from "/emcJS/storage/FileData.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";

let DATA = null;

const CLAZZ = new Map();
const INSTANCES = new Map();

function initData() {
    if (DATA == null) {
        DATA = FileData.get("items");
    }
}

class ItemStates {

    register(type, clazz) {
        CLAZZ.set(type, clazz);
    }

    has(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        initData();
        return DATA[ref] != null;
    }

    get(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        if (!this.has(ref)) {
            throw new ReferenceError("the item reference does not exist");
        }
        if (!INSTANCES.has(ref)) {
            initData();
            const props = DATA[ref];
            if (!CLAZZ.has(props.type)) {
                const inst = new AbstractItemState(ref, props);
                INSTANCES.set(ref, inst);
                return inst;
            } else {
                const clazz = CLAZZ.get(props.type);
                const inst = new clazz(ref, props);
                INSTANCES.set(ref, inst);
                return inst;
            }
        }
        return INSTANCES.get(ref);
    }

}

export default new ItemStates();