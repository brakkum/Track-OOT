import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/Tooltip.js";
import "/emcJS/ui/Icon.js";
import FileData from "/emcJS/storage/FileData.js";
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
        #item {
            margin-left: 5px;
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
            <div id="item"></div>
            <div id="badge">
                <emc-icon id="badge-type" src="images/icons/location.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
            </div>
        </div>
    </emc-tooltip>
`);

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check</div>
        <div id="menu-uncheck" class="item">Uncheck</div>
        <div class="splitter"></div>
        <div id="menu-associate" class="item">Set Item</div>
        <div id="menu-disassociate" class="item">Clear Item</div>
        <div class="splitter"></div>
        <div id="menu-logic" class="item">Show Logic</div>
        <div id="menu-logic-image" class="item">Create Logic Image</div>
    </emc-contextmenu>
`);

const TPL_MNU_ITM = new Template(`
    <emc-contextmenu id="menu">
        <ootrt-itempicker id="item-picker" grid="pickable"></ootrt-itempicker>
    </emc-contextmenu>
`);

const REG = new Map();
const TYPE = new WeakMap();
const MNU_CTX = new WeakMap();
const MNU_ITM = new WeakMap();

export default class MapLocation extends EventBusSubsetMixin(HTMLElement) {

    constructor(type) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        if (!!type) {
            let el_type = this.shadowRoot.getElementById("badge-type");
            el_type.src = `images/icons/${type}.svg`;
            type = `location_${type}`;
        } else {
            type = "location";
        }
        TYPE.set(this, type);

        /* context menu */
        let mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        let mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        let mnu_itm = document.createElement("div");
        mnu_itm.attachShadow({mode: 'open'});
        mnu_itm.shadowRoot.append(TPL_MNU_ITM.generate());
        let mnu_itm_el = mnu_itm.shadowRoot.getElementById("menu");
        MNU_ITM.set(this, mnu_itm);

        mnu_itm.shadowRoot.getElementById("item-picker").addEventListener("pick", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("item_location", this.ref, item);
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            this.check();
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            this.uncheck();
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            mnu_itm_el.show(mnu_ctx_el.left, mnu_ctx_el.top);
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-disassociate").addEventListener("click", event => {
            this.item = false;
            StateStorage.writeExtra("item_location", this.ref, false);
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-logic").addEventListener("click", event => {
            let title = Language.translate(this.ref);
            LogicViewer.show(this.access, title);
        });
        mnu_ctx.shadowRoot.getElementById("menu-logic-image").addEventListener("click", event => {
            LogicViewer.printSVG(this.access);
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            this.toggleCheckValue();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY)
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(type, event => {
            if (this.ref === event.data.name && this.checked !== event.data.value) {
                this.checked = event.data.value;
            }
        });
        this.registerGlobal("state", event => {
            let value = !!event.data.state[this.ref];
            if (typeof value == "undefined") {
                value = false;
            }
            this.checked = value;
            this.item = StateStorage.readExtra("item_location", this.ref, false);
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
        this.registerGlobal("statechange_item_location", event => {
            if (event.data.hasOwnProperty(this.ref)) {
                this.item = event.data[this.ref].newValue;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        let value = StateStorage.read(this.ref, false);
        this.checked = value;
        this.item = StateStorage.readExtra("item_location", this.ref, false);
        this.update();
        this.parentElement.parentElement.append(MNU_CTX.get(this));
        this.parentElement.parentElement.append(MNU_ITM.get(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        MNU_ITM.get(this).remove();
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

    get item() {
        return this.getAttribute('item');
    }

    set item(val) {
        this.setAttribute('item', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked', 'access', 'left', 'top', 'tooltip', 'item'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        let textEl = this.shadowRoot.getElementById("text");
        let itemEl = this.shadowRoot.getElementById("item");
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    textEl.innerHTML = Language.translate(newValue);
                    this.checked = StateStorage.read(newValue, false);
                    this.item = StateStorage.readExtra("item_location", newValue, false);
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
            case 'item':
                if (oldValue != newValue) {
                    itemEl.innerHTML = "";
                    if (!!newValue && newValue != "false") {
                        let el_icon = document.createElement("img");
                        let itemsData = FileData.get("items")[newValue];
                        const bgImage = Array.isArray(itemsData.images) ? itemsData.images[0] : itemsData.images;
                        el_icon.src = bgImage;
                        itemEl.append(el_icon);
                    }
                }
            break;
        }
    }

    check() {
        this.toggleCheckValue(true);
    }
    
    uncheck() {
        this.toggleCheckValue(false);
    }

    toggleCheckValue(value) {
        let oldValue = this.checked;
        oldValue = oldValue != null && oldValue != "false";
        if (value == null) {
            value = !oldValue;
        }
        if (!!value != oldValue) {
            StateStorage.write(this.ref, value);
            this.checked = value;
            this.triggerGlobal(TYPE.get(this), {
                name: this.ref,
                value: value
            });
        }
    }

    setFilterData(data) {
        let el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/icons/time_night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/icons/time_day.svg";
        } else {
            el_time.src = "images/icons/time_always.svg";
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