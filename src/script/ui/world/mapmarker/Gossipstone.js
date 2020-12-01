import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import MapLocation from "./Location.js";

const TPL = new Template(`
    <div id="location" class="textarea"></div>
    <div id="item" class="textarea"></div>
`);

// TODO save gossipstone data to extra storage
export default class MapGossipstone extends MapLocation {

    constructor() {
        super("gossipstone");
        this.shadowRoot.getElementById('tooltip').append(TPL.generate());
    }

    set checked(val) {
        super.checked = val;
        if (!!val) {
            let location = StateStorage.read(`${this.ref}.location`, "");
            let item = StateStorage.read(`${this.ref}.item`, "");
            this.shadowRoot.getElementById("location").innerHTML = location;
            this.shadowRoot.getElementById("item").innerHTML = item;
        } else {
            this.shadowRoot.getElementById("location").innerHTML = "";
            this.shadowRoot.getElementById("item").innerHTML = "";
        }
    }

    check() {
        hintstoneDialog(this.ref).then(r => {
            if (!!r) {
                let data = {};
                data[this.ref] = true;
                data[`${this.ref}.location`] = r.location;
                data[`${this.ref}.item`] = r.item;
                StateStorage.write(data);
                super.check();
            }
        });
    }

}

MapLocation.registerType('gossipstone', MapGossipstone);
customElements.define('ootrt-map-gossipstone', MapGossipstone);

function getLocationDescriptors() {
    const marker = FileData.get('world/marker');
    return [
        Object.keys(marker.area),
        Object.keys(marker.subarea),
        Object.keys(filterLocations(marker.location))
    ];
}

function filterLocations(obj) {
    const result = {};
    for (const key in obj) {
        if (!!obj[key] && obj[key] != "gossipstone") {
            result[key] = obj[key];
        }
    }
    return result;
}

function hintstoneDialog(ref) {
    return new Promise(resolve => {
        const location = StateStorage.read(`${ref}.location`, "");
        const item = StateStorage.read(`${ref}.item`, "");

        const [areas, subareas, locations] = getLocationDescriptors();
        const items = Object.keys(FileData.get('items'));
        items.push("WOTH");
        items.push("FOOL");
    
        const lbl_loc = document.createElement('label');
        lbl_loc.style.display = "flex";
        lbl_loc.style.justifyContent = "space-between";
        lbl_loc.style.alignItems = "center";
        lbl_loc.style.padding = "5px";
        lbl_loc.innerHTML = Language.translate("location");
        const slt_loc = document.createElement("emc-searchselect");
        slt_loc.append(createOption("", "["+Language.translate("empty")+"]"));
        for (let j = 0; j < areas.length; ++j) {
            const loc = areas[j];
            slt_loc.append(createOption(loc, `${Language.translate(`area/${loc}`)} [area]`));
        }
        for (let j = 0; j < subareas.length; ++j) {
            const loc = subareas[j];
            slt_loc.append(createOption(loc, `${Language.translate(`subarea/${loc}`)} [subarea]`));
        }
        for (let j = 0; j < locations.length; ++j) {
            const loc = locations[j];
            slt_loc.append(createOption(loc, `${Language.translate(`location/${loc}`)} [location]`));
        }
        slt_loc.style.width = "300px";
        slt_loc.value = location;
        lbl_loc.append(slt_loc);
    
        const lbl_itm = document.createElement('label');
        lbl_itm.style.display = "flex";
        lbl_itm.style.justifyContent = "space-between";
        lbl_itm.style.alignItems = "center";
        lbl_itm.style.padding = "5px";
        lbl_itm.innerHTML = Language.translate("item");
        const slt_itm = document.createElement("emc-searchselect");
        slt_itm.append(createOption("", "["+Language.translate("empty")+"]"));
        for (let j = 0; j < items.length; ++j) {
            const itm = items[j];
            slt_itm.append(createOption(itm, Language.translate(itm)));
        }
        slt_itm.style.width = "300px";
        slt_itm.value = item;
        lbl_itm.append(slt_itm);
        
        const d = new Dialog({title: Language.translate(ref), submit: true, cancel: true});
        d.onsubmit = function(result) {
            if (!!result) {
                resolve({item: slt_itm.value, location: slt_loc.value});
            } else {
                resolve(false);
            }
        };
        d.append(lbl_loc);
        d.append(lbl_itm);
        d.show();
    });
}

function createOption(value, content) {
    let opt = document.createElement('emc-option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}
