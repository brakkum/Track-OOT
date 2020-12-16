/**
 * move to serverside past 2020‑12‑31
 */

import StateConverter from "../StateConverter.js";

StateConverter.register(function(state) {
    if (!state["data"] != null) {
        state = {data: state};
    }
    const res = {
        data: {},
        autosave: false,
        timestamp: new Date(),
        name: state.name || ""
    };
    for (const i of Object.keys(state.data)) {
        for (const j of Object.keys(state.data[i])) {
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
