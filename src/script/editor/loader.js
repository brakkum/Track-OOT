const FILES = [
    "database/items.json",
    "database/locations.json",
    "database/logic.json",
    "database/settings.json",
    "database/lang_en.json"
];

async function loadAll() {
    var buffer = await FileLoader.loadAllJSON(FILES);
    var data = {};
    // items
    data.items = buffer.shift();
    // chests, dungeons & skulltulas
    data.locations = buffer.shift();
    // logic
    data.logic = buffer.shift();
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.settings = buffer.shift();
    data.lang = buffer.shift();

    let addon = buffer.shift();
    while (!!addon) {
        for (let i in addon) {
            if (data.logic.hasOwnProperty(i)) {
                for (let j in addon[i]) {
                    data.logic[i][j] = addon[i][j];
                }
            } else {
                data.logic[i] = addon[i];
            }
        }
        addon = buffer.shift();
    }

    return data;
}