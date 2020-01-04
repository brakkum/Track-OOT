import GlobalData from "/script/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import "/deepJS/ui/Tooltip.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline;
            width: 32px;
            height: 32px;
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
            border: solid 4px black;
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
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.1em;
            flex-shrink: 0;
            margin-left: 0.3em;
            border: 0.1em solid var(--navigation-background-color, #ffffff);
            border-radius: 0.3em;
        }
        #badge deep-icon {
            width: 1em;
            height: 1em;
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

function locationUpdate(event) {
    if (this.ref === event.data.name && this.checked !== event.data.value) {
        EventBus.mute("chest");
        this.checked = event.data.value;
        EventBus.unmute("chest");
    }
}

function stateChanged(event) {
    EventBus.mute("chest");
    let value = !!event.data[this.ref];
    if (typeof value == "undefined") {
        value = false;
    }
    this.checked = value;
    EventBus.unmute("chest");
}

function logicUpdate(event) {
    if (event.data.hasOwnProperty(this.access)) {
        let el = this.shadowRoot.getElementById("marker");
        el.classList.toggle("avail", !!event.data[this.access]);
    }
}

class HTMLMarkerChest extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.addEventListener("click", this.check);
        this.addEventListener("contextmenu", this.uncheck);
        /* event bus */
        EVENT_BINDER.register("chest", locationUpdate.bind(this));
        EVENT_BINDER.register("state", stateChanged.bind(this));
        EVENT_BINDER.register("logic", logicUpdate.bind(this));
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

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    get visible() {
        return this.getAttribute('visible');
    }

    set visible(val) {
        this.setAttribute('visible', val);
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let data = GlobalData.get(`world/locations/${this.ref}`);
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(this.ref);

                    this.access = data.access;
                    this.visible = data.visible;
                    
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    let left = parseFloat(this.style.left.slice(0, -1));
                    let top = parseFloat(this.style.top.slice(0, -1));
                    // TODO get map boundaries and clip to that
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

                    let el_type = document.createElement("deep-icon");
                    el_type.src = `images/chest.svg`;
                    this.shadowRoot.getElementById("badge").append(el_type);

                    let el_time = document.createElement("deep-icon");
                    el_time.src = `images/time_${data.time || "both"}.svg`;
                    this.shadowRoot.getElementById("badge").append(el_time);

                    let el_era = document.createElement("deep-icon");
                    if (!!data.child && !!data.adult) {
                        el_era.src = "images/era_both.svg";
                    } else if (!!data.child) {
                        el_era.src = "images/era_child.svg";
                    } else if (!!data.adult) {
                        el_era.src = "images/era_adult.svg";
                    } else {
                        el_era.src = "images/era_none.svg";
                    }
                    this.shadowRoot.getElementById("badge").append(el_era);
                    
                    let el = this.shadowRoot.getElementById("marker");
                    el.classList.toggle("avail", Logic.getValue(this.access));

                    this.checked = StateStorage.read(this.ref, false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("marker");
                        el.classList.toggle("avail", Logic.getValue(this.access));
                    }
                    StateStorage.write(this.ref, newValue === "false" ? false : !!newValue);
                    EventBus.trigger("chest", {
                        name: this.ref,
                        value: newValue
                    });
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

customElements.define('ootrt-marker-chest', HTMLMarkerChest);