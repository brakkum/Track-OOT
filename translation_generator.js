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

let locations = JSON.parse(fs.readFileSync("./src/database/buffer/locations.json"));
let items = JSON.parse(fs.readFileSync("./src/database/items.json"));
let settings = JSON.parse(fs.readFileSync("./src/database/settings.json"));
let shops = JSON.parse(fs.readFileSync("./src/database/shops.json"));
let songs = JSON.parse(fs.readFileSync("./src/database/songs.json"));

function convert_locations(area, name, type, data) {
    if (!!data.counts && data.counts > 1) {
        let trans = [];
        for (let l = 0; l < data.counts; ++l) {
            trans.push(`location.${area}.${name}_${l}`);
        }
        translation[`${type}.${name}`] = trans;
    } else {
        translation[`${type}.${name}`] = `location.${area}.${name}`;
    }
}

for (let i in locations) {
    translation[i] = `area.${i}`;
    if (locations[i].hasOwnProperty("chests_v")) {
        for (let k in locations[i].chests_v) {
            convert_locations(i, k, "chests", locations[i].chests_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("chests_mq")) {
        translation[`${i}_mq`] = `area.${i}_mq`;
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
        translation[`${i}_mq`] = `area.${i}_mq`;
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
    translation[`items.${i}`] = `item.${i}`;
}

for (let i in settings.options) {
    translation[`options.${i}`] = `option.${i}`;
}
for (let i in settings.skips) {
    translation[`skips.${i}`] = `skip.${i}`;
}

for (let i in shops) {
    translation[`shops.${i}`] = `shop.${i.replace(/^shop_/, "")}`;
}

for (let i in songs) {
    translation[`songs.${i}`] = `song.${i.replace(/^song_/, "")}`;
}

fs.writeFileSync("./src/database/buffer/translation.json", JSON.stringify(translation, null, 4));
