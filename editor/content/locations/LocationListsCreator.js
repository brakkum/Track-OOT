
import FileData from "/emcJS/storage/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/Dialog.js";

let DataStorage = new IDBStorage("locations");

const LOGIC_OPERATORS = [
    "ted-logic-false",
    "ted-logic-true",
    "ted-logic-not",
    "ted-logic-and",
    "ted-logic-nand",
    "ted-logic-or",
    "ted-logic-nor",
    "ted-logic-xor",
    "ted-logic-xnor",
    "ted-logic-min",
    "ted-logic-max"
];
const CUSTOM_OPERATOR_GROUP = [
    "location"
];

class LocationListsCreator {

    async createLists() {

        let result = [];

        let world = FileData.get("world");
        let custom_data = await DataStorage.getAll();

        let names = new Set();
        for (let name in world) {
            names.add(name);
        }
        for (let name in custom_data) {
            names.add(name);
        }

        for (let name of names) {
            result.push({
                "ref": name,
                "content": name
            });
        }

        return result;
    }

    async createOperators() {

        let result = [];

        let randomizer_options = FileData.get("randomizer_options");

        result.push(createDefaultOperatorCategory());
        result.push(createSettingsOperatorCategory(randomizer_options.options, "option"));

        return result;
    }

}

export default new LocationListsCreator();

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    let res = {
        "type": "group",
        "caption": "default",
        "children": []
    };
    for (let i in LOGIC_OPERATORS) {
        res.children.push({
            "type": LOGIC_OPERATORS[i]
        });
    }
    return res;
}

function createSettingsOperatorCategory(data, ref) {
    let res = {
        "type": "group",
        "caption": ref,
        "children": []
    };
    for (let i in data) {
        let opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "choice") {
            for (let j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "value": j,
                    "category": ref
                });
            }
        } else {
            if (opt.type === "list") {
                for (let j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
                        "category": ref
                    });
                }
            } else {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "category": ref
                });
            }
        }
    }
    return res;
}