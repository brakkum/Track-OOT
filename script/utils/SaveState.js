window.SaveState = new (function SaveState() {

    var state = {};

    this.save = function(name) {
        Storage.set("save", name, state);
    }

    this.load = function(name) {
        state = Storage.get("save", name);
    }

    this.write = function(category, key, value) {
        state[category] = state[category] || {};
        state[category][key] = value;
    }

    this.read = function(category, key, def) {
        if (state.hasOwnProperty(category) && state[category].hasOwnProperty(key)) {
            return state[category][key];
        }
        return def;
    }

    this.reset = function() {
        state = {};
    }

})();