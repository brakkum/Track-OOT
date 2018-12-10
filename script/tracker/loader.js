async function loadAll() {
    var buffer = await FileLoader.loadAllJSON([
        "database/items.json",
        "database/grids.json",
        "database/chests.json",
        "database/dungeons.json",
        "database/skulltulas.json",
        "database/songs.json",
        "database/logic.json",
        "database/rom_options.json",
        "database/shops.json",
        "database/shop_items.json",
        "database/lang_en.json"
    ]);
    var data = {};
    // items
    data.items = buffer.shift();
    data.grids = buffer.shift();
    // chests, dungeons & skulltulas
    data.chests = buffer.shift();
    data.dungeons = buffer.shift();
    data.skulltulas = buffer.shift();
    data.songs = buffer.shift();
    // logic
    data.logic = buffer.shift();
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.rom_options = buffer.shift();
    data.shops = buffer.shift();
    data.shop_items = buffer.shift();
    data.lang = buffer.shift();
    return data;
}