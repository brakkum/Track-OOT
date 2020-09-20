import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";
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

function parseSetting(setting) {
    let setting_trans = trans["setting"];
    for(let i in setting) {
        let v = setting[i];

        if(setting_trans.hasOwnProperty(i)) {
            if(Array.isArray(v)) {
                v = new Set(v);
                setting_trans[i].forEach(el => {
                    options[el.replace("logic_", "skip.")] = v.has(el);
                });
            } else {
                options[setting_trans[i]["name"]] = setting_trans[i]["values"][v];

                if(setting_trans[i] === "shuffle_ganon_bosskey" && v === "remove") options["option.ganon_boss_door_open"] = true;
                if(setting_trans[i]["values"][v] === undefined) console.warn(i + ": " + v + "    is a invalid value. Please report this bug")
            }
        }
    }
}

function parseStartingItems(items, world) {
    let starting_trans = trans["starting_items"];
    let bottles = 0;

    for(let w = 1; w <= world; w++) {
        if(world !== 1) items = items["World " + w];

        for(let i in items) {
            let v = items[i];

            if(starting_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array withing starting items, please report this!")
                    break;
                }

                options[starting_trans[i]["name"]] = starting_trans[i]["values"][v];

                if(i === "Bottle With Letter" || i === "Bottle") {
                    bottles = bottles + starting_trans[i]["values"][v]
                    options[starting_trans["Bottle"]["name"]] = bottles;
                }
                if(starting_trans[i]["values"][v] === undefined) console.warn(i + ": " + v + "    is a invalid value. Please report this bug")
            }
        }
    }
}

function parseDungeons(dungeons, world) {
    let dungeon_trans = trans["dungeons"];

    for(let w = 1; w <= world; w++) {
        if (world !== 1) dungeons = dungeons["World " + w];

        for(let i in dungeons) {
            let v = dungeons[i];
            if(dungeon_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array withing starting items, please report this!")
                    break;
                }

                options[dungeon_trans[i]["name"]] = dungeon_trans[i]["values"][v];
                if(dungeon_trans[i]["values"][v] === undefined) console.warn(i + ": " + v + "    is a invalid value. Please report this bug")
            }
        }
    }
}

function parseTrials(trials, world) {
    let trial_trans = trans["trials"];

    for(let w = 1; w <= world; w++) {
        if (world !== 1) trials = trials["World " + w];

        for(let i in trials) {
            let v = trials[i];
            if(trial_trans.hasOwnProperty(i)) {
                if(Array.isArray(i)) {
                    console.warn("Unexpected Array withing starting items, please report this!")
                    break;
                }

                options[trial_trans[i]["name"]] = trial_trans[i]["values"][v];
                if(trial_trans[i]["values"][v] === undefined) console.warn(i + ": " + v + "    is a invalid value. Please report this bug")
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

        let version = versionChecker(data[":version"]);
        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = 0;
            if(!isNaN(data["settings"]["world_count"])) world = data["settings"]["world_count"];

            if(settings["parse.settings"]) parseSetting(data["settings"])
            if(world === 1) {
                if(settings["parse.starting_items"]) parseStartingItems(data["starting_items"], world);
                //if(settings["parse.item_association"]) parseLocations(data["locations"], world);
                //if(settings["parse.woth_hints"]) parseWothLocation(data[":woth_locations"], world);
                //if(settings["parse.entrances"]) parseEntrances(data["entrances"], world);
                //if(settings["parse.shops"]) parseShops(data["locations"], world);
                //if(settings["parse.gossip_stones"]) parseStones(data["gossip_stones"], world);
                //if(settings["parse.barren"]) parseBarren(data[":barren_regions"], world);
                if(settings["parse.trials"]) parseTrials(data["trails"], world);
                //if(settings["parse.random_settings"]) parseRandom(data["randomized_settings"], world);
                if(settings["parse.dungeons"]) parseDungeons(data["dungeons"], world);
            } else {
                console.log("Multiworld location parsing currently not supported")
            }
            StateStorage.write(options);
        }
    }
}

export default new SpoilerParser();