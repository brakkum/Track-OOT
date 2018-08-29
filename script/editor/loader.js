async function loadAll() {
    var buffer = await FileLoader.loadAllJSON([
        "database/items.json",
        "database/chests.json",
        "database/dungeons.json",
        "database/skulltulas.json",
        "database/logic.json",
        "database/mixins.json",
        "database/settings.json",
        "database/lang_en.json"
    ]);
    var data = {};
    // items
    data.items = buffer[0];
    // chests, dungeons & skulltulas
    data.chests = buffer[1];
    data.dungeons = buffer[2];
    data.skulltulas = buffer[3];
    // logic
    data.logic = buffer[4];
    data.logic.mixins = buffer[5];
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.settings = buffer[6];
    data.lang = buffer[7];
    return data;
}