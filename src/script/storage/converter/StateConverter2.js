import StateConverter from "../StateConverter.js";

function convertShopItem(item) {
    if (!item.item.startsWith("item.")) {
        item.item = `item.${item.item}`;
    }
    return item;
}

StateConverter.register(function(state) {
    let res = {
        data: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 3,
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        switch (i) {
            case "skips.wt_bosskey_noitem":
                res.data["skip.wt_bosskey_noitem"] = state.data[i];
                break;
            case "option.doors_open_zora":
                res.data[i] = state.data[i] ? "doors_open_zora_both" : "doors_open_zora_closed";
                break;
            case "shop.kokiri":
            case "shop.goron":
            case "shop.zora":
            case "shop.bombchu":
            case "shop.basar_child":
            case "shop.magic_child":
            case "shop.basar_adult":
            case "shop.magic_adult":
                res.data[i] = state.data[i].map(convertShopItem);
                break;
            default:
                res.data[i] = state.data[i];
                break;
        }
    }
    return res;
});