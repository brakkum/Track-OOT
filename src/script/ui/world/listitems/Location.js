import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";
import Logic from "/script/util/logic/Logic.js";
import Language from "/script/util/Language.js";
import "/script/ui/items/ItemPicker.js";

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
        .textarea + .textarea {
            margin-top: 5px;
        }
        #text {
            display: flex;
            flex: 1;
            align-items: center;
            color: #ffffff;
            -moz-user-select: none;
            user-select: none;
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
        #item {
            margin-left: 5px;
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
    <div class="textarea">
        <div id="text"></div>
        <div id="item"></div>
        <div id="badge">
            <emc-icon id="badge-type" src="images/icons/location.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
        </div>
    </div>
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

export default class ListLocation extends EventBusSubsetMixin(HTMLElement) {

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
        
        /* mouse events */
        this.addEventListener("click", event => {
            if (this.checked == "true") {
                this.uncheck();
            } else {
                this.check();
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(TYPE.get(this), event => {
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
            if (event.data.extra["item_location"] != null && event.data.extra["item_location"][this.ref] != null) {
                this.item = event.data.extra["item_location"][this.ref];
            }
        });
        this.registerGlobal("statechange", event => {
            if (event.data.hasOwnProperty(this.ref)) {
                let value = !!event.data[this.ref].newValue;
                this.checked = value;
            }
        });
        this.registerGlobal("logic", event => {
            if (event.data.hasOwnProperty(this.access)) {
                let textEl = this.shadowRoot.getElementById("text");
                if (!!this.access && !!event.data[this.access]) {
                    textEl.dataset.state = "available";
                } else {
                    textEl.dataset.state = "unavailable";
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
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        el.append(MNU_ITM.get(this));
        // update state
        let textEl = this.shadowRoot.getElementById("text");
        let value = StateStorage.read(this.ref, false);
        textEl.dataset.checked = !!value;
        if (!!this.access && !!Logic.getValue(this.access)) {
            textEl.dataset.state = "available";
        } else {
            textEl.dataset.state = "unavailable";
        }
        this.item = StateStorage.readExtra("item_location", this.ref, false);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        MNU_ITM.get(this).remove();
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

    get item() {
        return this.getAttribute('item');
    }

    set item(val) {
        this.setAttribute('item', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked', 'access', 'item'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        let textEl = this.shadowRoot.getElementById("text");
        let itemEl = this.shadowRoot.getElementById("item");
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    textEl.innerHTML = Language.translate(newValue);
                    textEl.dataset.checked = StateStorage.read(newValue, false);
                    this.item = StateStorage.readExtra("item_location", newValue, false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    textEl.dataset.checked = newValue;
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
        if (this.checked != "true") {
            StateStorage.write(this.ref, true);
            this.checked = true;
            this.triggerGlobal(TYPE.get(this), {
                name: this.ref,
                value: true
            });
        }
    }
    
    uncheck() {
        if (this.checked == "true") {
            StateStorage.write(this.ref, false);
            this.checked = true;
            this.triggerGlobal(TYPE.get(this), {
                name: this.ref,
                value: false
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