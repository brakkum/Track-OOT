const fs = require('fs');

const JSON_FILES = [
    "database/items.json",
    "database/grids.json",
    "database/layouts.json",
    "database/songs.json",
    "database/hints.json",
    "database/logic.json",
    "database/settings.json",
    "database/filter.json",
    "database/shops.json",
    "database/shop_items.json"
];
const PROPERTY_FILES = [
    "i18n/de_de.lang",
    "i18n/en_us.lang",
    "i18n/en_us.easy.lang"
];

let translation = {};


// TODO: filter position data (x/y) and other metadata
// TODO: check why skulltulas are not extracted properly

const LOCATION_STRUCT = {
    "type": "chest",
    "mode": "all",
    "era": "both",
    "time": "always"
}
let locations = JSON.parse(fs.readFileSync("./src/database/locations.json"));
let converted_locations = {};

function convert_locations(area, name, type, data) {
    let record = Object.assign({}, LOCATION_STRUCT);
    record.type = type.replace(/s$/, "");
    if (!!data.mode) {
        record.mode = data.mode;
        record.type = data.mode.slice(0, -6);
    }
    if (!!data.era) {
        record.era = data.era;
    }
    if (!!data.time) {
        record.time = data.time;
    }
    if (!!data.counts && data.counts > 1) {
        let trans = [];
        for (let l = 0; l < data.counts; ++l) {
            if (converted_locations.hasOwnProperty(`location.${area}.${name}_${l}`)) {
                console.error(`name duplication: location.${area}.${name}_${l}`);
            }
            converted_locations[`location.${area}.${name}_${l}`] = record;
            trans.push(`location.${area}.${name}_${l}`);
        }
        translation[`${type}.${name}`] = trans;
    } else {
        if (converted_locations.hasOwnProperty(`location.${area}.${name}`)) {
            console.error(`name duplication: location.${area}.${name}`);
        }
        converted_locations[`location.${area}.${name}`] = record;
        translation[`${type}.${name}`] = `location.${area}.${name}`;
    }
}

for (let i in locations) {
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

fs.writeFileSync("./src/database/rework/locations.json", JSON.stringify(converted_locations, null, 4));
fs.writeFileSync("./src/database/rework/translation.json", JSON.stringify(translation, null, 4));
