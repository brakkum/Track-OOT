const TARGET_VERSION = 1;
const CONVERTER_FN = [];

CONVERTER_FN[0] = function(state) {
    let res = {
        data: {},
        autosave: false,
        timestamp: new Date(),
        version: 1,
        name: state.name || ""
    };
    for (let i of Object.keys(state.data)) {
        for (let j of Object.keys(state.data[i])) {
            if (i != "meta") {
                if (i == "extras") {
                    res.data[j] = state.data[i][j];
                } else {
                    res.data[`${i}.${j}`] = state.data[i][j];
                }
            } else {
                res.name = state.data["meta"]["active_state"];
            }
        }
    }
    return res;
};

class StateConverter {

    convert(state) {
        let version = state.version || 0;
        if (version < TARGET_VERSION) {
            for (let i = version; i < TARGET_VERSION; ++i) {
                if (typeof CONVERTER_FN[i] == "function") {
                    state = CONVERTER_FN[i](state);
                }
            }
        }
        return state;
    }

    createEmptyState() {
        return {
            name: "",
            data: {},
            autosave: false,
            timestamp: new Date(),
            version: TARGET_VERSION
        };
    }

}

export default new StateConverter;