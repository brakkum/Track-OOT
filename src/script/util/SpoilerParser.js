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
    for (let i in setting) {
        let v = setting[i];
        if(setting_trans.hasOwnProperty(i)) {
            if (Array.isArray(v)) {
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
    return setting["world_count"]
}

function parseStartingItems(items) {
    let starting_trans = trans["starting_items"];
    let bottles = 0;

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

function parseLocations(locations, world) {
    // TODO add code to parse location items to tracker locations with Item Association
}

function parseWothLocation(woth, world) {
    // TODO utilize WOTH locations to build WOTH hint system
}

class SpoilerParser {

    parse(spoiler) {
        let data = spoiler;
        trans = FileData.get("options_trans")
        console.log(trans)

        let version = versionChecker(data[":version"]);
        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version >= 1) {
            let world = parseSetting(data["settings"]);
            if(world === 1) {
                parseStartingItems(data["starting_items"]);
                //parseLocations(data["location"], world);
                //parseWothLocation(data[":woth_locations"], world);
            } else {
                console.log("Multiworld location parsing currently not supported")
            }
            StateStorage.write(options);
        }
    }
}

export default new SpoilerParser();