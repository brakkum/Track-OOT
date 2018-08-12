function loadText(file) {
    return fetch(new Request(file, {
        method: 'GET',
        headers: new Headers({
            "Content-Type": "text/plain"
        }),
        mode: 'cors',
        cache: 'default'
    })).then(r => r.text());
}

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
    // items
    data.items = await loadJSON("database/items.json");
    data.item_grid = await loadJSON("database/item_grid.json");
    // chests & dungeons
    data.chests = await loadJSON("database/chests.json");
    data.dungeons = await loadJSON("database/dungeons.json");
    data.dungeon_chests = await loadJSON("database/dungeon_chests.json");
    // logic
    data.chest_logic = await loadJSON("database/chest_logic.json");
    data.dungeon_logic = await loadJSON("database/dungeon_logic.json");
    data.skulltula_logic = await loadJSON("database/skulltula_logic.json");
    // misc
    data.lang = await loadJSON("database/lang_en.json");
    data.version = await loadText("version");
    return data;
}