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
    // change dungeonreward
    const dungeonreward = {};
    if (state.extra.dungeonreward != null) {
        for (const i of Object.keys(state.extra.dungeonreward)) {
            dungeonreward[translation[i] || i] = translation[state.extra.dungeonreward[i]] || state.extra.dungeonreward[i];
        }
    }
    // change dungeontype
    const dungeontype = {};
    if (state.extra.dungeontype != null) {
        for (const i of Object.keys(state.extra.dungeontype)) {
            dungeontype[translation[i] || i] = translation[state.extra.dungeontype[i]] || state.extra.dungeontype[i];
        }
    }
    // collect data
    res.extra = {...state.extra, dungeonreward, dungeontype};
    return res;
});

const translation = {
    "pocket": "area/pocket"
};
