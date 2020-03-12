import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Dialog from "/emcJS/ui/Dialog.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import MapLocation from "./Location.js";

const TPL = new Template(`
    <div id="location" class="textarea"></div>
    <div id="item" class="textarea"></div>
`);

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

function hintstoneDialog(ref) {
    return new Promise(resolve => {
        let location = StateStorage.read(`${ref}.location`, "");
        let item = StateStorage.read(`${ref}.item`, "");
        let data = GlobalData.get('hints', {locations: [], items: []});
    
        let lbl_loc = document.createElement('label');
        lbl_loc.style.display = "flex";
        lbl_loc.style.justifyContent = "space-between";
        lbl_loc.style.alignItems = "center";
        lbl_loc.style.padding = "5px";
        lbl_loc.innerHTML = Language.translate("location");
        let slt_loc = document.createElement("select");
        slt_loc.append(createOption("", "["+Language.translate("empty")+"]"));
        for (let j = 0; j < data.locations.length; ++j) {
            let loc = data.locations[j];
            slt_loc.append(createOption(loc, Language.translate(loc)));
        }
        slt_loc.style.width = "200px";
        slt_loc.value = location;
        lbl_loc.append(slt_loc);
    
        let lbl_itm = document.createElement('label');
        lbl_itm.style.display = "flex";
        lbl_itm.style.justifyContent = "space-between";
        lbl_itm.style.alignItems = "center";
        lbl_itm.style.padding = "5px";
        lbl_itm.innerHTML = Language.translate("item");
        let slt_itm = document.createElement("select");
        slt_itm.append(createOption("", "["+Language.translate("empty")+"]"));
        for (let j = 0; j < data.items.length; ++j) {
            let itm = data.items[j];
            slt_itm.append(createOption(itm, Language.translate(itm)));
        }
        slt_itm.style.width = "200px";
        slt_itm.value = item;
        lbl_itm.append(slt_itm);
        
        let d = new Dialog({title: Language.translate(ref), submit: true, cancel: true});
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
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}