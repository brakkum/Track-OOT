const CONVERTER_FN = [];
let OFFSET = 0;

class StateConverter {

    set offset(value) {
        OFFSET = Math.max(parseInt(value) || 0, 0);
    }

    get offset() {
        return OFFSET;
    }

    get version() {
        return OFFSET + CONVERTER_FN.length;
    }

    convert(state) {
        const version = state.version || 0;
        if (version < OFFSET) {
            // TODO show error to user and link to converter page
        }
        if (!state.hasOwnProperty("data")) {
            state = {data: state};
        }
        const name = state.name || "";
        const timestamp = state.timestamp || new Date();
        const autosave = state.autosave || new Date();
        const notes = state.notes || "";
        if (version < this.version) {
            for (let i = version; i < this.version; ++i) {
                const fn = CONVERTER_FN[i - OFFSET];
                if (typeof fn == "function") state = fn(state);
            }
            state.name = name;
            state.timestamp = timestamp;
            state.autosave = autosave;
            state.notes = notes;
            state.version = this.version;
        }
        return state;
    }

    createEmptyState(data) {
        const res = {
            name: "",
            data: {},
            extra: {},
            notes: "",
            autosave: false,
            timestamp: new Date(),
            version: this.version
        };
        if (typeof data == "object") {
            data = JSON.parse(JSON.stringify(data));
            for (const i in data) {
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

export default new StateConverter();