import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import LogicWrapper from "/script/util/LogicWrapper.mjs";

const DEFAULT_LOGIC = {
    chests: new Map,
    skulltulas: new Map,
    mixins: new Map
};
const CUSTOM_LOGIC  = {
    chests: new Map,
    skulltulas: new Map,
    mixins: new Map
};

class TrackerLogic {

    loadLogic() {
        let logic = GlobalData.get("logic");
        for (let i of logic.chests) {
            DEFAULT_LOGIC.chests.set(i, new (LogicWrapper("chests", i, logic))); // TODO apply this to the rest
        }
        for (let i of logic.skulltulas) {
            DEFAULT_LOGIC.skulltulas.set(i, DeepLogicAbstractElement.buildLogic(logic.skulltulas[i]));
        }
        for (let i of logic.mixins) {
            DEFAULT_LOGIC.mixins.set(i, DeepLogicAbstractElement.buildLogic(logic.mixins[i]));
        }
        let patched_logic = GlobalData.get("logic_patched");
        for (let i of patched_logic.chests) {
            CUSTOM_LOGIC.chests.set(i, DeepLogicAbstractElement.buildLogic(patched_logic.chests[i]));
        }
        for (let i of patched_logic.skulltulas) {
            CUSTOM_LOGIC.skulltulas.set(i, DeepLogicAbstractElement.buildLogic(patched_logic.skulltulas[i]));
        }
        for (let i of patched_logic.mixins) {
            CUSTOM_LOGIC.mixins.set(i, DeepLogicAbstractElement.buildLogic(patched_logic.mixins[i]));
        }
    }

    getValue(type, ref) {
        if (CUSTOM_LOGIC[type].has(ref)) {
            return CUSTOM_LOGIC[type].get(ref).value;
        }
        if (DEFAULT_LOGIC[type].has(ref)) {
            return DEFAULT_LOGIC[type].get(ref).value;
        }
        return false;
    }

}

export default new TrackerLogic;