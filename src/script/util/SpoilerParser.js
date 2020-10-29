import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";

let trans;
let options = {};
let extra = {};
let areahint = {};

function versionChecker(version) {
    let failure = 0;
    let standard = 1;
    let dev = 2;

    if(version.split(" ")[1] === "Release") return standard;
    if(version.split(" ")[1] === "f.LUM") return dev;
    return failure
}

function arrayActivator(world) {
    for(let w = 1; w <= world; w++) {
        options[w] = {};
        extra[w] = {};
    }
}

function parseSetting(setting, world) {
    let setting_trans = trans["setting"];
    for(let i in setting) {
        let v = setting[i];

        if(setting_trans.hasOwnProperty(i)) {
            if(Array.isArray(v)) {
                v = new Set(v);
                setting_trans[i].forEach(el => {
                    options[world][el.replace("logic_", "skip.")] = v.has(el);
                });
            } else {
                if(setting_trans[i]["values"][v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    options[world][setting_trans[i]["name"]] = setting_trans[i]["values"][v];

                    if(setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") options[world]["option.ganon_boss_door_open"] = true;
                }
            }
        }
    }
}

function parseStartingItems(items, world) {
    let starting_trans = trans["starting_items"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) items = items["World " + w];
        let bottles = 0;

        for(let i in items) {
            let v = items[i];

            if(starting_trans.hasOwnProperty(i)) {
                if(typeof v === 'object' && v !== null) {
                    console.warn("Unexpected Array within starting items, please report this!")
                } else {
                    if (starting_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        if(!i.includes("Bottle")) {
                            options[w][starting_trans[i]["name"]] = starting_trans[i]["values"][v];
                        } else {
                            bottles = bottles + starting_trans[i]["values"][v]
                            options[w][starting_trans["Bottle"]["name"]] = bottles;
                        }
                    }
                }
            }
        }
    }
}

function parseDungeons(dungeons, locations, world, dt, dr) {
    let dungeon_trans = trans["dungeons"];
    let location_trans = trans["dungeonReward"]
    let item_trans = trans["itemList"]

    for(let w = 1; w <= world; w++) {
        if(world !== 1) {
            dungeons = dungeons["World " + w];
            locations = locations["World " + w];
        }

        if(dt) {
            let data = {};
            for (let i in dungeons) {
                let v = dungeons[i];
                if (dungeon_trans.hasOwnProperty(i)) {
                    if (Array.isArray(i)) {
                        console.warn("Unexpected Array within dungeon types, please report this!")
                    } else {
                        if (dungeon_trans[i]["values"][v] === undefined) {
                            console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                        } else {
                            data["area/" + dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
                        }
                    }
                }
            }
            extra[w]["dungeontype"] = data;
        }
        if(dr) {
            let data = {};
            for (let i in locations) {
                let v = locations[i];
                if(location_trans.hasOwnProperty(i)) {
                    if(Array.isArray(i)) v = v["item"];

                    if(item_trans[v] === undefined){
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        data["area/" + location_trans[i]] = item_trans[v];
                        if(location_trans[i] === "pocket") data[location_trans[i]] = item_trans[v];
                    }
                }
            }
            extra[w]["dungeonreward"] = data;
        }
    }
}

function parseTrials(trials, world) {
    let trial_trans = trans["trials"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) trials = trials["World " + w];

        for(let i in trials) {
            let v = trials[i];
            if(trial_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array within active trials, please report this!")
                } else {
                    if(trial_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        options[w][trial_trans[i]["name"]] = trial_trans[i]["values"][v];
                    }
                }
            }
        }
    }
}

function parseEntrances(entrances, world, dungeon, grottos, indoors, overworld) {
    let entrance_trans  = trans["entrances"]["entrances"];
    let exit_trans = trans["entrances"]["exits"];
    let entro_dungeon = entrance_trans["dungeons"];
    let entro_grottos = entrance_trans["grottos"];
    let entro_simple = entrance_trans["simple"];
    let entro_indoors = entrance_trans["indoors"];
    let entro_overworld = entrance_trans["overworld"];
    let exit_dungeon = exit_trans["dungeons"];
    let exit_grottos = exit_trans["grottos"];
    let exit_simple = exit_trans["simple"];
    let exit_indoors = exit_trans["indoors"];
    let exit_overworld = exit_trans["overworld"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) entrances =  entrances["World " + w];
        let exits = {};
        let subs = {};

        for(let i in entrances) {
            let v = entrances[i];
            if(typeof i === 'object' && i !== null) {
                console.warn("Unexpected Array within entrances, please report this!")
            } else {
                if(entro_dungeon[i] === undefined && exit_dungeon[v] === undefined && entro_simple[i] === undefined && exit_simple[v] === undefined && entro_indoors[i] === undefined && exit_indoors[v] === undefined && entro_overworld[i] === undefined && exit_overworld[v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    if (dungeon) {
                        if(typeof v === 'object' && v !== null) {
                            v = v["region"];
                        }
                        if (entro_dungeon[i] === undefined) {
                        } else {
                            exits[entro_dungeon[i]] = exit_dungeon[v];
                        }
                    }
                    if(grottos) {
                        if(entro_grottos[i] !== undefined) {
                            exits[entro_grottos[i]] = exit_grottos[v];
                            subs[entro_grottos[i]] = exit_grottos[v];
                        }
                    }
                    if (indoors) {
                        if (entro_simple[i] !== undefined && exit_simple[v] !== undefined) {
                            exits[entro_simple[i]] = exit_simple[v];
                            subs[entro_simple[i]] = exit_simple[v];
                        }
                        if (entro_indoors[i] !== undefined && exit_indoors[v] !== undefined) {
                            exits[entro_indoors[i]] = exit_indoors[v];
                            subs[entro_indoors[i]] = exit_indoors[v];
                        }
                        if(entro_simple[i] !== undefined && exit_indoors[v] !== undefined) {
                            exits[entro_simple[i]] = exit_indoors[v];
                            subs[entro_simple[i]] = exit_indoors[v];
                        }
                        if(entro_indoors[i] !== undefined && exit_simple[v] !== undefined) {
                            exits[entro_indoors[i]] = exit_simple[v];
                            subs[entro_indoors[i]] = exit_simple[v];
                        }

                    }
                    if (overworld) {
                        if(typeof v === 'object' && v !== null) {
                            v = v["region"] + " -> " + v["from"];
                        }
                        if (entro_overworld[i] === undefined || exit_overworld[v] === undefined) {
                        } else {
                            exits[entro_overworld[i]] = exit_overworld[v];
                        }
                    }
                }
            }
        }
        extra[w]["exits"] = exits;
        extra[w]["subexits"] = subs;
    }
}

function parseShops(shops, world) {
    let shop_trans = new Set(trans["shops"]);
    let item_trans = trans["itemList"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) shops = shops["World " + w];
        let kokiri = [];
        let marketB = [];
        let marketP = [];
        let marketE = [];
        let kakB = [];
        let kakP = [];
        let goron = [];
        let zora = [];
        let kokiriNames = [];
        let marketBNames = [];
        let marketPNames = [];
        let marketENames = [];
        let kakBNames = [];
        let kakPNames = [];
        let goronNames = [];
        let zoraNames = [];
        for(let i = 0; i <= 7; i++) {
            kokiri[i] = {};
            kokiriNames[i] = "";
            marketB[i] = {};
            marketBNames[i] = "";
            marketP[i] = {};
            marketPNames[i] = "";
            marketE[i] = {};
            marketENames[i] = "";
            kakB[i] = {};
            kakBNames[i] = "";
            kakP[i] = {};
            kakPNames[i] = "";
            goron[i] = {};
            goronNames[i] = "";
            zora[i] = {};
            zoraNames[i] = "";
        }

        for(let i in shops) {
            let v = shops[i]
            if(shop_trans.has(i)) {
                let item = item_trans[v["item"]];
                if(item === undefined) item = "item.bad_item";
                let price = 0;
                let player;
                let placement = 0;
                if(Number.isInteger(v["price"]) && v["price"] <= 999) price = v["price"]
                if(item === undefined) price = 999;
                if(Number.isInteger(v["player"]) && v["player"] <= 100) player = v["player"]
                if(item !== undefined) {
                    if(i.endsWith("1")) {
                        placement = 2;
                    }
                    if(i.endsWith("2")) {
                        placement = 3;

                    }
                    if(i.endsWith("3")) {
                        placement = 6;
                    }
                    if(i.endsWith("4")) {
                        placement = 7;
                    }
                    if(i.endsWith("5")) {
                        placement = 0;
                    }
                    if(i.endsWith("6")) {
                        placement = 1;
                    }
                    if(i.endsWith("7")) {
                        placement = 4
                    }
                    if(i.endsWith("8")) {
                        placement = 5;
                    }
                    if(i.startsWith("Market Bazaar")|| i.startsWith("Castle Town Bazaar")) {
                        marketB[placement] = {
                            item: item,
                            price: price
                        }
                        marketBNames[placement] = "";
                        if(player !== undefined) marketBNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("Market Potion")|| i.startsWith("Castle Town Potion")) {
                        marketP[placement] = {
                            item: item,
                            price: price
                        }
                        marketPNames[placement] = "";
                        if(player !== undefined) marketPNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("Market Bombchu")|| i.startsWith("Bombchu")) {
                        marketE[placement] = {
                            item: item,
                            price: price
                        }
                        marketENames[placement] = "";
                        if(player !== undefined) marketENames[placement] = "Player " + player;
                    }
                    if(i.startsWith("Kak Bazaar")|| i.startsWith("Kakariko Bazaar")) {
                        kakB[placement] = {
                            item: item,
                            price: price
                        }
                        kakBNames[placement] = "";
                        if(player !== undefined) kakBNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("Kak Potion")|| i.startsWith("Kakariko Potion")) {
                        kakP[placement] = {
                            item: item,
                            price: price
                        }
                        kakPNames[placement] = "";
                        if(player !== undefined) kakPNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("GC")|| i.startsWith("Goron")) {
                        goron[placement] = {
                            item: item,
                            price: price
                        }
                        goronNames[placement] = "";
                        if(player !== undefined) goronNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("ZD")|| i.startsWith("Zora")) {
                        zora[placement] = {
                            item: item,
                            price: price
                        }
                        zoraNames[placement] = "";
                        if(player !== undefined) zoraNames[placement] = "Player " + player;
                    }
                    if(i.startsWith("KF") || i.startsWith("Kokiri")) {
                        kokiri[placement] = {
                            item: item,
                            price: price
                        }
                        kokiriNames[placement] = "";
                        if (player !== undefined) kokiriNames[placement] = "Player " + player;
                    }
                }
            }
        }
        extra[w]["shops_items"] = {
            "shop.kokiri": kokiri,
            "shop.magic_adult": kakP,
            "shop.basar_adult": kakB,
            "shop.magic_child": marketP,
            "shop.basar_child": marketB,
            "shop.bombchu": marketE,
            "shop.zora": zora,
            "shop.goron": goron
        }
        extra[w]["shops_names"] = {
            "shop.kokiri": kokiriNames,
            "shop.magic_adult": kakPNames,
            "shop.basar_adult": kakBNames,
            "shop.magic_child": marketPNames,
            "shop.basar_child": marketBNames,
            "shop.bombchu": marketENames,
            "shop.zora": zoraNames,
            "shop.goron": goronNames
        }
    }
}

function parseBarren(barren, world) {
    let barren_trans = trans["barren"];
    let castle = 0;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) barren = barren["World " + w];
        let bar = new Set(barren);

        bar.forEach(i => {
            if(barren_trans.hasOwnProperty(i)) {
                if(barren_trans[i] === "castle") {
                    castle++;
                    if(castle === 2) areahint["area/" + barren_trans[i]] = "barren";
                } else {
                    areahint["area/" + barren_trans[i]] = "barren";
                }
            } else {
                console.warn("[" + i + "] is a invalid value. Please report this bug")
            }
        });
        extra[w]["area_hint"] = areahint;
    }
}

function parseLocations(locations, world) {
    let location_trans = trans["locations"];
    let item_trans = trans["itemList"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) locations = locations["World " + w];
        let loca = {};

        for(let i in locations) {
            if(location_trans.hasOwnProperty(i)) {
                let v = locations[i];
                let player = 1;
                if(typeof v === 'object' && v !== null) {
                    if(v["player"] !== undefined) player = v["player"];
                    v = v["item"];
                }
                if (location_trans[i] !== "") {
                    if (item_trans[v] === undefined) {
                        console.warn("[" + v + "] is a invalid value. Please report this bug")

                    } else {
                        if(player === w) loca["location/" + location_trans[i]] = item_trans[v];
                    }
                }
            } else {
                console.warn("[" + i + "] is a invalid value. Please report this bug")
            }
        }
        extra[w]["item_location"] = loca;
    }
}

function parseWothLocation(woth, world) {
    let woth_trans = trans["woth"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) woth = woth["World " + w];

        for(let i in woth) {
            if(woth_trans.hasOwnProperty(i)) {
                areahint["area/" + woth_trans[i]] = "woth";
            } else {
                console.warn("[" + i + "] is a invalid value. Please report this bug")
            }
        }
        extra[w]["area_hint"] = areahint;
    }
}

class SpoilerParser {

    parse(spoiler, settings) {
        let data = spoiler;
        trans = FileData.get("options_trans");
        let multiWorld = settings["parse.multiworld"];

        let version = versionChecker(data[":version"]);

        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = 0;
            if(!isNaN(data["settings"]["world_count"])) world = data["settings"]["world_count"];
            if(world === 1) multiWorld = world;
            arrayActivator(world);

            if(settings["parse.settings"]) parseSetting(data["settings"], multiWorld)
            if(settings["parse.starting_items"]) parseStartingItems(data["starting_items"], world);
            if(settings["parse.item_association"]) parseLocations(data["locations"], world);
            if(settings["parse.woth_hints"]) parseWothLocation(data[":woth_locations"], world);
            parseEntrances(data["entrances"], world, settings["parse.entro_dungeons"], settings["parse.entro_indoors"], false/*settings["parse.entro_overworld"]*/);
            if(settings["parse.shops"]) parseShops(data["locations"], world);
            //if(settings["parse.gossip_stones"]) parseStones(data["gossip_stones"], world);
            if(settings["parse.barren"]) parseBarren(data[":barren_regions"], world);
            if(settings["parse.trials"]) parseTrials(data["trials"], world);
            if(settings["parse.random_settings"]) parseSetting(data["randomized_settings"], multiWorld);
            parseDungeons(data["dungeons"], data["locations"], world, settings["parse.dungeons"], settings["parse.dungeonReward"]);

            StateStorage.write(options[multiWorld]);
            StateStorage.writeAllExtra(extra[multiWorld]);

            EventBus.trigger("randomizer_options", options[multiWorld]);
        }
    }
}

export default new SpoilerParser();