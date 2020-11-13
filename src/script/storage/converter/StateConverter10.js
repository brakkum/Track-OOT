/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    let res = {
        data: state.data,
        extra: {},
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    const exits = {};
    if (state.extra.exits != null) {
        for (let i of Object.keys(state.extra.exits)) {
            exits[translation[i] || i] = translation[state.extra.exits[i]] || state.extra.exits[i];
        }
    }
    res.extra = {...state.extra, exits};
    return res;
});

const translation = {
    "region.shadow_temple_entrence -> region.shadow_temple_gateway": "region.shadow_temple_entrance -> region.shadow_temple_gateway",
    "region.shadow_temple_gateway -> region.shadow_temple_entrence": "region.shadow_temple_gateway -> region.shadow_temple_entrance",
};