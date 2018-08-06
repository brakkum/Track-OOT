function loadJSON(file) {
    return fetch(new Request(file, {
        method: 'GET',
        headers: new Headers({
            "Content-Type": "text/json"
        }),
        mode: 'cors',
        cache: 'default'
    })).then(r => r.json());
}

async function loadAll() {
    var data = {};
    data.items = await loadJSON("database/items.json");
    data.chests = await loadJSON("database/chests.json");
    data.dungeons = await loadJSON("database/dungeons.json");
    data.chest_logic = await loadJSON("database/chest_logic.json");
    data.dungeon_logic = await loadJSON("database/dungeon_logic.json");
    data.dungeon_chests = await loadJSON("database/dungeon_chests.json");
    data.lang = await loadJSON("database/lang_en.json");
    data.item_grid = await loadJSON("database/item_grid.json");
    return data;
}