const EXIT_TRANS = {
    "region.deku_tree_lobby": "region.deku_tree_gateway",
    "region.dodongos_cavern_beginning": "region.dodongos_cavern_gateway",
    "region.jabu_jabus_belly_beginning": "region.jabu_jabus_belly_gateway",
    "region.bottom_of_the_well": "region.bottom_of_the_well_gateway",
    "region.forest_temple_lobby": "region.forest_temple_gateway",
    "region.fire_temple_lower": "region.fire_temple_gateway",
    "region.water_temple_lobby": "region.water_temple_gateway",
    "region.spirit_temple_lobby": "region.spirit_temple_gateway",
    "region.shadow_temple_entryway": "region.shadow_temple_gateway",
    "region.ice_cavern_beginning": "region.ice_cavern_gateway",
    "region.gerudo_training_grounds_lobby": "region.gerudo_training_grounds_gateway"
};

export default function(state) {
    let res = {
        data: {},
        extra: state.extra || {},
        notes: state.notes || state.data.notes || "",
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
    if (state.extra.exits != null) {
        let buf = {};
        for (let i of Object.keys(state.extra.exits)) {
            let [k1, k2] = i.split(" -> ");
            let [v1, v2] = state.extra.exits[i].split(" -> ");
            buf[`${EXIT_TRANS[k1] || k1} -> ${EXIT_TRANS[k2] || k2}`] = `${EXIT_TRANS[v1] || v1} -> ${EXIT_TRANS[v2] || v2}`;
        }
        res.extra.exits = buf;
    }
    return res;
};