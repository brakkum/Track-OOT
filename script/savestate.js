function SaveState(json) {

    var state = {};
    try {
        state = JSON.parse(json);
    } catch(e) {
        /* don't do anything */
    }
    runCompatibility();

    this.export = function() {
        return JSON.stringify(state);
    }

    this.write = function write(category, key, value) {
        state[category] = state[category] || {};
        state[category][key] = value;
    }

    this.read = function read(category, key, def) {
        if (!state[category]) {
            return def;
        }
        return state[category][key] || def;
    }

    function runCompatibility() {
        if (state.hasOwnProperty("items")) {
            if (state.items.hasOwnProperty("tunic_goron")) {
                state.items.tunic_fire = state.items.tunic_goron;
            }
            if (state.items.hasOwnProperty("tunic_zora")) {
                state.items.tunic_water = state.items.tunic_zora;
            }
        }
    }

}