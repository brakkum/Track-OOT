import GlobalData from "/script/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Tooltip.js";
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
        #badge emc-icon {
            width: 30px;
            height: 30px;
        }
    </style>
    <div id="marker"></div>
    <emc-tooltip position="top" id="tooltip">
        <div id="tooltiparea">
            <div id="text"></div>
            <div id="badge">
                <emc-icon id="badge-type" src="images/world/icons/location.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/world/era/none.svg"></emc-icon>
            </div>
        </div>
    </emc-tooltip>
`);

function locationUpdate(event) {
    if (this.ref === event.data.name && this.checked !== event.data.value) {
        EventBus.mute("location");
        this.checked = event.data.value;
        EventBus.unmute("location");
    }
}

function stateChanged(event) {
    EventBus.mute("location");
    let value = !!event.data[this.ref];
    if (typeof value == "undefined") {
        value = false;
    }
    this.checked = value;
    EventBus.unmute("location");
}

function logicUpdate(event) {
    if (event.data.hasOwnProperty(this.access)) {
        let el = this.shadowRoot.getElementById("marker");
        el.classList.toggle("avail", !!event.data[this.access]);
    }
}

export default class HTMLMarkerLocation extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.addEventListener("click", this.check);
        this.addEventListener("contextmenu", this.uncheck);
        /* event bus */
        EVENT_BINDER.register("location", locationUpdate.bind(this));
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

    get type() {
        return this.getAttribute('type');
    }

    set type(val) {
        this.setAttribute('type', val);
    }

    get era() {
        return this.getAttribute('era');
    }

    set era(val) {
        this.setAttribute('era', val);
    }

    get time() {
        return this.getAttribute('time');
    }

    set time(val) {
        this.setAttribute('time', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    get left() {
        return this.getAttribute('left');
    }

    set left(val) {
        this.setAttribute('left', val);
    }

    get top() {
        return this.getAttribute('top');
    }

    set top(val) {
        this.setAttribute('top', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked', 'type', 'era', 'time', 'access', 'left', 'top'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(this.ref);
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
                    EventBus.trigger("location", {
                        name: this.ref,
                        value: newValue
                    });
                }
            break;
            case 'type':
                if (oldValue != newValue) {
                    let el_type = this.shadowRoot.getElementById("badge-type");
                    el_type.src = `images/world/icons/${newValue}.svg`;
                }
            break;
            case 'era':
                if (oldValue != newValue) {
                    let el_era = this.shadowRoot.getElementById("badge-era");
                    el_era.src = `images/world/era/${newValue}.svg`;
                }
            break;
            case 'time':
                if (oldValue != newValue) {
                    let el_time = this.shadowRoot.getElementById("badge-time");
                    el_time.src = `images/world/time/${newValue}.svg`;
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("marker");
                    txt.classList.toggle("avail", Logic.getValue(newValue));
                }
            break;
            case 'top':
            case 'left':
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    if (this.left < 30) {
                        if (this.top < 30) {
                            tooltip = "bottomright";
                        } else if (this.top > 70) {
                            tooltip = "topright";
                        } else {
                            tooltip = "right";
                        }
                    } else if (this.left > 70) {
                        if (this.top < 30) {
                            tooltip = "bottomleft";
                        } else if (this.top > 70) {
                            tooltip = "topleft";
                        } else {
                            tooltip = "left";
                        }
                    } else {
                        if (this.top < 30) {
                            tooltip = "bottom";
                        } else {
                            tooltip = "top";
                        }
                    }
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

customElements.define('ootrt-marker-location', HTMLMarkerLocation);