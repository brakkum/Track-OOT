/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    const res = {
        data: state.data,
        extra: {},
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    const exits = {};
    if (state.extra.exits != null) {
        for (const i of Object.keys(state.extra.exits)) {
            exits[translation[i] || i] = translation[state.extra.exits[i]] || state.extra.exits[i];
        }
    }
    res.extra = {...state.extra, exits};
    return res;
});

const translation = {
    "region.kf_outside_deku_tree -> region.deku_tree_gateway": "region.deku_tree_entrance -> region.deku_tree_gateway",
    "region.deku_tree_gateway -> region.kf_outside_deku_tree": "region.deku_tree_gateway -> region.deku_tree_entrance",
    "region.zoras_fountain -> region.jabu_jabus_belly_gateway": "region.jabu_jabus_belly_entrance -> region.jabu_jabus_belly_gateway",
    "region.jabu_jabus_belly_gateway -> region.zoras_fountain": "region.jabu_jabus_belly_gateway -> region.jabu_jabus_belly_entrance",
    "region.kakariko_village -> region.bottom_of_the_well_gateway": "region.bottom_of_the_well_entrance -> region.bottom_of_the_well_gateway",
    "region.bottom_of_the_well_gateway -> region.kakariko_village": "region.bottom_of_the_well_gateway -> region.bottom_of_the_well_entrance",
    "region.sacred_forest_meadow -> region.forest_temple_gateway": "region.forest_temple_entrance -> region.forest_temple_gateway",
    "region.forest_temple_gateway -> region.sacred_forest_meadow": "region.forest_temple_gateway -> region.forest_temple_entrance",
    "region.lake_hylia -> region.water_temple_gateway": "region.water_temple_entrance -> region.water_temple_gateway",
    "region.water_temple_gateway -> region.lake_hylia": "region.water_temple_gateway -> region.water_temple_entrance",
    "region.desert_colossus -> region.spirit_temple_gateway": "region.spirit_temple_entrance -> region.spirit_temple_gateway",
    "region.spirit_temple_gateway -> region.desert_colossus": "region.spirit_temple_gateway -> region.spirit_temple_entrance",
    "region.graveyard_warp_pad_region -> region.shadow_temple_gateway": "region.shadow_temple_entrence -> region.shadow_temple_gateway",
    "region.shadow_temple_gateway -> region.graveyard_warp_pad_region": "region.shadow_temple_gateway -> region.shadow_temple_entrence",
    "region.zoras_fountain -> region.ice_cavern_gateway": "region.ice_cavern_entrance -> region.ice_cavern_gateway",
    "region.ice_cavern_gateway -> region.zoras_fountain": "region.ice_cavern_gateway -> region.ice_cavern_entrance",
    "region.gerudo_fortress -> region.gerudo_training_grounds_gateway": "region.gerudo_training_grounds_entrance -> region.gerudo_training_grounds_gateway",
    "region.gerudo_training_grounds_gateway -> region.gerudo_fortress": "region.gerudo_training_grounds_gateway -> region.gerudo_training_grounds_entrance"
};
