import StateStorage from "/script/storage/StateStorage.js";
import FileData from "/emcJS/storage/FileData.js";

function versionChecker(version) {
    let failure = 0;
    let standard = 1;
    let dev = 2;

    if(version.split(" ")[1] === "Release") return standard;
    if(version.split(" ")[1] === "f.LUM") return dev;
    return failure
}

function seedURLCheck(url) {
    let ootr = "https://ootrandomizer.com"
    let [u1, u2] = url.split("=");

    u1 = u1.split("/seed")

    if(u1[0] === ootr && !isNaN(u2)) return true;
    return false;
}

function parseSetting(setting) {
    let options = {};
    let trans = FileData.get("options_trans", {});
    console.log(trans);

    for (let i in setting) {
        let v = setting[i];
        if(trans.hasOwnProperty(i)) {
            if (Array.isArray(v)) {
                v = new Set(v);
                trans[i].forEach(el => {
                    options["skip." + el.split("logic_")[1]] = v.has(el);
                    console.log("skip." + el.split("logic_")[1] + "           +            " + v.has(el))
                });
            } else {
                options[trans[i]["name"]] = trans[i]["values"][v];
                console.log(trans[i]["name"] + "    +     " + trans[i]["values"][v])
            }
        }
    }
    StateStorage.write(options);
    return setting["world_count"]
}
function parseLocations(locations, world) {
    // TODO add code to parse location items to tracker locations with Item Association
}
function parseWothLocation(woth, world) {
    // TODO utilize WOTH locations to build WOTH hint system
}

class SpoilerParser {

    parse(spoiler) {
        let data = spoiler;//JSON.parse(spoiler);
        let version = versionChecker(data[":version"]);
        if(version === 0) return console.log("Fail State: Not a valid OOTR Spoiler log");
        if(version === 1) {
            if(seedURLCheck(data[":seed_url"])) {
                let world = parseSetting(data["settings"]);
                console.log("DONE")
                if(world === 1) {
                    //parseLocations(data["location"], world);
                    //parseWothLocation(data[":woth_locations"], world);
                } else {
                    console.log("Multiworld location parsing currently not supported")
                }
            } else {
                console.log("Spoiler did not come from ootrandomizer.com")
            }
        }
        if(version === 2) {
            let world = parseSetting(data["settings"]);
            if(world === 1) {
                //parseLocations(data["location"], world);
                //parseWothLocation(data[":woth_locations"], world);
            } else {
                console.log("Multiworld location parsing currently not supported")
            }
        }
    }
}

export default new SpoilerParser();