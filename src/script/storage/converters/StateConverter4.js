export default function(state) {
    let res = {
        data: {},
        extra: state.extra || {},
        notes: state.data.notes || "",
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 4,//5, // keep this until release
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        // possible changes go here
        if (i == "notes") continue;
        if (i.startsWith("shop.")) {
            if (i.endsWith(".names")) {
                res.extra.shops_names = res.extra.shops_names || {};
                res.extra.shops_names[i.slice(0, -6)] = state.data[i];
            } else if (i.endsWith(".bought")) {
                res.extra.shops_bought = res.extra.shops_bought || {};
                res.extra.shops_bought[i.slice(0, -7)] = state.data[i];
            } else {
                res.extra.shops_items = res.extra.shops_items || {};
                res.extra.shops_items[i] = state.data[i];
            }
        } else if (i.startsWith("song.")) {
            res.extra.songs = res.extra.songs || {};
            res.extra.songs[i] = state.data[i];
        } else {
            res.data[i] = state.data[i];
        }
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