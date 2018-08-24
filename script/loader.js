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
    data.items = await loadJSON("database/items.json?v=201808241034");
    data.item_grid = await loadJSON("database/item_grid.json?v=201808241034");
    data.item_keys = await loadJSON("database/item_keys.json?v=201808241034");
    // chests, dungeons & skulltulas
    data.chests = await loadJSON("database/chests.json?v=201808241034");
    data.dungeons = await loadJSON("database/dungeons.json?v=201808241034");
    data.skulltulas = await loadJSON("database/skulltulas.json?v=201808241034");
    // logic
    data.logic = {
        chests: await loadJSON("database/logic_chest.json"),
        skulltulas: await loadJSON("database/logic_skulltula.json"),
        dungeons: await loadJSON("database/logic_dungeon.json")
    };
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.lang = await loadJSON("database/lang_en.json?v=201808241034");
    return data;
}