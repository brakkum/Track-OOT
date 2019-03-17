import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import {createOption} from "/deepJS/ui/UIHelper.mjs";
import "/deepJS/ui/Tooltip.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import Logic from "/script/util/Logic.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline;
            width: 16px;
            height: 16px;
            box-sizing: border-box;
            -moz-user-select: none;
            user-select: none;
            transform: translate(-8px, -8px);
        }
        :host(:hover) {
            z-index: 1000;
        }
        #marker {
            position: relative;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            background-color: var(--location-status-unavailable-color, #000000);
            border: solid 2px black;
            border-radius: 50%;
            cursor: pointer;
        }
        #marker.avail {
            background-color: var(--location-status-available-color, #000000);
        }
        #marker.checked {
            background-color: var(--location-status-opened-color, #000000);
        }
        #marker:hover {
            box-shadow: 0 0 2px 4px #67ffea;
        }
        #marker:hover + #tooltip {
            display: block;
        }
        #tooltiparea {
            display: flex;
        }
        #text {
            display: inline-flex;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
        }
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            flex-shrink: 0;
            margin-left: 5px;
            border: 1px solid var(--navigation-background-color, #ffffff);
            border-radius: 2px;
        }
        #badge deep-icon {
            width: 20px;
            height: 20px;
        }
        #extra {
            display: inline-block;
            width: 100%;
        }
    </style>
    <div id="marker"></div>
    <deep-tooltip position="top" id="tooltip">
        <div id="tooltiparea">
            <div id="text"></div>
            <div id="badge"></div>
        </div>
        <div id="extra"></div>
    </deep-tooltip>
`);

function gossipstoneUpdate(name, value) {
    let ref = GlobalData.get("locations")["overworld"][`gossipstones_v`][this.ref].ref || this.ref;
    if (ref === name && this.shadowRoot.getElementById("text").classList.contains("checked") !== value) {
        EventBus.mute("gossipstone-update");
        this.setValue(TrackerLocalState.read("gossipstones", ref, {item: "0x01", location: "0x01"}));
        EventBus.unmute("gossipstone-update");
    }
}

function logicUpdate(type, ref, value) {
    if ("gossipstones" == type && this.ref == ref) {
        let el = this.shadowRoot.querySelector("marker");
        if (!!value) {
            el.classList.add("avail");
        } else {
            el.classList.remove("avail");
        }
    }
}

function globalUpdate() {
    EventBus.mute("gossipstone-update");
    let ref = GlobalData.get("locations")["overworld"][`gossipstones_v`][this.ref].ref || this.ref;
    this.setValue(TrackerLocalState.read("gossipstones", ref, {item: "0x01", location: "0x01"}));
    EventBus.unmute("gossipstone-update");
}

class HTMLTrackerPOIGossipstone extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        this.addEventListener("click", this.check);
        EventBus.on("gossipstone-update", gossipstoneUpdate.bind(this));
        EventBus.on("logic", logicUpdate.bind(this));
        EventBus.onafter("global-update", globalUpdate.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }

    get checked() {
        return this.getAttribute('checked');
    }

    set checked(val) {
        this.setAttribute('checked', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let data = GlobalData.get("locations")["overworld"][`gossipstones_v`][this.ref];
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(this.ref);
                    
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    let left = parseFloat(this.style.left.slice(0, -1));
                    let top = parseFloat(this.style.top.slice(0, -1));
                    if (left < 30) {
                        if (top < 30) {
                            tooltip.position = "bottomright";
                        } else if (top > 70) {
                            tooltip.position = "topright";
                        } else {
                            tooltip.position = "right";
                        }
                    } else if (left > 70) {
                        if (top < 30) {
                            tooltip.position = "bottomleft";
                        } else if (top > 70) {
                            tooltip.position = "topleft";
                        } else {
                            tooltip.position = "left";
                        }
                    } else {
                        if (top < 30) {
                            tooltip.position = "bottom";
                        } 
                    }

                    this.shadowRoot.getElementById("badge").innerHTML = "";

                    let el_time = document.createElement("deep-icon");
                    el_time.src = `images/time_${data.time || "both"}.svg`;
                    this.shadowRoot.getElementById("badge").appendChild(el_time);

                    let el_era = document.createElement("deep-icon");
                    el_era.src = `images/era_${data.era ||"both"}.svg`;
                    this.shadowRoot.getElementById("badge").appendChild(el_era);
                    
                    let el = this.shadowRoot.getElementById("marker");
                    if (Logic.vetValue("gossipstones", this.ref)) {
                        el.classList.add("avail");
                    } else {
                        el.classList.remove("avail");
                    }

                    this.checked = TrackerLocalState.read("gossipstones", data.ref || this.ref, false);
                    this.setValue(TrackerLocalState.read("gossipstones", data.ref || this.ref, {item: "0x01", location: "0x01"}));
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    let data = GlobalData.get("locations")["overworld"][`gossipstones_v`][this.ref];
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("marker");
                        if (Logic.vetValue("gossipstones", this.ref)) {
                            el.classList.add("avail");
                        } else {
                            el.classList.remove("avail");
                        }
                    }
                    TrackerLocalState.write("gossipstones", data.ref || this.ref, newValue === "false" ? false : !!newValue);
                    EventBus.post("gossipstone-update", data.ref || this.ref, newValue);
                }
            break;
        }
    }

    check(event) {
        hintstoneDialog(this.ref).then(r => {
            this.setValue(r);
            this.checked = this.shadowRoot.getElementById("text").classList.contains("checked");
        });
        if (!event) return;
        event.preventDefault();
        return false;
    }
    
    setValue(value) {
        if (!!value) {
            if (value.location == "0x01") {
                this.shadowRoot.getElementById("marker").classList.remove("checked");
                this.shadowRoot.getElementById("extra").innerHTML = "";
            } else {
                this.shadowRoot.getElementById("marker").classList.add("checked");
                if (value.location == "0x02") {
                    this.shadowRoot.getElementById("extra").innerHTML = `<hr>${I18n.translate("junk")}`;
                } else {
                    let loc = I18n.translate(value.location);
                    let itm = "";
                    if (value.item == "0x01") {
                        itm = I18n.translate("empty");
                    } else {
                        itm = I18n.translate(value.item);
                    }
                    this.shadowRoot.getElementById("extra").innerHTML = `<hr>${loc}<hr>${itm}`;
                }
            }
        }
    }

}

customElements.define('ootrt-poigossipstone', HTMLTrackerPOIGossipstone);

function hintstoneDialog(ref) {
    return new Promise(resolve => {
        let value = TrackerLocalState.read("gossipstones", ref, {item: "0x01", location: "0x01"});
        let data = GlobalData.get('hints', {locations: [], items: []});
    
        let lbl_loc = document.createElement('label');
        lbl_loc.style.display = "flex";
        lbl_loc.style.justifyContent = "space-between";
        lbl_loc.style.alignItems = "center";
        lbl_loc.style.padding = "5px";
        lbl_loc.innerHTML = I18n.translate("location");
        let slt_loc = document.createElement("select");
        slt_loc.appendChild(createOption("0x01", "["+I18n.translate("empty")+"]"));
        slt_loc.appendChild(createOption("0x02", "["+I18n.translate("junk")+"]"));
        for (let j = 0; j < data.locations.length; ++j) {
            let loc = data.locations[j];
            slt_loc.appendChild(createOption(loc, I18n.translate(loc)));
        }
        slt_loc.style.width = "200px";
        slt_loc.value = value.location;
        lbl_loc.appendChild(slt_loc);
    
        let lbl_itm = document.createElement('label');
        lbl_itm.style.display = "flex";
        lbl_itm.style.justifyContent = "space-between";
        lbl_itm.style.alignItems = "center";
        lbl_itm.style.padding = "5px";
        lbl_itm.innerHTML = I18n.translate("item");
        let slt_itm = document.createElement("select");
        slt_itm.appendChild(createOption("0x01", "["+I18n.translate("empty")+"]"));
        for (let j = 0; j < data.items.length; ++j) {
            let itm = data.items[j];
            slt_itm.appendChild(createOption(itm, I18n.translate(itm)));
        }
        slt_itm.style.width = "200px";
        slt_itm.value = value.item;
        lbl_itm.appendChild(slt_itm);
        
        let d = new Dialog({title: I18n.translate(ref), submit: true, cancel: true});
        d.onsubmit = function(ref, result) {
            if (!!result) {
                let res = {item: slt_itm.value, location: slt_loc.value};
                let data = GlobalData.get("locations")["overworld"][`gossipstones_v`][ref];
                TrackerLocalState.write("gossipstones", data.ref || ref, res);
                resolve(res);
            } else {
                resolve(false);
            }
        }.bind(this, ref);
        d.appendChild(lbl_loc);
        d.appendChild(lbl_itm);
        d.show();
    });
}