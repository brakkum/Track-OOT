import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";

const FILES = [
    "items",
    "grids",
    "dungeonstate",
    "world",
    "locationlists",
    "maps",
    "layouts",
    "songs",
    "hints",
    "logic",
    "settings",
    "rom_settings",
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
    STORAGE["version-date"] = DateUtil.convert(new Date(data.date), "D.M.Y h:m:s");
    return data;
}

class GlobalData {

    async init() {
        let loading = [];
        FILES.forEach(file => {
            loading.push(FileLoader.json(`/database/${file}.json`).then(function(data) {
                STORAGE[file] = data;
            }).catch(function(err) {
                console.error(`error getting contents of file - ${path}`);
                throw err;
            }));
        });
        loading.push(FileLoader.json("version.json").then(setVersion));
        await Promise.all(loading);
    }

    get(name, def = null) {
        let path = name.split("/");
        let data = STORAGE;
        while (!!path.length) {
            let ref = path.shift();
            if (data.hasOwnProperty(ref)) {
                data = data[ref];
            } else {
                return def;
            }
        }
        if (typeof data == "undefined") {
            return def;
        }
        return data;
    }

}

export default new GlobalData;