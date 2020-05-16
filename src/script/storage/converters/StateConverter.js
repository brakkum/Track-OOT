import Converter0 from "./StateConverter0.js";
import Converter1 from "./StateConverter1.js";
import Converter2 from "./StateConverter2.js";

const TARGET_VERSION = 3;
const CONVERTER_FN = [
    Converter0,
    Converter1,
    Converter2
];

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
        // TODO full init the savestate with default values
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