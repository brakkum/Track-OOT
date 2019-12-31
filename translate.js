const fs = require('fs');

const LOCATION_STRUCT = {
    "type": "chest",
    "time": "always",
    "child": true,
    "adult": true,
    "visible": true
}

const ENTRANCE_STRUCT = {
    "type": "interior",
    "time": "always",
    "child": true,
    "adult": true,
    "visible": true
}

let translation = JSON.parse(fs.readFileSync("./src/_rework/buffer/translation.json"));
let locations = JSON.parse(fs.readFileSync("./src/_rework/buffer/locations.json"));
let items = JSON.parse(fs.readFileSync("./src/database/items.json"));
let settings = JSON.parse(fs.readFileSync("./src/database/settings.json"));
let shops = JSON.parse(fs.readFileSync("./src/database/shops.json"));
let songs = JSON.parse(fs.readFileSync("./src/database/songs.json"));
let logic = JSON.parse(fs.readFileSync("./src/database/logic.json"));

let lang_en = fs.readFileSync("./src/i18n/en_us.lang", "utf8");
let lang_en2 = fs.readFileSync("./src/i18n/en_us.easy.lang", "utf8");
let lang_de = fs.readFileSync("./src/i18n/de_de.lang", "utf8");

let world = {
    "locations": {},
    "areas": {},
    "entrances": {}
};
let maps = {
    "main": {
        "background": "",
        "locations": [],
    }
}
let citems = {};
let csettings = {
    "settings": settings.settings,
    "options": {},
    "skips": {}
};
let cshops = {};
let csongs = {};
let clogic = {};

function convert_locations(area, name, type, data) {
    let area_name = translation[area];
    world.areas[area_name] = world.areas[area_name] || {
        "locations": [],
        "entrances": []
    };
    maps[area_name] = maps[area_name] || {
        "background": "",
        "locations": [],
        "entrances": []
    };
    let record = Object.assign({}, LOCATION_STRUCT);
    record.type = type.replace(/s$/, "");
    if (!!data.mode) {
        record.type = data.mode.slice(0, -6);
        record.visible = `option.${data.mode}`
    }
    if (!!data.era) {
        record.child = data.era=="child"||data.era=="both";
        record.adult = data.era=="adult"||data.era=="both";
    }
    if (!!data.time) {
        record.time = data.time;
    }
    let trans = translation[`${type}.${name}`];
    if (world.locations.hasOwnProperty(trans)) {
        console.error(`name duplication: ${trans}`);
    }
    world.locations[trans] = record;
    world.areas[area_name].locations.push(trans);

    if (!!data.x && !!data.y) {
        maps.main.locations.push({
            "type": type.replace(/s$/, ""),
            "id": trans,
            "x": Math.round(19.2 * parseFloat(data.x)),
            "y": Math.round(10.8 * parseFloat(data.y))
        });
    }
    maps[area_name].locations.push({
        "type": type.replace(/s$/, ""),
        "id": trans,
        "x": 0,
        "y": 0
    });
}

function convert_etrance(area, name, type, data) {
    let area_name = translation[area];
    world.areas[area_name] = world.areas[area_name] || {
        "locations": [],
        "entrances": []
    };
    maps[area_name] = maps[area_name] || {
        "background": "",
        "locations": [],
        "entrances": []
    };
    let record = Object.assign({}, ENTRANCE_STRUCT);
    record.type = data.type;
    if (!!data.era) {
        record.child = data.era=="child"||data.era=="both";
        record.adult = data.era=="adult"||data.era=="both";
    }
    if (!!data.time) {
        record.time = data.time;
    }
    let trans = `entrance.${area}.${name}`;
    if (world.entrances.hasOwnProperty(trans)) {
        console.error(`name duplication: ${trans}`);
    }
    world.entrances[trans] = record;
    world.areas[area_name].entrances.push(trans);

    maps[area_name].entrances.push({
        "type": type.replace(/s$/, ""),
        "id": trans,
        "x": 0,
        "y": 0
    });
}

for (let i in locations) {
    let trans = translation[i];
    let data = locations[i];
    if (!!data.x && !!data.y) {
        maps.main.locations.push({
            "type": "area",
            "id": trans,
            "x": Math.round(19.2 * parseFloat(data.x)),
            "y": Math.round(10.8 * parseFloat(data.y))
        });
    }
    if (locations[i].hasOwnProperty("chests_v")) {
        for (let k in locations[i].chests_v) {
            convert_locations(i, k, "chests", locations[i].chests_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("chests_mq")) {
        for (let k in locations[i].chests_mq) {
            convert_locations(`${i}_mq`, k, "chests", locations[i].chests_mq[k]);
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_v")) {
        for (let k in locations[i].skulltulas_v) {
            convert_locations(i, k, "skulltulas", locations[i].skulltulas_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_mq")) {
        for (let k in locations[i].skulltulas_mq) {
            convert_locations(`${i}_mq`, k, "skulltulas", locations[i].skulltulas_mq[k]);
        }
    }
    if (locations[i].hasOwnProperty("gossipstones_v")) {
        for (let k in locations[i].gossipstones_v) {
            convert_locations(i, k, "gossipstones", locations[i].gossipstones_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("entrances")) {
        for (let k in locations[i].entrances) {
            convert_etrance(i, k, "gossipstones", locations[i].entrances[k]);
        }
    }
}

for (let i in items) {
    let trans = translation[`items.${i}`];
    citems[trans] = items[i];
}

for (let i in settings.options) {
    let trans = translation[`options.${i}`];
    csettings.options[trans] = settings.options[i];
}
for (let i in settings.skips) {
    let trans = translation[`skips.${i}`];
    csettings.skips[trans] = settings.skips[i];
}

for (let i in shops) {
    let trans = translation[`shops.${i}`];
    cshops[trans] = shops[i];
}

for (let i in songs) {
    let trans = translation[`songs.${i}`];
    csongs[trans] = songs[i];
}

const CUSTOM_LOGIC_TYPES = [
    "chest",
    "item",
    "skip",
    "option",
    "skulltula"
];
function recursive_logic_translation(tree) {
    if (CUSTOM_LOGIC_TYPES.indexOf(tree.type) > 0) {
        if (!!tree.value) {
            return {
                type: "value",
                el: translation[`${tree.type}s.${tree.el}`],
                value: tree.value
            };
        } else {
            return {
                type: "number",
                el: translation[`${tree.type}s.${tree.el}`]
            };
        }
    } else if (tree.type == "filter") {
        return {
            type: "number",
            el: `filter.${tree.el.replace(/^filter_/, "")}`
        };
    } else if (tree.type == "mixin") {
        return {
            type: "number",
            el: `mixin.${tree.el}`
        };
    } else {
        if (tree.type == "not" || tree.type == "min" || tree.type == "max") {
            return {
                type: tree.type,
                el: recursive_logic_translation(tree.el)
            };
        } else if (tree.type == "false" || tree.type == "true") {
            return {
                type: tree.type
            };
        } else {
            return {
                type: tree.type,
                el: tree.el.map(recursive_logic_translation)
            };
        }
    }
}

for (let i in logic.chests) {
    clogic[translation[`chests.${i}`]] = recursive_logic_translation(logic.chests[i]);
}
for (let i in logic.skulltulas) {
    clogic[translation[`skulltulas.${i}`]] = recursive_logic_translation(logic.skulltulas[i]);
}
for (let i in logic.gossipstones) {
    clogic[translation[`gossipstones.${i}`]] = recursive_logic_translation(logic.gossipstones[i]);
}
for (let i in logic.mixins) {
    clogic[`mixin.${i}`] = recursive_logic_translation(logic.mixins[i]);
}

// TODO translate language keys
const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const COMMENT = /^(?:!|#).*$/;

function translate_language(input) {
    let lines = input.split(LNBR_SEQ);
    for(let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        if(!line.length || COMMENT.test(line)) {
            continue;
        }
        let data = line.split("=");
        if(!!data) {
            let key = data[0].trim();
            let value = data[1].trim();
            let trans = translation[key]
                    ||  translation[`chests.${key}`]
                    ||  translation[`skulltulas.${key}`]
                    ||  translation[`gossipstones.${key}`]
                    ||  translation[`skips.${key}`]
                    ||  translation[`options.${key}`]
                    ||  translation[`items.${key}`]
                    ||  key;
            lines[i] = `${trans}=${value}`;
        }
    }
    return lines.join("\n");
}

clang_en = translate_language(lang_en);
clang_en2 = translate_language(lang_en2);
clang_de = translate_language(lang_de);

fs.writeFileSync("./src/_rework/database/world.json", JSON.stringify(world, null, 4));
fs.writeFileSync("./src/_rework/database/maps.json", JSON.stringify(maps, null, 4));
fs.writeFileSync("./src/_rework/database/items.json", JSON.stringify(citems, null, 4));
fs.writeFileSync("./src/_rework/database/settings.json", JSON.stringify(csettings, null, 4));
fs.writeFileSync("./src/_rework/database/shops.json", JSON.stringify(cshops, null, 4));
fs.writeFileSync("./src/_rework/database/songs.json", JSON.stringify(csongs, null, 4));
fs.writeFileSync("./src/_rework/database/logic.json", JSON.stringify(clogic, null, 4));

fs.writeFileSync("./src/_rework/i18n/en_us.lang", clang_en);
fs.writeFileSync("./src/_rework/i18n/en_us.easy.lang", clang_en2);
fs.writeFileSync("./src/_rework/i18n/de_de.lang", clang_de);

fs.writeFileSync("./src/script/storage/converters/StateConverter1.js", `const translation = ${JSON.stringify(translation, null, 4)};

export default function(state) {
    let res = {
        data: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 2,
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        res.data[translation[i]] = state.data[i];
    }
    return res;
};`);
