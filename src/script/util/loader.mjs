import GlobalData from "deepJS/storage/GlobalData.mjs";
import LocalStorage from "deepJS/storage/LocalStorage.mjs";
import FileLoader from "deepJS/util/FileLoader.mjs";

const FILES = [
    "items",
    "grids",
    "locations",
    "songs",
    "hints",
    "logic",
    "settings",
    "shops",
    "shop_items"
];

const LOGIC_PATCHES = [
    "skulltula_rewards"
];

export default async function loadData() {
    let loading = [];
    GlobalData.set("logic_patched", LocalStorage.get("settings", "logic", {}));
    FILES.forEach(file => {
        loading.push(FileLoader.json(`database/${file}.json`).then(function(data) {
            GlobalData.set(file, data);
        }));
    });

    await Promise.all(loading);

    loading = [];
    LOGIC_PATCHES.forEach(file => {
        loading.push(FileLoader.json(`database/logic_patch_${file}.json`).then(function(data) {
            let logic = GlobalData.get("logic", {});
            for (let i in data) {
                for (let j in data[i]) {
                    logic[i][j] = data[i][j];
                }
            }
        }));
    });

    await Promise.all(loading);
}