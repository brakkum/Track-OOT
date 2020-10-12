import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";

let trans;
let options = {};
let extra = {};

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
    options[world] = {};
    for(let i in setting) {
        let v = setting[i];

        if(setting_trans.hasOwnProperty(i)) {
            if(Array.isArray(v)) {
                v = new Set(v);
                setting_trans[i].forEach(el => {
                    options[world.toString()][el.replace("logic_", "skip.")] = v.has(el);
                });
            } else {
                if(setting_trans[i]["values"][v] === undefined) {
                    console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                } else {
                    options[world][setting_trans[i]["name"]] = setting_trans[i]["values"][v];

                    if(setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") options[world.toString()]["option.ganon_boss_door_open"] = true;
                }
            }
        }
    }
}

function parseStartingItems(items, world) {
    let starting_trans = trans["starting_items"];
    let bottles = 0;
    let bottle;
    let bottleWL;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) items = items["World " + w];

        for(let i in items) {
            let v = items[i];

            if(starting_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array within starting items, please report this!")
                } else {
                    if (starting_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        options[w][starting_trans[i]["name"]] = starting_trans[i]["values"][v];

                        if (i !== "Bottle") {
                            EventBus.trigger("item", {
                                name: starting_trans[i]["name"],
                                value: starting_trans[i]["values"][v]
                            });
                        }

                        if (i === "Bottle With Letter" || i === "Bottle") {
                            if(i === "Bottle With Letter") bottleWL = true;
                            if(i === "Bottle") bottle = true;

                            bottles = bottles + starting_trans[i]["values"][v]
                            options[w][starting_trans["Bottle"]["name"]] = bottles;
                            if(i.hasOwnProperty("Bottle") && i.hasOwnProperty("Bottle With Letter") && bottle && bottleWL) {
                                EventBus.trigger("item", {
                                    name: starting_trans["Bottle"]["name"],
                                    value: bottles
                                });
                            }
                            if(!i.hasOwnProperty("Bottle") || !i.hasOwnProperty("Bottle With Letter")) {
                                EventBus.trigger("item", {
                                    name: starting_trans["Bottle"]["name"],
                                    value: bottles
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}

function parseDungeons(dungeons, world) {
    let dungeon_trans = trans["dungeons"];

    for(let w = 1; w <= world; w++) {
        if(world !== 1) dungeons = dungeons["World " + w];

        for(let i in dungeons) {
            let v = dungeons[i];
            if(dungeon_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array within dungeon types, please report this!")
                } else {
                    if (dungeon_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        options[w][dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
                        EventBus.trigger("dungeontype", {
                            name: dungeon_trans[i]["name"].replace("dungeonTypes.", ""),
                            value: dungeon_trans[i]["values"][v]
                        });
                    }
                }
            }
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

function parseEntrances(entrances, world, dungeon, indoors, overworld) {
    let entrance_trans  = trans["entrances"]["entrances"];
    let exit_trans = trans["entrances"]["exits"];
    let entro_dungeon  = entrance_trans["dungeons"];
    let entro_simple = entrance_trans["simple"];
    let entro_indoors = entrance_trans["indoors"];
    let entro_overworld = entrance_trans["overworld"];
    let exit_dungeon = exit_trans["dungeons"];
    let exit_simple = exit_trans["simple"];
    let exit_indoors = exit_trans["indoors"];
    let exit_overworld = exit_trans["overworld"];
    let exits = {};

    for(let w = 1; w <= world; w++) {
        if(world !== 1) entrances =  entrances["World " + w];

        for(let i in entrances) {
            let v = entrances[i];
            if(Array.isArray(i)) {
                console.warn("Unexpected Array within entrances, please report this!")
            } else {
                if(Array.isArray(v)) {
                    v = v["region"] + " -> " + v["from"];
                } else {
                    if(entro_dungeon[i] === undefined && exit_dungeon[v] === undefined && entro_simple[i] === undefined && exit_simple[v] === undefined && entro_indoors[i] === undefined && exit_indoors[v] === undefined && entro_overworld[i] === undefined && exit_overworld[v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        if (dungeon) {
                            if (entro_dungeon[i] === undefined) {
                            } else {
                                exits[entro_dungeon[i]] = exit_dungeon[v];
                            }
                        }
                        if (indoors) {
                            if (entro_simple[i] !== undefined && exit_simple[v] !== undefined) {
                                exits[entro_simple[i]] = exit_simple[v];
                            }
                            if (entro_indoors[i] !== undefined && exit_indoors[v] !== undefined) {
                                exits[entro_indoors[i]] = exit_indoors[v];
                            }
                            if(entro_simple[i] !== undefined && exit_indoors[v] !== undefined) {
                                exits[entro_simple[i]] = exit_indoors[v];
                            }
                            if(entro_indoors[i] !== undefined && exit_simple[v] !== undefined) {
                                exits[entro_indoors[i]] = exit_simple[v];
                            }

                        }
                        if (overworld) {
                            if (entro_overworld[i] === undefined || exit_overworld[v] === undefined) {
                            } else {
                                exits[entro_overworld[i]] = exit_overworld[v];
                            }
                        }
                    }
                }
            }
        }
        extra[w]["exits"] = exits;
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

function parseLocations(locations, world) {
    // TODO add code to parse location items to tracker locations with Item Association
}

function parseWothLocation(woth, world) {
    // TODO utilize WOTH locations to build WOTH hint system
}

class SpoilerParser {

    parse(spoiler) {
        let data = spoiler;
        let settings = StateStorage.getAllExtra("parseSpoiler");
        console.log(StateStorage.getAllExtra("parseSpoiler"))
        trans = FileData.get("options_trans");
        let multiWorld = settings["parse.multiworld"];
        let parseEntra = false;
        if(settings["parse.entro_dungeons"] || settings["parse.entro_indoors"] || settings["parse.entro_overworld"]) parseEntra = true;

        let version = versionChecker(data[":version"]);

        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = 0;
            if(!isNaN(data["settings"]["world_count"])) world = data["settings"]["world_count"];
            if(world === 1) multiWorld = world;
            arrayActivator(world);

            if(settings["parse.settings"]) parseSetting(data["settings"], multiWorld)
            if(settings["parse.starting_items"]) parseStartingItems(data["starting_items"], world);
            //if(settings["parse.item_association"]) parseLocations(data["locations"], world);
            //if(settings["parse.woth_hints"]) parseWothLocation(data[":woth_locations"], world);
            if(parseEntra) parseEntrances(data["entrances"], world, settings["parse.entro_dungeons"], settings["parse.entro_indoors"], false/*settings["parse.entro_overworld"]*/);
            if(settings["parse.shops"]) parseShops(data["locations"], world);
            //if(settings["parse.gossip_stones"]) parseStones(data["gossip_stones"], world);
            //if(settings["parse.barren"]) parseBarren(data[":barren_regions"], world);
            if(settings["parse.trials"]) parseTrials(data["trials"], world);
            //if(settings["parse.random_settings"]) parseRandom(data["randomized_settings"], world);
            if(settings["parse.dungeons"]) parseDungeons(data["dungeons"], world);

            StateStorage.write(options[multiWorld]);
            StateStorage.writeExtraAll(extra[multiWorld]);
            console.log(extra[multiWorld]["exits"])

            EventBus.trigger("randomizer_options", options[multiWorld]);
        }
    }
}

export default new SpoilerParser();