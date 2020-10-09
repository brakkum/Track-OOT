import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";
import EventBus from "/emcJS/util/events/EventBus.js";

let trans
let options = {};

function versionChecker(version) {
    let failure = 0;
    let standard = 1;
    let dev = 2;

    if(version.split(" ")[1] === "Release") return standard;
    if(version.split(" ")[1] === "f.LUM") return dev;
    return failure
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
                options[world][setting_trans[i]["name"]] = setting_trans[i]["values"][v];

                if(setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") options[world]["option.ganon_boss_door_open"] = true;
                if(setting_trans[i]["values"][v] === undefined) console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
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

function parseEntrances(entrances, world, dungeon, simple, indoors, overworld) {
    let [entrance_trans, exit_trans] = trans["entrances"];
    let [entro_dungeon, entro_simple, entro_indoors, entro_overworld] = entrance_trans;
    let [exit_dungeon, exit_simple, exit_indoors, exit_overworld] = exit_trans;

    for(let w = 1; w < world; w++) {
        if(world !== 1) entrances =  entrances["World " + w];

        for(let i in entrances) {
            let v = entrances[i];
            if(entrance_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array within entrances, please report this!")
                } else {
                    if(Array.isArray(v)) {
                        v = v["region"] + " -> " + v["from"];
                    } else {
                        if (entrance_trans[i]["values"][v] === undefined) {
                            console.warn("[" + i + ": " + v + "] is a invalid value. Please report this bug")
                        } else {

                        }
                    }
                }
            }
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

    parse(spoiler, settings) {
        let data = spoiler;
        trans = FileData.get("options_trans")
        let multiWorld = settings["parse.multiworld"];

        let version = versionChecker(data[":version"]);
        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = 0;
            if(!isNaN(data["settings"]["world_count"])) world = data["settings"]["world_count"];
            if(world === 1) multiWorld = world;

            if(settings["parse.settings"]) parseSetting(data["settings"], multiWorld)
            if(settings["parse.starting_items"]) parseStartingItems(data["starting_items"], world);
            //if(settings["parse.item_association"]) parseLocations(data["locations"], world);
            //if(settings["parse.woth_hints"]) parseWothLocation(data[":woth_locations"], world);
            if(settings["parse.entrances"]) parseEntrances(data["entrances"], world);
            //if(settings["parse.shops"]) parseShops(data["locations"], world);
            //if(settings["parse.gossip_stones"]) parseStones(data["gossip_stones"], world);
            //if(settings["parse.barren"]) parseBarren(data[":barren_regions"], world);
            if(settings["parse.trials"]) parseTrials(data["trials"], world);
            //if(settings["parse.random_settings"]) parseRandom(data["randomized_settings"], world);
            if(settings["parse.dungeons"]) parseDungeons(data["dungeons"], world);

            StateStorage.write(options[multiWorld]);
            EventBus.trigger("randomizer_options", options);
        }
    }
}

export default new SpoilerParser();