export default function(state) {
    let res = {
        data: {},
        autosave: false,
        timestamp: new Date(),
        version: 1,
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
};