import LogicWrapper from "/script/util/LogicWrapper.mjs";

const LOGIC = {
    chests: {},
    skulltulas: {},
    hintstones: {},
    mixins: {}
};

class TrackerLogic {

    loadLogic() { // TODO get location list from locations file
        for (let i of logic.chests) {
            LOGIC.chests[i] = new LogicWrapper("chests", i);
        }
        for (let i of logic.skulltulas) {
            LOGIC.skulltulas[i] = new LogicWrapper("skulltulas", i);
        }
        for (let i of logic.hintstones) {
            LOGIC.hintstones[i] = new LogicWrapper("hintstones", i);
        }
        for (let i of logic.mixins) {
            LOGIC.mixins.set[i] = new LogicWrapper("mixins", i);
        }
    }

    getValue(type, ref) {
        if (!!LOGIC[type] && !!LOGIC[type][ref]) {
            return LOGIC[type][ref].value;
        }
        return false;
    }

}

export default new TrackerLogic;