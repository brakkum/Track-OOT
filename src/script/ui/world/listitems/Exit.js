import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import Logic from "/script/util/logic/Logic.js";
import Language from "/script/util/Language.js";

const SettingsStorage = new IDBStorage('settings');

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
            color: #ffffff;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
        }
        #text[data-state="opened"] {
            color: var(--location-status-opened-color, #000000);
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #text[data-state="possible"] {
            color: var(--location-status-possible-color, #000000);
        }
        #hint {
            margin-left: 5px;
        }
        #hint img {
            width: 25px;
            height: 25px;
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
        <div id="badge">
            <emc-icon src="images/icons/entrance.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
        </div>
    </div>
    <div class="textarea">
        <div id="value"></div>
        <div id="hint"></div>
    </div>
`);

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check All</div>
        <div id="menu-uncheck" class="item">Uncheck All</div>
        <div class="splitter"></div>
        <div id="menu-associate" class="item">Set Entrance</div>
        <div class="splitter"></div>
        <div id="menu-setwoth" class="item">Set WOTH</div>
        <div id="menu-setbarren" class="item">Set Barren</div>
        <div id="menu-clearhint" class="item">Clear Hint</div>
    </emc-contextmenu>
`);

const TPL_MNU_EXT = new Template(`
    <style>
        #select {
            height: 300px;
            width: 300px;
        }
    </style>
    <emc-contextmenu id="menu">
        <emc-listselect id="select"></emc-listselect>
    </emc-contextmenu>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const ACTIVE = new WeakMap();
const EXIT = new WeakMap();
const AREA = new WeakMap();
const ACCESS = new WeakMap();
const MNU_CTX = new WeakMap();
const MNU_EXT = new WeakMap();

export default class ListExit extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        ACTIVE.set(this, []);
        EXIT.set(this, "");
        AREA.set(this, "");
        ACCESS.set(this, "");
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* context menu */
        let mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        let mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        let mnu_ext = document.createElement("div");
        mnu_ext.attachShadow({mode: 'open'});
        mnu_ext.shadowRoot.append(TPL_MNU_EXT.generate());
        let selectEl = mnu_ext.shadowRoot.getElementById("select");
        let mnu_ext_el = mnu_ext.shadowRoot.getElementById("menu");
        MNU_EXT.set(this, mnu_ext);

        selectEl.addEventListener("change", event => {
            let exit = EXIT.get(this);
            if (exit != "") {
                StateStorage.writeExtra("exits", exit, event.value);
            }
        });
        selectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            let area = AREA.get(this);
            let data = FileData.get(`world/${area}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, true);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, true);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            let area = AREA.get(this);
            let data = FileData.get(`world/${area}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, false);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, false);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            mnu_ext_el.show(mnu_ctx_el.left, mnu_ctx_el.top);
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setwoth").addEventListener("click", event => {
            const area = AREA.get(this);
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", area, "woth");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setbarren").addEventListener("click", event => {
            const area = AREA.get(this);
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", area, "barren");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-clearhint").addEventListener("click", event => {
            const area = AREA.get(this);
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", area, "");
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const area = AREA.get(this);
            if (!!area) {
                this.triggerGlobal("location_change", {
                    name: area
                });
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
        this.registerGlobal("state", event => {
            let exit = EXIT.get(this);
            let active = ACTIVE.get(this);
            if (event.data.state.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data.state["option.entrance_shuffle"]) < 0;
            }
            if (event.data.extra.exits != null && event.data.extra.exits[exit] != null) {
                this.value = event.data.extra.exits[exit];
            } else {
                this.value = "";
            }
        });
        this.registerGlobal("randomizer_options", event => {
            let active = ACTIVE.get(this);
            if (event.data.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data["option.entrance_shuffle"]) < 0;
            }
            this.update();
        });
        this.registerGlobal("statechange_exits", event => {
            let exit = EXIT.get(this);
            let data;
            if (event.data != null) {
                data = event.data[exit];
            }
            if (data != null) {
                this.value = data.newValue;
                selectEl.value = data.newValue;
            }
        });
        this.registerGlobal("statechange_area_hint", event => {
            const area = AREA.get(this);
            let data;
            if (event.data != null) {
                data = event.data[area];
            }
            if (data != null) {
                this.hint = data.newValue;
            }
        });
        this.registerGlobal(["statechange", "statechange_dungeontype", "settings", "logic", "filter"], event => {
            this.update();
        });
        this.registerGlobal("exit", event => {
            if (this.ref === event.data.name && this.value !== event.data.value) {
                this.value = event.data.value;
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
        el.append(MNU_EXT.get(this));
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        MNU_EXT.get(this).remove();
    }

    async update() {
        const area = AREA.get(this);
        if (!!area) {
            let dType = StateStorage.readExtra("dungeontype", area, 'v');
            if (dType == "n") {
                let data_v = FileData.get(`world/${area}/lists/v`);
                let data_m = FileData.get(`world/${area}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
            } else {
                let data = FileData.get(`world/${area}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
            }
        } else {
            let access = ACCESS.get(this);
            if (!!access && (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`))) {
                this.shadowRoot.getElementById("text").dataset.state = "available";
            } else {
                this.shadowRoot.getElementById("text").dataset.state = "unavailable";
            }
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get hint() {
        return this.getAttribute('hint');
    }

    set hint(val) {
        this.setAttribute('hint', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'hint'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    const data = FileData.get(`world/marker/${newValue}`);
                    const exit = FileData.get(`world/exit/${data.access}`);
                    const entrances = FileData.get("world/exit");
                    const txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(data.access);
                    txt.setAttribute('i18n-content', data.access);
                    ACTIVE.set(this, exit.active);
                    EXIT.set(this, data.access);
                    ACCESS.set(this, data.access.split(" -> ")[1]);
                    this.value = StateStorage.readExtra("exits", data.access, "");
                    // options
                    const selectEl = MNU_EXT.get(this).shadowRoot.getElementById("select");
                    selectEl.value = this.value;
                    selectEl.innerHTML = "";
                    const empty = document.createElement('emc-option');
                    empty.value = "";
                    selectEl.append(empty);
                    for (const key in entrances) {
                        const value = entrances[key];
                        if (value.type == exit.type) {
                            const opt = document.createElement('emc-option');
                            opt.value = value.target;
                            opt.innerHTML = Language.translate(value.target);
                            opt.setAttribute('i18n-content', value.target);
                            selectEl.append(opt);
                        }
                    }
                    // update state
                    this.update();
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    const el = this.shadowRoot.getElementById("value");
                    if (!!newValue) {
                        let entrance = FileData.get(`world/exit/${newValue}`);
                        if (entrance == null) {
                            entrance = FileData.get(`world/exit/${newValue.split(" -> ").reverse().join(" -> ")}`)
                        }
                        el.innerHTML = Language.translate(newValue);
                        AREA.set(this, entrance.area);
                        this.hint = StateStorage.readExtra("area_hint", entrance.area, "");
                    } else {
                        el.innerHTML = "";
                        AREA.set(this, "");
                        this.hint = "";
                    }
                    this.update();
                }
            break;
            case 'hint':
                if (oldValue != newValue) {
                    const hintEl = this.shadowRoot.getElementById("hint");
                    hintEl.innerHTML = "";
                    if (!!newValue && newValue != "") {
                        const el_icon = document.createElement("img");
                        el_icon.src = `images/icons/area_${newValue}.svg`;
                        hintEl.append(el_icon);
                    }
                }
            break;
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

}

customElements.define('ootrt-list-exit', ListExit);