import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
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
        :host([checked="true"]) #marker {
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
            display: flex;
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
    </style>
    <div id="marker"></div>
    <deep-tooltip position="top" id="tooltip">
        <div id="tooltiparea">
            <div id="text"></div>
            <div id="badge"></div>
        </div>
    </deep-tooltip>
`);

function locationUpdate(name, value) {
    if (this.ref === name && this.checked !== value) {
        EventBus.mute("location-update");
        this.checked = value;
        EventBus.unmute("location-update");
    }
}

function itemUpdate(name, value) {
    if (!this.checked || this.checked === "false") {
        let el = this.shadowRoot.getElementById("marker");
        let path = this.ref.split(".");
        if (Logic.checkLogic(path[1], path[2])) {
            el.classList.add("avail");
        } else {
            el.classList.remove("avail");
        }
    }
}

function globalUpdate() {
    let path = this.ref.split(".");
    EventBus.mute("location-update");
    this.checked = TrackerLocalState.read(path[1], path[2], false);
    EventBus.unmute("location-update");
    if (!this.checked || this.checked === "false") {
        checkLogic.apply(this);
    }
}

function checkLogic() {
    let path = this.ref.split(".");
    let el = this.shadowRoot.querySelector("div");
    if (Logic.checkLogic(path[1], path[2])) {
        el.classList.add("avail");
    } else {
        el.classList.remove("avail");
    }
}

class HTMLTrackerPOILocation extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        this.addEventListener("click", this.check);
        this.addEventListener("contextmenu", this.uncheck);
        EventBus.on("location-update", locationUpdate.bind(this));
        EventBus.on("item-update", itemUpdate.bind(this));
        EventBus.onafter("global-update", globalUpdate.bind(this));
        EventBus.onafter("location-era-change", checkLogic.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
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
                    let path = newValue.split('.');
                    let data = GlobalData.get("locations")["overworld"][`${path[1]}_v`][path[2]];
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(path[2]);
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

                    this.checked = TrackerLocalState.read(path[1], path[2], false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    let path = this.ref.split(".");
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("marker");
                        if (Logic.checkLogic(path[1], path[2])) {
                            el.classList.add("avail");
                        } else {
                            el.classList.remove("avail");
                        }
                    }
                    TrackerLocalState.write(path[1], path[2], newValue === "false" ? false : !!newValue);
                    EventBus.post("location-update", this.ref, newValue);
                }
            break;
        }
    }

    check(event) {
        Logger.log(`check location "${this.ref}"`, "Location");
        this.checked = true;
        if (!event) return;
        event.preventDefault();
        return false;
    }
    
    uncheck(event) {
        Logger.log(`uncheck location "${this.ref}"`, "Location");
        this.checked = false;
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-poilocation', HTMLTrackerPOILocation);