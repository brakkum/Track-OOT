const fs = require('fs');

const LOCATION_STRUCT = {
    "type": "chest",
    "time": "always",
    "child": true,
    "adult": true,
    "visible": true
}

let translation = JSON.parse(fs.readFileSync("./src/database/buffer/translation.json"));
let locations = JSON.parse(fs.readFileSync("./src/database/buffer/locations.json"));
let items = JSON.parse(fs.readFileSync("./src/database/items.json"));
let settings = JSON.parse(fs.readFileSync("./src/database/settings.json"));
let shops = JSON.parse(fs.readFileSync("./src/database/shops.json"));
let songs = JSON.parse(fs.readFileSync("./src/database/songs.json"));
let logic = JSON.parse(fs.readFileSync("./src/database/logic.json"));

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
    if (!!data.counts && data.counts > 1) {
        for (let l = 0; l < data.counts; ++l) {
            let trans = translation[`${type}.${name}`][l];
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
    } else {
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

// TODO translate logic
// logic additionals
// translation['filter_era_active'] = 'filter.era_active';

// TODO generate savestate translator (JS)
// TODO translate language keys

fs.writeFileSync("./src/database/rework/world.json", JSON.stringify(world, null, 4));
fs.writeFileSync("./src/database/rework/maps.json", JSON.stringify(maps, null, 4));
fs.writeFileSync("./src/database/rework/items.json", JSON.stringify(citems, null, 4));
fs.writeFileSync("./src/database/rework/settings.json", JSON.stringify(csettings, null, 4));
fs.writeFileSync("./src/database/rework/shops.json", JSON.stringify(cshops, null, 4));
fs.writeFileSync("./src/database/rework/songs.json", JSON.stringify(csongs, null, 4));
//fs.writeFileSync("./src/database/rework/logic.json", JSON.stringify(clogic, null, 4)));
