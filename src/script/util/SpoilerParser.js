import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";

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

function parseSetting(setting, world, trans) {
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
                if(i === "lacs_tokens" || i === "bridge_tokens") {
                    if(Number.isInteger(v) && v <= 100 && v > 0) {
                        options[world][setting_trans[i]["name"]] = v;
                    }
                } else {
                    if(setting_trans[i]["values"][v] === undefined) {
                        console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                    } else {
                        if(setting_trans[i]["name"] === "") {

                        } else {
                            options[world][setting_trans[i]["name"]] = setting_trans[i]["values"][v];
                            if(setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") options[world]["option.ganon_boss_door_open"] = true;
                        }
                    }
                }
            }
        }
    }
}

function parseStartingItems(itemsTrue, world, trans) {
    let starting_trans = trans["starting_items"];
    let items = itemsTrue;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) items = itemsTrue["World " + w];
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
                        if(!i.includes("Bottle") && !i.includes("Rito")) {
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

function parseDungeons(dungeonsTrue, locationsTrue, world, dt, dr, trans) {
    let dungeon_trans = trans["dungeons"];
    let location_trans = trans["dungeonReward"]
    let item_trans = trans["itemList"]
    let dungeons = dungeonsTrue;
    let locations = locationsTrue;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) {
            dungeons = dungeonsTrue["World " + w];
            locations = locationsTrue["World " + w];
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
                    if(typeof v === 'object' && v !== null) v = v["item"];

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

function parseTrials(trialsTrue, world, trans) {
    let trial_trans = trans["trials"];
    let trials = trialsTrue;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) trials = trialsTrue["World " + w];

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

function parseEntrances(entrancesTrue, world, dungeon, grottos, indoors, overworld, trans) {
    const {entro_dungeons, entro_grottos, entro_simple, entro_indoors, entro_overworld} = trans.entrances.entrances;
    const {exit_dungeons, exit_grottos, exit_simple, exit_indoors, exit_overworld} = trans.entrances.exits;
    const entrance = {entro_dungeon: entro_dungeons, entro_grottos: entro_grottos, entro_simple: entro_simple, entro_indoors: entro_indoors, entro_overworld: entro_overworld}
    const exit = {exit_dungeon: exit_dungeons, exit_grottos: exit_grottos, exit_simple: exit_simple, exit_indoors: exit_indoors, exit_overworld: exit_overworld}

    let entrances = entrancesTrue;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) entrances = entrancesTrue["World " + w];
        let exits = {};

        for(const i in entrances) {
            var v = entrances[i];
            if(typeof v === 'object' && v !== null)
                v = entrances[i]["region"];
            var edgeThere = null;
            var edgeBack = null;
            var node = null;

            for(const ent in entrance) {
                node = entrance[ent]
                if(node[i] !== undefined)
                    edgeThere = node[i];
            }
            for(const ent in exit) {
                node = exit[ent]
                if(node[v] !== undefined)
                    edgeBack = node[v]
            }

            if(typeof i === 'object' && i !== null) {
                console.warn("Unexpected Array within entrances")
            } else {
                if(edgeThere === null || edgeBack === null)
                    console.warn("[" + i + ": " + v + "] is a invalid value.")
                else {
                    if (dungeon) {
                        if (entro_dungeons[i] === edgeThere)
                            exits[edgeThere] = edgeBack;
                    }
                    if(grottos) {
                        if(entro_grottos[i] === edgeThere)
                            exits[edgeThere] = edgeBack;
                    }
                    if (indoors) {
                        if (entro_simple[i] === edgeThere || entro_indoors[i] === edgeThere)
                            exits[edgeThere] = edgeBack;
                    }
                    /*if (overworld) {
                        if(typeof v === 'object' && v !== null) {
                            v = v["region"] + " -> " + v["from"];
                        }
                        if (entro_overworld[i] === undefined || exit_overworld[v] === undefined) {
                        } else {
                            exits[exit_overworld[v]] = entro_overworld[i];
                        }
                    }*/
                }
            }
        }
        extra[w]["exits"] = exits;
    }
}

function parseShops(shopsTrue, world, trans, shopsanity) {
    const shop_trans = new Set(trans["shops"]);
    const item_trans = trans["itemList"];
    let shops = shopsTrue

    for(let w = 1; w <= world; w++) {
        if(world !== 1) shops = shopsTrue["World " + w];
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
                let price = 0;
                let player = 0;
                let placement = 0;
                if(Number.isInteger(v["price"]) && v["price"] <= 999) price = v["price"]
                if(Number.isInteger(v["player"]) && v["player"] <= 100) player = v["player"]
                if(item !== undefined) {
                    if(i.endsWith("1")) {
                        placement = 6;
                    }
                    if(i.endsWith("2")) {
                        placement = 2;

                    }
                    if(i.endsWith("3")) {
                        placement = 7;
                    }
                    if(i.endsWith("4")) {
                        placement = 3;
                    }
                    if(i.endsWith("5")) {
                        placement = 5;
                    }
                    if(i.endsWith("6")) {
                        placement = 1;
                    }
                    if(i.endsWith("7")) {
                        placement = 4
                    }
                    if(i.endsWith("8")) {
                        placement = 0;
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
        if(shopsanity !== "off") {
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
}

function parseBarren(barrenTrue, world, trans) {
    let barren_trans = trans["barren"];
    let castle = 0;
    let barren = barrenTrue

    for(let w = 1; w <= world; w++) {
        if(world !== 1) barren = barrenTrue["World " + w];
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

function parseLocations(locationsTrue, world, trans) {
    const location_trans = trans["locations"];
    const location_hearts_mq = location_trans["MQ"];
    const item_trans = trans["itemList"];
    let locations = locationsTrue;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) locations = locationsTrue["World " + w];
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
                        if(location_hearts_mq.hasOwnProperty(i)) {
                            if(player === w) loca["location/" + location_hearts_mq[i]] = item_trans[v];
                        }
                    }
                }
            } else {
                console.warn("[" + i + "] is a invalid value. Please report this bug")
            }
        }
        extra[w]["item_location"] = loca;
    }
}

function parseWothLocation(wothTrue, world, trans) {
    let woth_trans = trans["woth"];
    let woth = wothTrue

    for(let w = 1; w <= world; w++) {
        if(world !== 1) woth = wothTrue["World " + w];

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
        const data = spoiler;
        const trans = FileData.get("options_trans");
        let multiWorld = settings["parse.multiworld"];

        const version = versionChecker(data[":version"]);

        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = 0;
            if(!Number.isNaN(data["settings"]["world_count"])) world = data["settings"]["world_count"];
            if(world === 1) multiWorld = world;
            arrayActivator(world);

            if(settings["parse.settings"]) parseSetting(data["settings"], multiWorld, trans)
            if(settings["parse.starting_items"]) parseStartingItems(data["starting_items"], world, trans);
            if(settings["parse.item_association"]) parseLocations(data["locations"], world, trans);
            if(settings["parse.woth_hints"]) parseWothLocation(data[":woth_locations"], world, trans);
            parseEntrances(data["entrances"], world, settings["parse.entro_dungeons"], settings["parse.entro_grottos"], settings["parse.entro_indoors"], false/*settings["parse.entro_overworld"]*/, trans);
            if(settings["parse.shops"]) parseShops(data["locations"], world, trans, data.settings["shopsanity"]);
            //if(settings["parse.gossip_stones"]) parseStones(data["gossip_stones"], world);
            if(settings["parse.barren"]) parseBarren(data[":barren_regions"], world, trans);
            if(settings["parse.trials"]) parseTrials(data["trials"], world, trans);
            if(settings["parse.random_settings"]) parseSetting(data["randomized_settings"], multiWorld, trans);
            parseDungeons(data["dungeons"], data["locations"], world, settings["parse.dungeons"], settings["parse.dungeonReward"], trans);

            StateStorage.write(options[multiWorld]);
            StateStorage.writeAllExtra(extra[multiWorld]);

            EventBus.trigger("randomizer_options", options[multiWorld]);
        }
    }
}

export default new SpoilerParser();