import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline-flex;
            width: 48px;
            height: 48px;
            box-sizing: border-box;
            transform: translate(-24px, -24px);
        }
        :host(:hover) {
            z-index: 1000;
        }
        #marker {
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: solid 4px black;
            border-radius: 25%;
            color: black;
            font-size: 30px;
            font-weight: bold;
            cursor: pointer;
        }
        .opened {
            background-color: var(--location-status-opened-color, #000000);
        }
        .available {
            background-color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            background-color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            background-color: var(--location-status-possible-color, #000000);
        }
        #marker:hover {
            box-shadow: 0 0 2px 4px #67ffea;
        }
        #marker:hover + #tooltip {
            display: block;
        }
        #tooltip {
            padding: 5px 12px;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
            font-size: 30px;
        }
        #tooltiparea {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 46px;
        }
        #text {
            display: flex;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
        }
    </style>
    <div id="marker" class="unavailable"></div>
    <deep-tooltip position="top" id="tooltip">
        <div id="tooltiparea">
            <div id="text"></div>
        </div>
    </deep-tooltip>
`);

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

function locationUpdate(event) {
    if (this.ref === event.data.name.split('.')[0]) {
        this.update();
    }
}

function logicUpdate(event) {
    this.update();
}

function dungeonTypeUpdate(event) {
    if (this.ref === event.data.name) {
        this.update();
    }
}

class HTMLMarkerArea extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", () => EventBus.trigger("location_change", {
            name: this.ref
        }));
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        /* event bus */
        EVENT_BINDER.register(["chest", "skulltula"], locationUpdate.bind(this));
        EVENT_BINDER.register(["state", "settings", "logic"], logicUpdate.bind(this));
        EVENT_BINDER.register("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_BINDER.register("location_mode", event => this.mode = event.data.value);
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    static get observedAttributes() {
        return ['ref', 'mode'];
    }

    async update() {
        let val = await Logic.checkLogicList(this.ref);
        this.shadowRoot.getElementById("marker").className = translate(val);
        if (val > 0b001) {
            this.shadowRoot.getElementById("marker").innerHTML = await Logic.getAccessibleNumber(this.ref);
        } else {
            this.shadowRoot.getElementById("marker").innerHTML = "";
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            this.update();
            if (name == "ref") {
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
            }
        }
    }

}

customElements.define('ootrt-marker-area', HTMLMarkerArea);