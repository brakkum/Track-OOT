import Converter0 from "./StateConverter0.js";
import Converter1 from "./StateConverter1.js";
import Converter2 from "./StateConverter2.js";
import Converter3 from "./StateConverter3.js";
import Converter4 from "./StateConverter4.js";

const CONVERTER_FN = [
    Converter0,
    Converter1,
    Converter2,
    Converter3,
    Converter4
];
const TARGET_VERSION = CONVERTER_FN.length;

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
            entrance_rewrites: {},
            autosave: false,
            timestamp: new Date(),
            version: 4 //TARGET_VERSION // keep this until release
        };
    }

}

export default new StateConverter;