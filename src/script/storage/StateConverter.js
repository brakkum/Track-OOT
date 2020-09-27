const CONVERTER_FN = [];
let OFFSET = 0;

class StateConverter {

    set offset(value) {
        OFFSET = Math.max(parseInt(value) || 0, 0);
    }

    convert(state) {
        const TARGET_VERSION = OFFSET + CONVERTER_FN.length;
        if (!state.hasOwnProperty("data")) {
            state = {data: state};
        }
        const name = state.name || "";
        const timestamp = state.timestamp || new Date();
        const autosave = state.autosave || new Date();
        const notes = state.notes || "";
        const version = state.version || 0;
        if (version < TARGET_VERSION) {
            for (let i = version; i < TARGET_VERSION; ++i) {
                state = CONVERTER_FN[i - OFFSET](state);
            }
            state.name = name;
            state.timestamp = timestamp;
            state.autosave = autosave;
            state.notes = notes;
            state.version = TARGET_VERSION;
        }
        return state;
    }

    createEmptyState(data) {
        const TARGET_VERSION = CONVERTER_FN.length;

        let res = {
            name: "",
            data: {},
            extra: {},
            notes: "",
            autosave: false,
            timestamp: new Date(),
            version: TARGET_VERSION
        };
    
        if (typeof data == "object") {
            data = JSON.parse(JSON.stringify(data));
            for (let i in data) {
                res.data[i] = data[i];
            }
        }
    
        return res;
    }

    register(conv) {
        if (typeof conv == "function") {
            CONVERTER_FN.push(conv);
        }
    }

}

export default new StateConverter;