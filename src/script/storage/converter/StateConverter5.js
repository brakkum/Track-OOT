/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    let res = {
        data: {},
        extra: state.extra,
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    res.extra.dungeonreward = {};
    res.extra.dungeontype = {};
    for (let i of Object.keys(state.data)) {
        if (i.startsWith("dungeonRewards.")) {
            const key = i.slice(15);
            res.extra.dungeonreward[key] = state.data[i];
        } else if (i.startsWith("dungeonTypes.")) {
            const key = i.slice(13);
            res.extra.dungeontype[key] = state.data[i];
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});