/**
 * move to serverside past 2020‑12‑31
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    let res = {
        data: {},
        autosave: false,
        timestamp: new Date(),
        name: state.name || ""
    };
    for (let i of Object.keys(state.data)) {
        for (let j of Object.keys(state.data[i])) {
            if (i != "meta") {
                if (i == "extras") {
                    res.data[j] = state.data[i][j];
                } else {
                    res.data[`${i}.${j}`] = state.data[i][j];
                }
            } else {
                res.name = state.data["meta"]["active_state"];
            }
        }
    }
    return res;
});