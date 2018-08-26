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
    var version = "201808261514";
    var data = {};
    // items
    data.items = await loadJSON("database/items.json?v="+version);
    data.item_grid = await loadJSON("database/item_grid.json?v="+version);
    data.item_keys = await loadJSON("database/item_keys.json?v="+version);
    // chests, dungeons & skulltulas
    data.chests = await loadJSON("database/chests.json?v="+version);
    data.dungeons = await loadJSON("database/dungeons.json?v="+version);
    data.skulltulas = await loadJSON("database/skulltulas.json?v="+version);
    // logic
    data.logic = await loadJSON("database/logic.json?v="+version)
    /*data.logic = {
        chests: await loadJSON("database/logic_chest.json"),
        skulltulas: await loadJSON("database/logic_skulltula.json"),
        dungeons: await loadJSON("database/logic_dungeon.json")
    };*/
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.lang = await loadJSON("database/lang_en.json?v="+version);
    return data;
}