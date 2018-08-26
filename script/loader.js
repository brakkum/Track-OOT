function loadText(file) {
    return fetch(new Request(file, {
        method: 'GET',
        headers: new Headers({
            "Content-Type": "text/plain",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }),
        mode: 'cors',
        cache: 'default'
    })).then(r => r.text());
}

function loadJSON(file) {
    return fetch(new Request(file, {
        method: 'GET',
        headers: new Headers({
            "Content-Type": "application/json",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
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
    data.item_keys = await loadJSON("database/item_keys.json");
    // chests, dungeons & skulltulas
    data.chests = await loadJSON("database/chests.json");
    data.dungeons = await loadJSON("database/dungeons.json");
    data.skulltulas = await loadJSON("database/skulltulas.json");
    // logic
    data.logic = await loadJSON("database/logic.json")
    /*data.logic = {
        chests: await loadJSON("database/logic_chest.json"),
        skulltulas: await loadJSON("database/logic_skulltula.json"),
        dungeons: await loadJSON("database/logic_dungeon.json")
    };*/
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.lang = await loadJSON("database/lang_en.json");
    return data;
}