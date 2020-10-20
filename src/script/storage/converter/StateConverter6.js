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
    for (let i of Object.keys(state.data)) {
        if (i == "location.kokiri.c_midos_house") {
            const val = state.data["location.kokiri.c_midos_house"];
            res.data["location.kokiri.c_midos_house_1"] = val;
            res.data["location.kokiri.c_midos_house_2"] = val;
            res.data["location.kokiri.c_midos_house_3"] = val;
            res.data["location.kokiri.c_midos_house_4"] = val;
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});