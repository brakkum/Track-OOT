import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";
import Logic from "/script/util/Logic.js";
import Language from "/script/util/Language.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:hover) {
            background-color: var(--main-hover-color, #ffffff32);
        }
        .textarea {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            min-height: 35px;
            word-break: break-word;
        }
        .textarea:empty {
            display: none;
        }
        #text {
            display: flex;
            flex: 1;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
            color: #ffffff;
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #text[data-checked="true"] {
            color: var(--location-status-opened-color, #000000);
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
        #badge emc-icon {
            width: 25px;
            height: 25px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check<span class="menu-tip">(leftclick)</span></div>
        <div id="menu-uncheck" class="item">Uncheck<span class="menu-tip">(ctrl + rightclick)</span></div>
        <div class="splitter"></div>
        <div id="menu-logic" class="item">Show Logic</div>
        <div id="menu-logic-image" class="item">Create Logic Image</div>
    </emc-contextmenu>
    <div class="textarea">
        <div id="text"></div>
        <div id="badge">
            <emc-icon id="badge-type" src="images/icons/location.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
        </div>
    </div>
`);

const REG = new Map();
const TYPE = new WeakMap();
const LOGIC_ACTIVE = new WeakMap();

export default class ListLocation extends EventBusSubsetMixin(HTMLElement) {

    constructor(type) {
        super();
        LOGIC_ACTIVE.set(this, true);
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
        
        /* mouse events */
        this.addEventListener("click", event => {
            this.check();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            if (event.ctrlKey) {
                this.uncheck();
            } else {
                this.showContextMenu(event.clientX, event.clientY);
            }
            event.preventDefault();
            return false;
        });

        /* context menu */
        this.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            this.check();
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            this.uncheck();
            event.preventDefault();
            return false;
        });
        this.shadowRoot.getElementById("menu-logic").addEventListener("click", event => {
            let title = Language.translate(this.ref);
            LogicViewer.show(this.access, title);
        });
        this.shadowRoot.getElementById("menu-logic-image").addEventListener("click", event => {
            LogicViewer.printSVG(this.access);
        });
        /* event bus */
        this.registerGlobal(TYPE.get(this), event => {
            if (this.ref === event.data.name && this.checked !== event.data.value) {
                let textEl = this.shadowRoot.getElementById("text");
                textEl.dataset.checked = event.data.value;
                this.setCheckValue(event.data.value);
            }
        });
        this.registerGlobal("state", event => {
            let value = !!event.data[this.ref];
            let textEl = this.shadowRoot.getElementById("text");
            textEl.dataset.checked = value;
            this.setCheckValue(value);
        });
        this.registerGlobal("logic", event => {
            if (LOGIC_ACTIVE.get(this) && event.data.hasOwnProperty(this.access)) {
                let textEl = this.shadowRoot.getElementById("text");
                if (!!this.access && !!event.data[this.access]) {
                    textEl.dataset.state = "available";
                } else {
                    textEl.dataset.state = "unavailable";
                }
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        let textEl = this.shadowRoot.getElementById("text");
        let value = StateStorage.read(this.ref, false);
        textEl.dataset.checked = value;
        if (!!this.access && !!Logic.getValue(this.access)) {
            textEl.dataset.state = "available";
        } else {
            textEl.dataset.state = "unavailable";
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    static get observedAttributes() {
        return ['ref', 'access'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        let textEl = this.shadowRoot.getElementById("text");
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    textEl.innerHTML = Language.translate(this.ref);
                    textEl.dataset.checked = StateStorage.read(this.ref, false);
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    if (!!newValue && !!Logic.getValue(newValue)) {
                        textEl.dataset.state = "available";
                    } else {
                        textEl.dataset.state = "unavailable";
                    }
                }
            break;
        }
    }

    showContextMenu(x, y) {
        this.shadowRoot.getElementById("menu").show(x, y);
    }

    check() {
        this.setCheckValue(true);
    }
    
    uncheck() {
        this.setCheckValue(false);
    }

    setCheckValue(value) {
        let textEl = this.shadowRoot.getElementById("text");
        let oldValue = textEl.dataset.checked == "true";
        if (value != oldValue) {
            StateStorage.write(this.ref, value);
            textEl.dataset.checked = value;
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
            let ListType = REG.get(ref);
            return new ListType();
        }
        return new ListLocation(ref);
    }

}

ListLocation.registerType('location', ListLocation);
customElements.define('ootrt-list-location', ListLocation);