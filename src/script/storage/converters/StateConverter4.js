export default function(state) {
    let res = {
        data: {},
        entrance_rewrites: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 4,//5, // keep this until release
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        // possible changes go here
        res.data[i] = state.data[i];
    }
    if (res.data["option.starting_age"] == null) {
        res.data["option.starting_age"] = "child";
    }
    return res;
};