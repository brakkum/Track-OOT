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
        if (category == "mixin") {
            if (typeof mixins[key] == "function") {
                return mixins[key]();
            }
        } else if (state.hasOwnProperty(category) && state[category].hasOwnProperty(key)) {
            return state[category][key];
        }
        return def;
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

    var mixins = {
        "medallions": function() {
            return state.hasOwnProperty("items")
                && state.items.medallion_forest
                && state.items.medallion_fire
                && state.items.medallion_water
                && state.items.medallion_spirit
                && state.items.medallion_shadow
                && state.items.medallion_light;
        }
    };

}