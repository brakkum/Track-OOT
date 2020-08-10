export default function(state) {
    let res = {
        data: {},
        entrance_rewrites: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 4,//5, // keep this until release
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        // possible changes go here
        res.data[i] = state.data[i];
    }
    if (res.data["option.starting_age"] == null) {
        res.data["option.starting_age"] = "child";
    }
    if (res.data["option.light_arrow_cutscene"] == null) {
        res.data["option.light_arrow_cutscene"] = "light_arrow_cutscene_vanilla";
    }
    if (res.data["option.doors_open_forest"] == null || res.data["option.doors_open_forest"] === true) {
        res.data["option.doors_open_forest"] = "doors_open_forest_open";
    }
    if (res.data["option.doors_open_forest"] === false) {
        res.data["option.doors_open_forest"] = "doors_open_forest_closed";
    }
    return res;
};