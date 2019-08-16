import FileLoader from "/deepJS/util/FileLoader.js";

const FILES = [
    "items",
    "grids",
    "locations",
    "layouts",
    "songs",
    "hints",
    "logic",
    "settings",
    "filter",
    "shops",
    "shop_items"
];

const STORAGE = {
    "version-dev": true,
    "version-string": "DEV",
    "version-date": "01.01.2019 00:00:00"
};

function setVersion(data) {
    STORAGE["version-dev"] = data.dev;
    if (data.dev) {
        STORAGE["version-string"] = `DEV [${data.commit.slice(0,7)}]`;
    } else {
        STORAGE["version-string"] = data.version;
    }
    let b = new Date(data.date);
    let m = b.getMonth()+1;
    let d = {
        D: ("00"+b.getDate()).slice(-2),
        M: ("00"+m).slice(-2),
        Y: b.getFullYear(),
        h: ("00"+b.getHours()).slice(-2),
        m: ("00"+b.getMinutes()).slice(-2),
        s: ("00"+b.getSeconds()).slice(-2)
    };
    STORAGE["version-date"] = `${d.D}.${d.M}.${d.Y} ${d.h}:${d.m}:${d.s}`;
    return data;
}

class GlobalData {

    async init() {
        let loading = [];
        FILES.forEach(file => {
            loading.push(FileLoader.json(`database/${file}.json`).then(function(data) {
                STORAGE[file] = data;
            }));
        });
        loading.push(FileLoader.json("version.json").then(setVersion));
        await Promise.all(loading);
    }

    get(name, def = null) {
        if (!!STORAGE[name]) {
            return STORAGE[name];
        }
        return def;
    }

}

export default new GlobalData;