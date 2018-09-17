async function loadAll() {
    var buffer = await FileLoader.loadAllJSON([
        "database/items.json",
        "database/item_grid.json",
        "database/item_keys.json",
        "database/chests.json",
        "database/dungeons.json",
        "database/skulltulas.json",
        "database/logic.json",
        "database/rom_options.json",
        "database/shops.json",
        "database/lang_en.json"
    ]);
    var data = {};
    // items
    data.items = buffer[0];
    data.item_grid = buffer[1];
    data.item_keys = buffer[2];
    // chests, dungeons & skulltulas
    data.chests = buffer[3];
    data.dungeons = buffer[4];
    data.skulltulas = buffer[5];
    // logic
    data.logic = buffer[6];
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.rom_options = buffer[7];
    data.shops = buffer[8];
    data.lang = buffer[9];
    return data;
}