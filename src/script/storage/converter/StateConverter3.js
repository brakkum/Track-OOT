import StateConverter from "../StateConverter.js";

const REWARDS = [
    "",
    "item.stone_forest",
    "item.stone_fire",
    "item.stone_water",
    "item.medallion_forest",
    "item.medallion_fire",
    "item.medallion_water",
    "item.medallion_spirit",
    "item.medallion_shadow",
    "item.medallion_light"
];

StateConverter.register(function(state) {
    let res = {
        data: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 4,
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        if (i.startsWith("dungeonRewards.")) {
            res.data[i] = REWARDS[state.data[i]];
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});