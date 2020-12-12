const REF = new WeakMap();
const ACCESS = new WeakMap();
const TYPE = new WeakMap();

export default class WorldEntry {

    constructor(ref, data) {
        REF.set(this, ref);
        ACCESS.set(this, data.access);
        TYPE.set(this, data.type);
    }

    getRef() {
        return REF.get(this);
    }

    getType() {
        return TYPE.get(this);
    }

    getAccess() {
        return ACCESS.get(this);
    }

}
