import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Tooltip.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/Logic.js";
import Language from "/script/util/Language.js";

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
        #marker[data-state="available"] {
            background-color: var(--location-status-available-color, #000000);
        }
        #marker[data-state="unavailable"] {
            background-color: var(--location-status-unavailable-color, #000000);
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
        .textarea {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 46px;
            word-break: break-word;
        }
        .textarea:empty {
            display: none;
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
        <div class="textarea">
            <div id="text"></div>
            <div id="badge">
                <emc-icon id="badge-type" src="images/world/icons/location.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/world/era/none.svg"></emc-icon>
            </div>
        </div>
    </emc-tooltip>
`);

const REG = new Map();
const TYPE = new WeakMap();

export default class MapLocation extends EventBusSubsetMixin(HTMLElement) {

    constructor(type) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        if (!!type) {
            let el_type = this.shadowRoot.getElementById("badge-type");
            el_type.src = `images/world/icons/${type}.svg`;
            type = `location_${type}`;
        } else {
            type = "location";
        }
        TYPE.set(this, type);
        
        /* mouse events */
        this.addEventListener("click", event => {
            this.check();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.uncheck();
            event.preventDefault();
            return false;
        });

        /* context menu */
        // TODO

        /* event bus */
        this.registerGlobal(type, event => {
            if (this.ref === event.data.name && this.checked !== event.data.value) {
                this.checked = event.data.value;
            }
        });
        this.registerGlobal("state", event => {
            let value = !!event.data[this.ref];
            if (typeof value == "undefined") {
                value = false;
            }
            this.checked = value;
        });
        this.registerGlobal("logic", event => {
            if (event.data.hasOwnProperty(this.access)) {
                let el = this.shadowRoot.getElementById("marker");
                if (!!this.access && !!event.data[this.access]) {
                    el.dataset.state = "available";
                } else {
                    el.dataset.state = "unavailable";
                }
            }
        });
    }

    async update() {
        if (!!this.access && !!Logic.getValue(this.access)) {
            this.shadowRoot.getElementById("marker").dataset.state = "available";
        } else {
            this.shadowRoot.getElementById("marker").dataset.state = "unavailable";
        }
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

    get tooltip() {
        return this.getAttribute('tooltip');
    }

    set tooltip(val) {
        this.setAttribute('tooltip', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked', 'access', 'left', 'top', 'tooltip'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(this.ref);
                    this.checked = StateStorage.read(this.ref, false);
                }
            break;
            case 'checked':
            case 'access':
                if (oldValue != newValue) {
                    this.update();
                }
            break;
            case 'top':
            case 'left':
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                }
            break;
            case 'tooltip':
                if (oldValue != newValue) {
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    tooltip.position = newValue;
                }
            break;
        }
    }

    check() {
        Logger.log(`check location "${this.ref}"`, "Location");
        StateStorage.write(this.ref, true);
        this.checked = true;
        EventBus.trigger(TYPE.get(this), {
            name: this.ref,
            value: true
        });
    }
    
    uncheck() {
        Logger.log(`uncheck location "${this.ref}"`, "Location");
        this.checked = false;
        StateStorage.write(this.ref, false);
        EventBus.trigger(TYPE.get(this), {
            name: this.ref,
            value: false
        });
    }

    setFilterData(data) {
        let el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/world/era/adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/world/era/child.svg";
        } else {
            el_era.src = "images/world/era/both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/world/time/night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/world/time/day.svg";
        } else {
            el_time.src = "images/world/time/always.svg";
        }
    }

    static registerType(ref, clazz) {
        if (REG.has(ref)) {
            throw new Error(`location type ${ref} already exists`);
        }
        REG.set(ref, clazz);
    }

    static createType(ref) {
        if (REG.has(ref)) {
            let MapType = REG.get(ref);
            return new MapType();
        }
        return new MapLocation(ref);
    }

}

MapLocation.registerType('location', MapLocation);
customElements.define('ootrt-map-location', MapLocation);